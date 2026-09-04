-- 2026-09-05 — Catch orders Lightspeed accepted but the till never picked up.
--
-- WHY: Friturist #1002 (2026-09-04 18:19) reached Lightspeed complete — 21 lines,
-- online order PROCESSED, 201 Created — yet its receipt sat at NEW forever while
-- #1003 sixteen minutes later went DONE instantly and printed. 18 such orders in 30
-- days (1%), 12 of them on the 7 Aug overload evening at Aalst. Invisible to Srova
-- because every step we own succeeded; Joef learned from the customer next morning.
-- LS decides DONE vs NEW the instant the receipt is created and never revisits it,
-- so one look ~3 minutes after the push is enough.
--
-- WHAT: n8n ls_receipt_watchdog (iXLz9UGoJkrWKKpk), every 2 min: for orders pushed
-- 3–25 min ago at active stores, GET /onlineordering/order/{id} -> receiptId, then
-- GET /financial/receipt/?date=&receiptId= -> status. NEW or WAITINGFORPAYMENT ->
-- dlq_alerts queue 'ls_receipt_stuck' (msg_id = LS order id, once), which the WhatsApp
-- notifier now forwards. Records every look in ls_receipt_watch.
-- Verified: dry-run of the generated CTE statement in a rolled-back transaction;
-- message rendered: "Order Shopify - #1002 is in Lightspeed complete, but the till
-- has NOT picked it up after 5 min - it will not print by itself. ..."

CREATE TABLE IF NOT EXISTS public.ls_receipt_watch (
  canonical_id  uuid PRIMARY KEY REFERENCES public.canonical_orders(id) ON DELETE CASCADE,
  ls_order_id   text NOT NULL,
  ls_receipt_id bigint,
  status        text,
  checks        int  NOT NULL DEFAULT 1,
  alerted       boolean NOT NULL DEFAULT false,
  checked_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.ls_receipt_watch IS
  'Receipt status seen in Lightspeed for each pushed order (workflow ls_receipt_watchdog). NEW = till never picked it up; WAITINGFORPAYMENT = items != payment. Either raises dlq_alerts queue ls_receipt_stuck once.';

CREATE OR REPLACE VIEW public.v_dlq_alerts_needing_human AS
SELECT da.id, da.queue_name, da.external_ref, da.location_key, da.created_at,
       COALESCE(da.last_error->>'message', da.last_error::text) AS message,
       COALESCE(da.last_error->>'runbook', '')                  AS runbook
FROM public.dlq_alerts da
WHERE da.queue_name IN ('q_orders_push_ls','q_orders_normalize','takeaway_accept',
                        'takeaway_aged_out','q_orders_push_shipday','ls_receipt_stuck')
  AND da.resolved_at IS NULL
  AND da.created_at > now() - INTERVAL '2 hours'
  AND NOT EXISTS (SELECT 1 FROM public.dlq_alert_notifications n WHERE n.dlq_alert_id = da.id);

-- Same day, data fix: takeaway_plu_map LOC_AALST 'Chicken cheeseburger' -> B12
-- (Berlare already used B12 for the identical name; Aalst B12 = "Chicken cheese").
