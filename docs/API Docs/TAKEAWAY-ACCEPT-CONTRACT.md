# Takeaway.com (Just Eat Takeaway) — Order Acceptance Contract

**Status:** authoritative as of 2026-08-09. Reverse-engineered — we are NOT a certified JET partner and have
no official documentation. Two independent evidence sources agree (see §2).

**Why this document exists:** on 2026-08-07 and 2026-08-08 JET orders stopped being auto-accepted at
Tipzakske (Aalst) and Frietbooster (Berlare). Staff had to accept every order by hand on the tablet while
customers waited. Root cause: **we were calling the wrong endpoint.** This file records the real contract so
it is never guessed again.

---

## 1. TL;DR — how to accept a JET order

```http
POST https://live-orders-api.takeaway.com/api/orders/{order_id}/confirm-order
Authorization: Bearer <access_token from takeaway_tokens>
Content-Type: application/json
Accept: application/json

{
  "food_preparation_duration": 15,          // integer, MINUTES
  "delivery_time_duration": 25,             // integer, MINUTES (null for pickup)
  "estimated_delivery_time": null           // ISO-8601 "YYYY-MM-DDTHH:MM:SSZ" or null
}
```

`{order_id}` = the numeric `id` of the order detail object (NOT `public_reference`).

**Do NOT use `PATCH /orders/{id} {"status": ...}` to accept.** That endpoint only moves an order that is
already accepted further along the ladder. Calling it on a `new` order returns:

```
403 {"message": "Wrong status transition!"}
```

This is exactly the error that caused the 2026-08-07/08 incident.

---

## 2. Evidence

### 2.1 JET's own portal code (primary)

Fetched from the restaurant portal `https://live-orders.takeaway.com` →
`/assets/index-D_IofYHW.js` (2 667 175 bytes, md5 `f50adeba380d155b2612ad6cb616e639`, retrieved
2026-08-08). Curated slices kept at `~/jet_evidence.md` on the dev machine.

The three order-mutation functions, verbatim (`Hn` is their axios wrapper, `di` a date-normalising mapper):

```js
// ACCEPT a new order
function UBe(e){
  const t = e.estimatedDeliveryTime ? e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z" : null;
  return Hn({url:`/orders/${e.id}/confirm-order`, method:"post",
    data:{ food_preparation_duration: e.cookingTime,
           delivery_time_duration:    e.deliveryDurationTime,
           estimated_delivery_time:   t }}).then(n=>di(n.data))
}

// MOVE an already-accepted order along the ladder
function qBe(e){ return Hn({url:`/orders/${e.id}`, method:"patch", data:{status:e.status}}).then(t=>di(t.data)) }

// Report a problem with an order (e.g. out of stock)
function HBe(e){ return Hn({url:`/orders/${e.id}/issue-status`, method:"post",
    data:{status:"order_issue", partner_product_id_list:e.partnerProductIds, menu_product_id_list:…}}) }
```

Note the date format helper: `.toISOString().split(".")[0] + "Z"` → **seconds precision, no milliseconds**,
e.g. `2026-08-09T18:35:00Z`. When the portal has no explicit time it sends **`null`**.

### 2.2 Our own production data (corroborating, stronger)

`raw_orders.raw_payload` of orders that **staff accepted manually on the tablet** contains the values JET
itself recorded. Reading the durations as **minutes**:

| ref | type | prep | deliv | confirmed_at | est_delivery | confirmed_at + prep + deliv | match |
|---|---|---|---|---|---|---|---|
| C4JFFV | delivery | 15 | 25 | 19:55:36 | 20:35:36 | 20:35:36 | ✅ |
| YFTJK3 | delivery | 15 | 25 | 19:50:35 | 20:30:35 | 20:30:35 | ✅ |
| TVRWQ6 | delivery | 15 | 25 | 19:45:35 | 20:25:35 | 20:25:35 | ✅ |
| 6XTFJ7 | delivery | 10 | 15 | 15:07:42 | 15:32:42 | 15:32:42 | ✅ |
| DYMMKM | delivery | 10 | 15 | 14:08:11 | 14:33:11 | 14:33:11 | ✅ |
| YB8GVT | delivery | 10 | 15 | 17:58:55 | 18:23:55 | 18:23:55 | ✅ |
| GBK48D | delivery | 10 | 35 | 17:46:49 | 18:31:49 | 18:31:49 | ✅ |
| F6X633 | delivery | 10 | 35 | 17:20:19 | 18:15:00 | 18:05:19 | ⚠️ +581 s |
| PH3MQC | delivery | 10 | **null** | 16:05:01 | 16:55:31 | — | n/a |
| WPMGVX | delivery | 5 | **null** | 16:16:54 | 16:53:49 | — | n/a |

**7 of 8 testable rows match to the second.** Conclusions:

