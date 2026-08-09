-- 2026-08-10 — Close the loop between "the alarm fired" and "a human was told".
--
-- WHY: on 2026-08-09 order 7XRKP3 (Tipzakske) was correctly blocked and alerted at
-- 19:01 — the item "Chicken cheeseburger" had no Lightspeed PLU, so the pipeline
-- refused to send a broken ticket. Detection worked exactly as designed. But the
-- alert stopped at the dashboard: nobody told Joef, and the kitchen only found out
-- the next morning. A safety net nobody reads is not a safety net.
--
-- WHAT: n8n workflow monitor_order_blocking_alerts (dkro02elPaocsc9u), schedule 3 min,
-- claims unnotified order-blocking alerts and WhatsApps Joef using the same template
-- and credential the existing "Alert <store> Update" workflows use (ops_alert_v1|en).
--
-- Design notes:
--   * The INSERT is the claim. Two overlapping runs can never send the same alert
--     twice, without needing a lock or a "sent" flag update that could be lost.
--   * takeaway_poll_silent and ls_token_expiry are deliberately EXCLUDED — the first
--     fires during normal quiet periods, the second is an engineer's problem. Alerting
--     on them would train Joef to ignore the channel, which is worse than not alerting.
--   * Service-hours guard 10:00-23:59 Brussels: no 04:00 messages for something the
--     kitchen cannot act on until it opens.

CREATE TABLE IF NOT EXISTS public.dlq_alert_notifications (
  dlq_alert_id bigint PRIMARY KEY REFERENCES public.dlq_alerts(id) ON DELETE CASCADE,
  channel      text        NOT NULL DEFAULT 'whatsapp',
  sent_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.dlq_alert_notifications IS
  'One row per dlq_alert already pushed to a human. Claimed atomically by monitor_order_blocking_alerts so a message is never sent twice, even if the workflow overlaps itself.';

CREATE OR REPLACE VIEW public.v_dlq_alerts_needing_human AS
SELECT da.id, da.queue_name, da.external_ref, da.location_key, da.created_at,
       COALESCE(da.last_error->>'message', da.last_error::text) AS message,
       COALESCE(da.last_error->>'runbook', '')                  AS runbook
FROM public.dlq_alerts da
WHERE da.queue_name IN ('q_orders_push_ls','q_orders_normalize','takeaway_accept',
                        'takeaway_aged_out','q_orders_push_shipday')
  AND da.resolved_at IS NULL
  AND da.created_at > now() - INTERVAL '2 hours'
  AND NOT EXISTS (SELECT 1 FROM public.dlq_alert_notifications n WHERE n.dlq_alert_id = da.id);

-- Verified 2026-08-10 in a rolled-back transaction: running the claim twice against
-- the same fresh alert sends once, then zero. Message rendering checked against four
-- real historical alerts, e.g.
--   Tipzakske | Order 7XRKP3 did NOT reach the POS. Reason: Cannot push to LS for
--               LOC_AALST: UNMAPPED:Chicken cheeseburger Please check the tablet
--               and handle it manually.
