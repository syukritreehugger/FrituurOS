-- 2026-08-09 — Make silent JET order loss visible.
--
-- WHY: the three takeaway pollers filter candidate orders with
--   AND i.placed_date >= NOW() - INTERVAL '30 minutes'
-- That guard is deliberate — it stops a poller that has been down from waking up and
-- re-pushing orders staff already printed by hand. But an order older than the window
-- produced ZERO rows and ZERO trace: "nothing to do" and "we lost one" looked identical,
-- and no alert could fire because there was nothing to fire on.
--
-- WHAT: the poller now classifies every order JET's /orders/history returns, records the
-- verdict, and only then returns the ones to process. check_takeaway_poll_health() —
-- already invoked every 10 minutes by monitor_takeaway_poll_health (tZw6iCD7hXDSKrxf) —
-- raises one alert per lost order, so no workflow needed a new node.
--
-- Applied to production 2026-08-09 ~02:15 UTC.
-- See docs/API Docs/TAKEAWAY-ACCEPT-CONTRACT.md section 10.

CREATE TABLE IF NOT EXISTS public.takeaway_poll_observations (
  id            bigserial PRIMARY KEY,
  location_key  text        NOT NULL,
  public_reference text     NOT NULL,
  detail_id     bigint,
  jet_status    text,
  placed_date   timestamptz,
  decision      text        NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  seen_count    integer     NOT NULL DEFAULT 1,
  CONSTRAINT takeaway_poll_obs_uniq UNIQUE (location_key, public_reference)
);

COMMENT ON TABLE public.takeaway_poll_observations IS
  'One row per JET order seen in /orders/history, with the poller''s decision. decision: process | already_known | aged_out | cancelled | status_<x>. aged_out is the silent-loss case worth alarming on.';

CREATE INDEX IF NOT EXISTS takeaway_poll_obs_decision_idx
  ON public.takeaway_poll_observations (decision, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS takeaway_poll_obs_last_seen_idx
  ON public.takeaway_poll_observations (last_seen_at DESC);

ALTER TABLE public.takeaway_poll_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS takeaway_poll_obs_read ON public.takeaway_poll_observations;
CREATE POLICY takeaway_poll_obs_read ON public.takeaway_poll_observations
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE VIEW public.v_takeaway_missed_orders AS
SELECT o.location_key, o.public_reference, o.detail_id, o.jet_status, o.placed_date,
       o.decision, o.first_seen_at, o.last_seen_at, o.seen_count,
       EXISTS (
         SELECT 1 FROM public.canonical_orders co
         WHERE co.source = 'takeaway'::public.order_source
           AND co.external_ref = 'Takeaway - ' || o.public_reference
       ) AS reached_canonical
FROM public.takeaway_poll_observations o
WHERE o.decision <> 'already_known'
ORDER BY o.last_seen_at DESC;

-- The matching poller change lives in the n8n node "Postgres Filter NEW orders" of
-- 86E91MXlXNDO5DA6 / nhPFskveanP465z9 / e4R3OlqGpDVG3DW2 (identical in all three) and is
-- reproduced here so the pair can be re-applied together:
--
--   WITH input AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS t(
--     public_reference text, id bigint, status text, placed_date timestamptz, cancelled_at timestamptz)),
--   classified AS (
--     SELECT i.public_reference, i.id, i.status, i.placed_date,
--       CASE
--         WHEN i.cancelled_at IS NOT NULL THEN 'cancelled'
--         WHEN i.status NOT IN ('new','confirmed','kitchen') THEN 'status_' || i.status
--         WHEN EXISTS (SELECT 1 FROM public.canonical_orders co
--                      WHERE co.source='takeaway'::public.order_source
--                        AND co.external_ref='Takeaway - '||i.public_reference
--                        AND co.status <> 'cancelled'::public.order_state) THEN 'already_known'
--         WHEN i.placed_date < NOW() - INTERVAL '30 minutes' THEN 'aged_out'
--         ELSE 'process'
--       END AS decision
--     FROM input i WHERE i.public_reference IS NOT NULL),
--   observed AS (
--     INSERT INTO public.takeaway_poll_observations
--       (location_key, public_reference, detail_id, jet_status, placed_date, decision)
--     SELECT '{{ $('Get Access Token').first().json.location_key }}',
--            c.public_reference, c.id, c.status, c.placed_date, c.decision
--     FROM classified c
--     ON CONFLICT (location_key, public_reference) DO UPDATE SET
--       last_seen_at = now(),
--       seen_count   = public.takeaway_poll_observations.seen_count + 1,
--       jet_status   = EXCLUDED.jet_status,
--       decision     = EXCLUDED.decision
--     RETURNING 1)
--   SELECT c.public_reference, c.id AS detail_id FROM classified c WHERE c.decision = 'process';
--
-- NOTE: location_key is interpolated with {{ }} INSIDE the query text, deliberately NOT
-- added as a second queryReplacement parameter. The existing $1 expression contains commas
-- in its source, and n8n comma-joins the expression list — a second parameter would shift
-- positions and produce "there is no parameter $N". Same trap as the 2026-08-06 incident.