1. **Unit = minutes**, type = **integer**.
2. JET computes `restaurant_estimated_delivery_time` itself as `confirmed_at + prep + deliv`. We do not need
   to send it — and when we do send our own value it can disagree with JET's own arithmetic.
3. **`delivery_time_duration: null` is accepted** (PH3MQC, WPMGVX are confirmed delivery orders with null).
   So `null` is the correct value for pickup, not `0`.
4. The F6X633 outlier (est_delivery ~10 min later than the formula) is consistent with a staff member
   overriding the estimated time in the tablet UI — i.e. `estimated_delivery_time` **can** be sent explicitly
   and then wins over the computed value.

---

## 3. Order status ladder

From the bundle:

```js
[Jn.NEW, Jn.CONFIRMED, Jn.KITCHEN, Jn.IN_DELIVERY, Jn.DELIVERED, Jn.CANCELLED]
```

Transition validation compares the **index** of the current and target status in that array (forward-only),
with a `can_revert_order_status` restaurant flag allowing `in_delivery → kitchen`. Consequences:

| From | To | How |
|---|---|---|
| `new` | `confirmed` | **`POST /orders/{id}/confirm-order`** — the only way. `PATCH` is rejected. |
| `confirmed` | `kitchen` | `PATCH /orders/{id} {"status":"kitchen"}` |
| `kitchen` | `in_delivery` | `PATCH /orders/{id} {"status":"in_delivery"}` |
| any | `cancelled` | allowed (see `qBe`/cancel flow) |
| backwards | — | rejected unless `can_revert_order_status` |

Our pre-2026-08-07 code jumped `new → in_delivery` (index 0 → 3). JET tolerated this for months and then
started enforcing the ladder — hence the sudden breakage with no change on our side.

**What Srova sends:** only `confirm-order`. We deliberately do **not** PATCH to `kitchen` or `in_delivery`:
the kitchen state belongs to the store's own workflow and the courier/JET advances delivery states. Sending
`in_delivery` from our side would falsely mark food as en route.

---

## 4. Order object fields that matter

From the portal's order model (getters observed in the bundle):

| Field / getter | Meaning |
|---|---|
| `id` | numeric order id — **use this in URLs** |
| `public_reference` | 6-char customer-facing code (e.g. `C9XBGT`) — our `external_ref` suffix |
| `status` | `new` / `confirmed` / `kitchen` / `in_delivery` / `delivered` / `cancelled` |
| `is_asap` | `requested_time === null` |
| `is_preorder` | `requested_time !== null` — scheduled order |
| `is_pickup` / `is_delivery` | from `delivery_type` |
| `pickup_time` | `delivery_service_pickup_time \|\| restaurant_estimated_pickup_time` |
| `delivery_time` | `delivery_service_delivery_time \|\| restaurant_estimated_delivery_time` |
| `minutes_until_preorder` | countdown for scheduled orders |
| `acceptance_time` | time since `created_at` — drives the tablet's urgency alarm |
| `food_preparation_duration` / `delivery_time_duration` | **populated only after acceptance** |
| `confirmed_at` | **null until accepted** — our success signal |
| `is_ready_for_kitchen` | flag set by the store's own kitchen flow |

Date fields JET returns as strings and the portal normalises: `placed_date`, `created_at`, `cancelled_at`,
`requested_time`, `restaurant_estimated_pickup_time`, `delivery_service_pickup_time`,
`restaurant_estimated_delivery_time`, `delivery_service_delivery_time`.

The portal re-renders/alarms when any of the estimated-time fields **or** `status` change (function `Vpe`),
and ships alarm sounds `default_sound`, `airhorn`, `alert1..3`. A `new` order keeps alarming until its status
leaves `new` — which is precisely why a failed accept is so painful in the store.

---

## 5. Other endpoints seen in the portal

| Method | Path | Purpose |
|---|---|---|
| GET | `/orders` | live order list |
| GET | `/orders/{id}` | single order detail |
| GET | `/orders/history?date_from=&date_to=` | history |
| GET | `/orders/history/export/{exportType}` | export |
| POST | `/orders/{id}/confirm-order` | **accept** |
| PATCH | `/orders/{id}` | status transition after acceptance |
| POST | `/orders/{id}/issue-status` | report an order issue (e.g. unavailable products) |
| GET | `/restaurant` | restaurant settings |
| PATCH | `/restaurant/setting/{key}` | change a setting |

Base URL used by our integration: `https://live-orders-api.takeaway.com/api`.
Auth: `Authorization: Bearer <access_token>`; tokens live in `takeaway_tokens`, refreshed per poll
(access token TTL ≈ 5 min, refresh window ≈ 30 days).

---

## 6. Srova implementation

**Workflow:** `resolve_and_push_takeaway_order` (n8n id `XNeJaLEPB6uB94Ra`), node **Accept Takeaway Order**.

