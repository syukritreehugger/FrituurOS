import { createClient } from '@/lib/supabase/server';

export interface QueueMetric {
  queue_name: string;
  depth: number;
  visible_depth: number;
  oldest_msg_age_sec: number | null;
  newest_msg_age_sec: number | null;
  total_messages: number;
}

export interface PipelineBacklog {
  queues: QueueMetric[];
  total_depth: number;
  worst_age_sec: number;
  level: 'healthy' | 'warn' | 'critical';
  message: string | null;
}

const WATCHED_QUEUES = [
  'q_orders_normalize',
  'q_orders_push_ls',
  'q_orders_push_shipday',
  'q_orders_compensate', // consumer: shipday_compensate — a stuck cancel means a driver dispatched for a failed order
] as const;
const WARN_DEPTH = 50;
const WARN_AGE_SEC = 300; // 5 minutes
const CRITICAL_AGE_SEC = 1800; // 30 minutes

/**
 * Reads pgmq.metrics_all() for the Phase-1 queues that drive Shopify→LS push.
 * Surfaces depth + oldest message age so a banner can flag head-of-line blocking
 * (the same failure mode that hid the k6 pollution incident for 4 days on 2026-05-01).
 */
export interface RetryLadderStats {
  live: Record<string, number>;
  history_24h: Record<string, number>;
  dlq_depth: number;
}

export async function getRetryLadderStats(
  loc?: string
): Promise<RetryLadderStats> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('retry_ladder_stats', {
    p_location_key: loc ?? null,
  });

  if (error || !data) {
    return { live: {}, history_24h: {}, dlq_depth: 0 };
  }

  const result = data as RetryLadderStats;
  return {
    live: result.live ?? {},
    history_24h: result.history_24h ?? {},
    dlq_depth: result.dlq_depth ?? 0,
  };
}

export async function getPipelineBacklog(): Promise<PipelineBacklog> {
  const supabase = await createClient();

  // pgmq.metrics_all() returns SETOF pgmq.metrics_result.
  // Calling via .rpc requires a wrapper or .from. Easier: a tiny RPC wrapper
  // is set up at public.pgmq_metrics_phase1 (returns jsonb). Fallback: raw JSON.
  const { data, error } = await supabase.rpc('pgmq_metrics_phase1');

  if (error || !Array.isArray(data)) {
    return {
      queues: [],
      total_depth: 0,
      worst_age_sec: 0,
      level: 'healthy',
      message: null,
    };
  }

  const rows = (data as Array<{
    queue_name: string;
    queue_length: number | null;
    queue_visible_length: number | null;
    oldest_msg_age_sec: number | null;
    newest_msg_age_sec: number | null;
    total_messages: number | null;
  }>).filter((r) =>
    (WATCHED_QUEUES as readonly string[]).includes(r.queue_name)
  );

  const queues: QueueMetric[] = rows.map((r) => ({
    queue_name: r.queue_name,
    depth: Number(r.queue_length ?? 0),
    visible_depth: Number(r.queue_visible_length ?? 0),
    oldest_msg_age_sec: r.oldest_msg_age_sec,
    newest_msg_age_sec: r.newest_msg_age_sec,
    total_messages: Number(r.total_messages ?? 0),
  }));

  const total_depth = queues.reduce((s, q) => s + q.depth, 0);
  const worst_age_sec = queues.reduce(
    (m, q) => Math.max(m, q.oldest_msg_age_sec ?? 0),
    0
  );

  let level: PipelineBacklog['level'] = 'healthy';
  let message: string | null = null;

  if (worst_age_sec >= CRITICAL_AGE_SEC || total_depth >= WARN_DEPTH * 10) {
    level = 'critical';
    const ageMin = Math.round(worst_age_sec / 60);
    message = `Pipeline backlog kritis: ${total_depth} pesan tertahan, terlama ${ageMin}m. Cek poller_q_orders_normalize.`;
  } else if (worst_age_sec >= WARN_AGE_SEC || total_depth >= WARN_DEPTH) {
    level = 'warn';
    const ageMin = Math.max(1, Math.round(worst_age_sec / 60));
    message = `Pipeline backlog: ${total_depth} pesan tertahan, terlama ${ageMin}m.`;
  }

  return { queues, total_depth, worst_age_sec, level, message };
}
