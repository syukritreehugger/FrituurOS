import { createClient } from '@/lib/supabase/server';
import { LOCATIONS, type LocationKey, type OrderState } from '@/lib/constants';

export interface DashboardKpis {
  ordersToday: number;
  revenueTodayCents: number;
  successRate24h: number;
  latencyP50ms: number;
  latencyP95ms: number;
  latencyP99ms: number;
  dlqDepth: number;
}

export interface LocationHealth {
  key: LocationKey;
  total: number;
  failed: number;
  successRate: number;
}

export interface HourlyOrders {
  hour: string;
  shopify: number;
  takeaway: number;
}

export interface LiveOrderRow {
  external_ref: string;
  source: string;
  location_key: string;
  status: OrderState;
  payment_total_cents: number;
  created_at: string;
}

interface PaymentJson {
  total_cents?: number;
}

function readTotalCents(payment: unknown): number {
  if (!payment || typeof payment !== 'object') return 0;
  const v = (payment as PaymentJson).total_cents;
  return typeof v === 'number' ? v : 0;
}

export interface DashboardStats {
  kpis: DashboardKpis;
  hourlyOrders: HourlyOrders[];
  pipelineCounts: Partial<Record<OrderState, number>>;
  locationHealth: LocationHealth[];
  errorsBySource: { source: string; count: number }[];
  successRate7d: number;
  successRate30d: number;
  liveOrders: LiveOrderRow[];
  isMock: boolean;
}

const TERMINAL_OK = ['ls_accepted', 'complete', 'shipday_sent'] as const;
const TERMINAL_FAIL = ['ls_failed', 'ls_rejected'] as const;

function isOk(status: string) {
  return (TERMINAL_OK as readonly string[]).includes(status);
}
function isFail(status: string) {
  return (TERMINAL_FAIL as readonly string[]).includes(status);
}

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 100;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function getMockStats(): DashboardStats {
  const hours: HourlyOrders[] = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
    const peak = i > 10 && i < 21;
    return {
      hour: d.toLocaleTimeString('nl-BE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Brussels',
      }),
      shopify: Math.floor(Math.random() * (peak ? 80 : 12)),
      takeaway: 0,
    };
  });
  return {
    kpis: {
      ordersToday: 87,
      revenueTodayCents: 187425,
      successRate24h: 99.2,
      latencyP50ms: 2100,
      latencyP95ms: 8400,
      latencyP99ms: 14200,
      dlqDepth: 2,
    },
    hourlyOrders: hours,
    pipelineCounts: {
      received: 2,
      normalized: 1,
      ls_sent: 3,
      ls_accepted: 847,
      complete: 612,
      cancelled: 4,
      ls_failed: 2,
    },
    locationHealth: [
      { key: 'LOC_AALST',   total: 312, failed: 1, successRate: 99.7 },
      { key: 'LOC_BERLARE', total: 245, failed: 0, successRate: 100 },
      { key: 'LOC_DENDER',  total: 198, failed: 1, successRate: 99.5 },
      { key: 'LOC_FRITURIST', total: 0, failed: 0, successRate: 100 },
    ],
    errorsBySource: [
      { source: 'shopify', count: 1 },
      { source: 'takeaway', count: 0 },
    ],
    successRate7d: 99.5,
    successRate30d: 98.8,
    liveOrders: [],
    isMock: true,
  };
}

