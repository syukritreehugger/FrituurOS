import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getWorkflow, getTakeawayPollersStatus, LS_PUSHER_ID } from '@/lib/n8n';

export type IntegrationStatus =
  | 'operational'
  | 'degraded'
  | 'down'
  | 'investigating';

export interface IntegrationRow {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastEvent: string;
}

export interface MenuSyncRow {
  location_key: string;
  last_sync_at: string | null;
  changes: number;
  drift: number;
  status: 'auto' | 'manual' | 'down';
}

const SHOPIFY_WEBHOOK_IDS = [
  'OmJqbQdD0gmABLxr', // shopify_webhook_order_create  ← primary intake
  '2ESmow3WjbgLZVdN', // shopify_webhook_order_updated
  'F1ISBeZxtNJ8DBc4', // shopify_webhook_order_cancelled
  'UhXAnsub1l6t39uv', // shopify_webhook_order_fulfilled
  '8DzRy1GjkwvDDrnh', // shopify_webhook_refund_create
];


const LS_POLLER_ID = '0i4SS4CHZo1h2Poj'; // poller_q_orders_normalize

export async function getIntegrationHealth(): Promise<IntegrationRow[]> {
  if (
    process.env['NEXT_PUBLIC_USE_MOCK_DATA'] === '1' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return [];
  }
  // Internal operational signals (ls_tokens, raw_orders.hmac_valid) live behind RLS
  // that only service_role can read. The UI just needs to display state — no PII.
  const supabase = createServiceClient();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [hmacFails, lsTokens, shopifyWfs, lsPusherWf, lsPollerWf, takeawayTokens, takeawayPollerWf, takeawayLastOrder] =
    await Promise.all([
      supabase
        .from('raw_orders')
        .select('id', { count: 'exact', head: true })
        .eq('hmac_valid', false)
        .gte('received_at', since24h),
      supabase
        .from('ls_tokens')
        .select('location_key, expires_at, updated_at'),
      Promise.all(SHOPIFY_WEBHOOK_IDS.map((id) => getWorkflow(id))),
      getWorkflow(LS_PUSHER_ID),
      getWorkflow(LS_POLLER_ID),
      supabase
        .from('takeaway_tokens')
        .select('account_name, location_key, token_expires_at, refresh_expires_at, updated_at'),
      getTakeawayPollersStatus(),
      supabase
        .from('raw_orders')
        .select('received_at')
        .eq('source', 'takeaway')
        .order('received_at', { ascending: false })
        .limit(1),
    ]);

  // ── Shopify ──
  const hmacBad = hmacFails.count ?? 0;
  const shopifyActive = shopifyWfs.filter((r) => r.ok && r.data.active).length;
  const shopifyTotal = SHOPIFY_WEBHOOK_IDS.length;

  let shopifyStatus: IntegrationStatus = 'operational';
  if (hmacBad >= 5) shopifyStatus = 'down';
  else if (hmacBad > 0 || shopifyActive < shopifyTotal) shopifyStatus = 'degraded';

  const shopifyDesc =
    shopifyActive === shopifyTotal
      ? `${shopifyTotal} webhook handlers active`
      : `${shopifyActive}/${shopifyTotal} handlers active`;

  let shopifyEvent = 'all clear 24h';
  if (hmacBad > 0) shopifyEvent = `${hmacBad} HMAC failures`;
  else if (shopifyActive < shopifyTotal)
    shopifyEvent = `${shopifyTotal - shopifyActive} handler(s) paused`;

  // ── Lightspeed ──
  const tokens = (lsTokens.data ?? []) as Array<{
    location_key: string;
    expires_at: string | null;
    updated_at: string | null;
  }>;

  const now = Date.now();
  const validTokens = tokens.filter(
    (t) => t.expires_at && new Date(t.expires_at).getTime() > now,
  ).length;

  const pusherActive = lsPusherWf.ok && lsPusherWf.data.active;
  const pollerActive = lsPollerWf.ok && lsPollerWf.data.active;

  let lsStatus: IntegrationStatus = 'operational';
  if (tokens.length === 0) lsStatus = 'down';
  else if (validTokens < tokens.length) lsStatus = 'degraded';
  if (!pusherActive || !pollerActive) {
    lsStatus = lsStatus === 'down' ? 'down' : 'degraded';
  }

  const workflowNote = pusherActive && pollerActive
    ? 'workflows active'
    : !pusherActive && !pollerActive
      ? 'workflows paused'
      : 'partial workflows paused';

  const lsDesc = `${validTokens}/${tokens.length} tokens valid · ${workflowNote}`;

  let lsEvent = 'all clear';
  if (!pusherActive || !pollerActive) lsEvent = 'pipeline paused';
  else if (validTokens < tokens.length) lsEvent = 'token(s) expired';

  // ── Takeaway.com ──
  const taTokens = (takeawayTokens.data ?? []) as Array<{
    account_name: string;
    location_key: string;
    token_expires_at: string | null;
    refresh_expires_at: string | null;
    updated_at: string | null;
  }>;

  let takeawayStatus: IntegrationStatus = 'operational';
  let takeawayDesc = 'Not configured';
  let takeawayEvent = '—';

  if (taTokens.length === 0) {
    // Treat as neutral "not configured" — Takeaway may not be used at every location.
    takeawayStatus = 'operational';
    takeawayDesc = 'Not configured';
    takeawayEvent = '—';
  } else {
    const refreshExp = taTokens
      .map((t) => (t.refresh_expires_at ? new Date(t.refresh_expires_at).getTime() : 0))
      .reduce((min, t) => (t > 0 && t < min ? t : min), Number.MAX_SAFE_INTEGER);

    const refreshExpired = refreshExp < now;
    const refreshSoon = refreshExp < now + 7 * 24 * 60 * 60 * 1000;
    const pollerActiveT = takeawayPollerWf.ok && takeawayPollerWf.allActive;
    const accountList = taTokens.map((t) => `${t.account_name}→${t.location_key}`).join(', ');

    if (refreshExpired) takeawayStatus = 'down';
    else if (refreshSoon || !pollerActiveT) takeawayStatus = 'degraded';

    const lastOrders = (takeawayLastOrder.data ?? []) as Array<{ received_at: string }>;
    const lastRcv = lastOrders[0]?.received_at;

    const pollerNote = takeawayPollerWf.ok
      ? `${takeawayPollerWf.active}/${takeawayPollerWf.total} pollers active`
      : 'poller status unknown';
    takeawayDesc = `${taTokens.length} account${taTokens.length === 1 ? '' : 's'} (${accountList}) · ${pollerNote}`;

    if (refreshExpired) {
      takeawayEvent = 'Refresh token expired — re-seed required';
    } else if (refreshSoon) {
      const days = Math.max(0, Math.round((refreshExp - now) / (24 * 60 * 60 * 1000)));
      takeawayEvent = `Refresh token expires in ${days}d`;
    } else if (lastRcv) {
      const ageMin = Math.max(0, Math.round((now - new Date(lastRcv).getTime()) / 60000));
      if (ageMin < 60) takeawayEvent = `Last order ${ageMin}m ago`;
      else if (ageMin < 1440) takeawayEvent = `Last order ${Math.round(ageMin / 60)}h ago`;
      else takeawayEvent = `Last order ${Math.round(ageMin / 1440)}d ago`;
    } else {
      takeawayEvent = 'No orders received yet';
    }
  }

  return [
    {
      id: 'shopify',
      name: 'Shopify webhooks',
      description: shopifyDesc,
      status: shopifyStatus,
      lastEvent: shopifyEvent,
    },
    {
      id: 'takeaway',
      name: 'Takeaway.com',
      description: takeawayDesc,
      status: takeawayStatus,
      lastEvent: takeawayEvent,
    },
    {
      id: 'lightspeed',
      name: 'Lightspeed L-Series',
      description: lsDesc,
      status: lsStatus,
      lastEvent: lsEvent,
    },
  ];
}

export async function getMenuSyncStatus(): Promise<{
  lastSyncAt: string | null;
  rows: MenuSyncRow[];
}> {
  if (
    process.env['NEXT_PUBLIC_USE_MOCK_DATA'] === '1' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return { lastSyncAt: null, rows: [] };
  }
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('menu_sync_log')
    .select('location_key, finished_at, change_count, drift_count')
    .order('finished_at', { ascending: false })
    .limit(50);

  const rows = ((data ?? []) as Array<{
    location_key: string;
    finished_at: string | null;
    change_count: number | null;
    drift_count: number | null;
  }>);

  const seen = new Map<string, MenuSyncRow>();
  for (const r of rows) {
    if (seen.has(r.location_key)) continue;
    seen.set(r.location_key, {
      location_key: r.location_key,
      last_sync_at: r.finished_at,
      changes: r.change_count ?? 0,
      drift: r.drift_count ?? 0,
      status: (r.drift_count ?? 0) > 0 ? 'manual' : 'auto',
    });
  }

  const latest = rows
    .map((r) => r.finished_at)
    .filter((v): v is string => Boolean(v))
    .sort()
    .reverse()[0] ?? null;

  return { lastSyncAt: latest, rows: Array.from(seen.values()) };
}
