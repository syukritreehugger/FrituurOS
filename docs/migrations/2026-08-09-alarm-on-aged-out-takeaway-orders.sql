-- 2026-08-09 — check_takeaway_poll_health() also alarms on aged-out JET orders.
-- Companion to 2026-08-09-takeaway-poll-observability.sql. No n8n change required:
-- monitor_takeaway_poll_health (tZw6iCD7hXDSKrxf) already calls this every 10 minutes.
-- One alert per lost order, keyed on detail_id, so it cannot spam.
-- Authoritative definition dumped from production below.

CREATE OR REPLACE FUNCTION public.check_takeaway_poll_health()
 RETURNS TABLE(out_location_key text, out_age_minutes numeric, out_alert_inserted boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  rec RECORD;
  recent_alert_exists boolean;
  inserted boolean;
  new_msg_id bigint;
BEGIN
  ------------------------------------------------------------------
  -- 1. Existing check: the poller has gone quiet for too long.
  ------------------------------------------------------------------
  FOR rec IN
    SELECT v.location_key, v.age_minutes, v.last_takeaway_insert_at
    FROM public.v_takeaway_poll_health v
    WHERE v.is_anomaly = true
  LOOP
    -- Skip alerting outside Tipzakske service hours (11-22 Brussels)
    IF rec.location_key = 'LOC_AALST'
       AND (EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Europe/Brussels')::int NOT BETWEEN 11 AND 22)
    THEN
      out_location_key := rec.location_key;
      out_age_minutes := rec.age_minutes;
      out_alert_inserted := false;
      RETURN NEXT;
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM public.dlq_alerts da
      WHERE da.queue_name = 'takeaway_poll_silent'
        AND da.location_key = rec.location_key
        AND da.alerted_at > NOW() - INTERVAL '2 hours'
        AND da.resolved_at IS NULL
    ) INTO recent_alert_exists;

    IF recent_alert_exists THEN
      inserted := false;
    ELSE
      new_msg_id := EXTRACT(EPOCH FROM NOW())::bigint * 1000 + (abs(hashtext(rec.location_key)) % 1000);
      INSERT INTO public.dlq_alerts (
        queue_name, msg_id, location_key, source,
        last_error, attempt_count, alerted_at, created_at
      ) VALUES (
        'takeaway_poll_silent', new_msg_id, rec.location_key,
        'takeaway'::order_source,
        jsonb_build_object(
          'code','TAKEAWAY_POLL_SILENT',
          'message','No Takeaway canonical_orders inserts detected within expected polling window',
          'last_takeaway_insert_at', rec.last_takeaway_insert_at,
          'age_minutes', rec.age_minutes,
          'expected_max_gap_minutes', 45
        ),
        1, NOW(), NOW()
      )
      ON CONFLICT (queue_name, msg_id) DO NOTHING;
      inserted := true;
    END IF;

    out_location_key := rec.location_key;
    out_age_minutes := rec.age_minutes;
    out_alert_inserted := inserted;
    RETURN NEXT;
  END LOOP;

  ------------------------------------------------------------------
  -- 2. NEW: JET showed us an order we never processed. One alert per
  --    lost order, keyed on detail_id so it can never spam.
  ------------------------------------------------------------------
  FOR rec IN
    SELECT o.location_key, o.public_reference, o.detail_id, o.jet_status,
           o.placed_date, o.decision,
           EXTRACT(EPOCH FROM (NOW() - o.placed_date)) / 60 AS age_minutes
    FROM public.takeaway_poll_observations o
    WHERE o.decision = 'aged_out'
      AND o.last_seen_at > NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM public.canonical_orders co
        WHERE co.source = 'takeaway'::public.order_source
          AND co.external_ref = 'Takeaway - ' || o.public_reference
      )
  LOOP
    INSERT INTO public.dlq_alerts (
      queue_name, msg_id, external_ref, location_key, source,
      last_error, attempt_count, alerted_at, created_at
    ) VALUES (
      'takeaway_aged_out', COALESCE(rec.detail_id, 0),
      'Takeaway - ' || rec.public_reference, rec.location_key,
      'takeaway'::order_source,
      jsonb_build_object(
        'code','TAKEAWAY_AGED_OUT',
        'stage','takeaway_poll',
        'message', format(
          'JET order %s was visible in /orders/history but fell outside the 30-minute processing window and was never accepted or pushed to the POS.',
          rec.public_reference),
        'jet_status', rec.jet_status,
        'placed_date', rec.placed_date,
        'age_minutes', round(rec.age_minutes::numeric, 1),
        'runbook','Check the JET tablet: if staff already handled this order, insert a cancelled canonical row to block re-push. If NOT handled, it needs manual action now — the customer is waiting. Then find out why the poller missed its window (n8n worker restart? token failure? see takeaway_poll_observations).'
      ),
      1, NOW(), NOW()
    )
    ON CONFLICT (queue_name, msg_id) DO NOTHING;

    out_location_key := rec.location_key;
    out_age_minutes := round(rec.age_minutes::numeric, 1);
    out_alert_inserted := true;
    RETURN NEXT;
  END LOOP;
END;
$function$