export async function getDashboardStats(
  loc?: LocationKey
): Promise<DashboardStats> {
  if (
    process.env['NEXT_PUBLIC_USE_MOCK_DATA'] === '1' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return getMockStats();
  }

  const supabase = await createClient();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  function withLoc<Q extends { eq: (col: string, val: string) => Q }>(q: Q): Q {
    return loc ? q.eq('location_key', loc) : q;
  }

  const [
    stateRes,
    orders24hRes,
    latencyRes,
    status7dRes,
    status30dRes,
    dlqRes,
    liveRes,
  ] = await Promise.all([
    withLoc(supabase.from('canonical_orders').select('status, location_key').neq('status', 'cancelled')),
    withLoc(
      supabase
        .from('canonical_orders')
        .select('source, status, created_at, payment, location_key')
        .neq('status', 'cancelled')
        .gte('created_at', since24h)
    ),
    withLoc(
      supabase
        .from('v_pipeline_latency')
        .select('p50_ls_s, p95_ls_s, p99_ls_s, n, location_key')
        .gte('bucket', since24h)
    ),
    withLoc(
      supabase
        .from('canonical_orders')
        .select('status, location_key')
        .neq('status', 'cancelled')
        .gte('created_at', since7d)
    ),
    withLoc(
      supabase
        .from('canonical_orders')
        .select('status, location_key')
        .neq('status', 'cancelled')
        .gte('created_at', since30d)
    ),
    supabase
      .from('dlq_alerts')
      .select('id', { count: 'exact', head: true })
      .is('resolved_at', null),
    withLoc(
      supabase
        .from('canonical_orders')
        .select('external_ref, source, location_key, status, payment, created_at')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(8)
    ),
  ]);

  const allOrders = (stateRes.data ?? []) as { status: string; location_key: string }[];
  const orders24h = (orders24hRes.data ?? []) as {
    source: string;
    status: string;
    created_at: string;
    payment: unknown;
    location_key: string;
  }[];

  // Pipeline state counts
  const pipelineCounts: Partial<Record<OrderState, number>> = {};
  for (const o of allOrders) {
    pipelineCounts[o.status as OrderState] =
      (pipelineCounts[o.status as OrderState] ?? 0) + 1;
  }

  // KPIs
  const totalOrders24h = orders24h.length;
  const completed24h = orders24h.filter((o) => isOk(o.status)).length;
  const successRate24h = rate(completed24h, totalOrders24h);
  const revenueTodayCents = orders24h.reduce(
    (s, o) => s + readTotalCents(o.payment),
    0
  );

  // Errors by source (24h)
  const errorsBySource = ['shopify', 'takeaway'].map((src) => ({
    source: src,
    count: orders24h.filter((o) => o.source === src && isFail(o.status)).length,
  }));

  // Location health (respects loc filter — if filtered, only that location row)
  const locationHealth: LocationHealth[] = LOCATIONS.filter((l) =>
    loc ? l.key === loc : true
  ).map((l) => {
    const locOrders = allOrders.filter((o) => o.location_key === l.key);
    const failed = locOrders.filter((o) => isFail(o.status)).length;
    const ok = locOrders.filter((o) => isOk(o.status)).length;
    return {
      key: l.key,
      total: locOrders.length,
      failed,
      successRate: rate(ok, locOrders.length),
    };
  });

  // Hourly stacked (shopify vs takeaway), 24 buckets — local TZ labels
  const hourlyOrders: HourlyOrders[] = [];
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
    const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
    const hour = hourStart.toLocaleTimeString('nl-BE', {
      hour: '2-digit',
      timeZone: 'Europe/Brussels',
    });
    const inBucket = orders24h.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= hourStart.getTime() && t < hourEnd.getTime();
    });
    hourlyOrders.push({
      hour,
      shopify: inBucket.filter((o) => o.source === 'shopify').length,
      takeaway: inBucket.filter((o) => o.source === 'takeaway').length,
    });
  }

  // Latency from view, weighted by bucket sample count `n`. Source unit = seconds.
  type LatencyRow = {
    p50_ls_s: number | null;
    p95_ls_s: number | null;
    p99_ls_s: number | null;
    n: number | null;
  };
  const latencyBuckets = (latencyRes.data ?? []) as unknown as LatencyRow[];
  const totalN = latencyBuckets.reduce((s, b) => s + (b.n ?? 0), 0);
  const wavgMs = (key: 'p50_ls_s' | 'p95_ls_s' | 'p99_ls_s'): number => {
    if (totalN === 0) return 0;
    const sumS = latencyBuckets.reduce(
      (s, b) => s + (Number(b[key]) || 0) * (b.n ?? 0),
      0
    );
    return Math.round((sumS / totalN) * 1000);
  };

  const computeRate = (rows: { status: string }[] | null) => {
    if (!rows || rows.length === 0) return 100;
    const ok = rows.filter((r) => isOk(r.status)).length;
    return rate(ok, rows.length);
  };

  return {
    kpis: {
      ordersToday: totalOrders24h,
      revenueTodayCents,
      successRate24h,
      latencyP50ms: wavgMs('p50_ls_s'),
      latencyP95ms: wavgMs('p95_ls_s'),
      latencyP99ms: wavgMs('p99_ls_s'),
      dlqDepth: dlqRes.count ?? 0,
    },
    hourlyOrders,
    pipelineCounts,
    locationHealth,
    errorsBySource,
    successRate7d: computeRate(status7dRes.data),
    successRate30d: computeRate(status30dRes.data),
    liveOrders: ((liveRes.data ?? []) as unknown as Array<{
      external_ref: string;
      source: string;
      location_key: string;
      status: OrderState;
      payment: unknown;
      created_at: string;
    }>).map((r) => ({
      external_ref: r.external_ref,
      source: r.source,
      location_key: r.location_key,
      status: r.status,
      payment_total_cents: readTotalCents(r.payment),
      created_at: r.created_at,
    })),
    isMock: false,
  };
}