Current live configuration (deployed 2026-08-08 19:28 UTC):

```
POST https://live-orders-api.takeaway.com/api/orders/{{ $('Normalize Order').item.json.detail_id }}/confirm-order
Authorization: Bearer {{ token }}   Content-Type: application/json   Accept: application/json

{
  food_preparation_duration: 15,
  delivery_time_duration: (delivery_type === 'delivery' ? 25 : 0),
  estimated_delivery_time: <restaurant_estimated_delivery_time || _pickup_time || now+40min>, ISO sec-precision
}
```

**Verdict against the contract: correct on all load-bearing points** — endpoint, method, URL shape, auth,
field names, integer minutes. `15 + 25` also matches what staff themselves used on the most recent orders
(C4JFFV, YFTJK3, TVRWQ6).

Two refinements worth making (not blockers):

| # | Change | Evidence |
|---|---|---|
| 1 | pickup: send `delivery_time_duration: null` instead of `0` | PH3MQC/WPMGVX prove `null` is accepted; `0` is untested against JET's validator |
| 2 | send `estimated_delivery_time: null` and let JET compute it | the portal sends `null` by default, and §2.2 shows JET derives it as `confirmed_at + prep + deliv`; sending our own value risks disagreeing with JET's own display |

**Failure visibility:** node `Flag Accept Failure` → `Alert Accept Failure` inserts a `dlq_alerts` row
(`queue_name = 'takeaway_accept'`) whenever an accept fails on an order whose fetched status was `new`.
Failures on already-`confirmed` orders are ignored on purpose (our poller re-processes orders, and staff may
have accepted first). This alarm is what made the 2026-08-08 failures visible within minutes instead of
being discovered by the client the next morning.

---

## 7. Verification checklist for the first live order

After the next JET order arrives, check:

```sql
-- 1. JET accepted it: confirmed_at must be non-null on the NEXT poll of that order
SELECT raw_payload->>'public_reference', raw_payload->>'status',
       raw_payload->>'confirmed_at',
       raw_payload->>'food_preparation_duration',
       raw_payload->>'delivery_time_duration'
FROM raw_orders WHERE source='takeaway' ORDER BY id DESC LIMIT 3;

-- 2. No accept alert fired
SELECT * FROM dlq_alerts WHERE queue_name='takeaway_accept' AND created_at > now() - interval '1 hour';

-- 3. Order still reached the POS
SELECT external_ref, status, ls_order_id FROM canonical_orders
WHERE source='takeaway' ORDER BY created_at DESC LIMIT 3;
```

Success = `confirmed_at` filled **without a human touching the tablet**, `status` moved off `new`,
durations populated (15/25), and zero `takeaway_accept` alerts.

| Symptom | Cause | Action |
|---|---|---|
| 403 `Wrong status transition!` | order was already confirmed (staff/tablet won the race) | benign — verify `confirmed_at` is set; no code change |
| 403 on a `new` order | contract changed again | capture the full response body; re-fetch the portal bundle and re-derive §1 |
| 401 | JET token expired | check `takeaway_tokens` refresh workflow |
| 422 / 400 | payload rejected | most likely the duration fields — try `null` for `delivery_time_duration`, `null` for `estimated_delivery_time` |
| Accept OK but tablet still alarms | store-side device/notification setting | check the JET tablet, not the pipeline |

---

## 8. Standing risks

1. **We are not a certified JET partner.** JET can tighten or change this API without notice — exactly what
   happened on 2026-08-07. Deliverect was unaffected because certified partners are notified in advance.
   **Pursuing JET partner certification is the only structural fix** (also unlocks menu/price push, which
   would remove the manual price-sync work documented in `docs/plans/2026-08-05-price-sync-worklist.xlsx`).
2. The portal bundle hash is our canary: if `index-*.js` changes, re-run the derivation in §2.1 before
   assuming this document is still accurate.
3. Hardcoded `15 / 25` minutes sets the customer's promised time. If the stores want different defaults per
   location, move them to `dim_location` rather than editing the node.

---

## 9. Incident timeline (for reference)

| When | What |
|---|---|
| until 2026-08-06 | `PATCH /orders/{id} {"status":"in_delivery"}` accepted orders fine for months |
| 2026-08-07 evening | every accept returns 403 `Wrong status transition!`; `continueOnFail` swallowed it → silent. Staff accept ~all orders manually. Joef: "It was a disaster today" |
| 2026-08-08 01:23 UTC | tried `{"status":"confirmed"}` + added the accept-failure alarm |
| 2026-08-08 14:40–19:10 UTC | alarm proves `confirmed` is also rejected — 23 alerts across 3 locations |
| 2026-08-08 19:28 UTC | switched to `POST /orders/{id}/confirm-order` after reverse-engineering the portal bundle |
| 2026-08-09 | contract corroborated against production data (§2.2); this document written |
