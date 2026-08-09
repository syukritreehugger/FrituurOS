# Takeaway.com (Just Eat Takeaway) — Order Acceptance Contract

**Status:** derived and cross-verified 2026-08-09. **Not yet confirmed by a live order** — no JET order has
passed through `confirm-order` since the fix was deployed (stores were closed). Tomorrow's first order is the
real test; see §7.

**Basis:** reverse-engineered. We are NOT a certified JET partner and have no official documentation. Two
independent sources agree: JET's own restaurant-portal bundle (§2.1) and our production data (§2.2).

**Why this document exists:** on 2026-08-07 and 2026-08-08 JET orders stopped being auto-accepted at
Tipzakske (Aalst) and Frietbooster (Berlare). Staff accepted nearly every order by hand while customers
waited. Root cause: **we were calling the wrong endpoint.** This file records the real contract so it is
never guessed again.

---

## 1. TL;DR — how to accept a JET order

```http
POST https://live-orders-api.takeaway.com/api/orders/{order_id}/confirm-order
Authorization: Bearer <access_token from takeaway_tokens>
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
X-Timezone: Europe/Brussels

{
  "food_preparation_duration": 15,
  "delivery_time_duration": 25,
  "estimated_delivery_time": null
}
```

- `{order_id}` = the numeric `id` of the order detail object (**not** `public_reference`).
- Durations are **integer minutes**. `delivery_time_duration` is **`null`** for pickup orders.
- `estimated_delivery_time` is **always `null`** on the accept call — JET computes the ETA itself. All three
  keys are always present; the portal never omits one. Never send the string `"null"`.

**Do NOT use `PATCH /orders/{id} {"status": ...}` to accept.** That endpoint is for transitions *after*
acceptance. On an order in `new` it returns, for every target status:

```
403 {"message": "Wrong status transition!"}
```

That is exactly what caused the 2026-08-07/08 incident.

---

## 2. Evidence

### 2.1 JET's own portal code (primary)

Fetched from `https://live-orders.takeaway.com` → `/assets/index-D_IofYHW.js`
(2 667 175 bytes, md5 `f50adeba380d155b2612ad6cb616e639`, retrieved 2026-08-08).
Kept out of the working tree (single 631 KB line crashes editors/indexers); recoverable from git history at
commit `3ddbfa7`, and mirrored at `~/jet_bundle.js` / VPS `/tmp/jet_bundle.js`.
Curated slices: `TAKEAWAY-bundle-evidence-2026-08-08.md`, `TAKEAWAY-bundle-evidence-pass2.md`.

The three order-mutation functions, verbatim (`Hn` = axios wrapper, `di` = date-normalising mapper):

```js
// ACCEPT a new order
function UBe(e){
  const t = e.estimatedDeliveryTime ? e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z" : null;
  return Hn({url:`/orders/${e.id}/confirm-order`, method:"post",
    data:{ food_preparation_duration: e.cookingTime,
           delivery_time_duration:    e.deliveryDurationTime,
           estimated_delivery_time:   t }}).then(n=>di(n.data))
}
// MOVE an already-accepted order
function qBe(e){ return Hn({url:`/orders/${e.id}`, method:"patch", data:{status:e.status}}).then(t=>di(t.data)) }
// Report a problem with an order
function HBe(e){ return Hn({url:`/orders/${e.id}/issue-status`, method:"post",
    data:{status:"order_issue", partner_product_id_list:e.partnerProductIds, menu_product_id_list:…}}) }
```

**The load-bearing line for `estimated_delivery_time: null`:**

```js
can_change_confirmed_time_of_order(t){ return this.is_own_delivery && !t.is_cancelled && !t.is_delivered && !t.is_new }
```

The portal **cannot set a confirmed/estimated time while the order is `new`** — which is precisely the state
during acceptance. Therefore `e.estimatedDeliveryTime` is unset at that moment and `UBe` posts `null`.

**And for pickup:**

```js
can_change_delivery_duration_of_order(t){ return !this.is_courier_first && this.is_own_delivery && t.is_delivery }
```

For a pickup order this predicate is false for every restaurant type, so the delivery-duration control is
never rendered and the dialog has no value to send. `0` is a number the portal can never produce.

Date wire format helper: `.toISOString().split(".")[0] + "Z"` → **seconds precision, no milliseconds**,
e.g. `2026-08-09T18:35:00Z`.

### 2.2 Our own production data (corroborating)

`raw_orders.raw_payload` of orders **accepted by staff on the tablet** holds the values JET recorded.
Reading the durations as **minutes**:

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

**7 of 10 rows** match to the second (8 testable, 1 outlier, 2 not testable). Conclusions:

1. **Unit = minutes, type = integer.** Solid.
2. **Consistent with** JET computing `restaurant_estimated_delivery_time = confirmed_at + prep + deliv`
   server-side. Strong but not proof on its own — the tablet could send the same arithmetic. The *proof of
   record* for sending `null` is `can_change_confirmed_time_of_order` in §2.1.
3. JET **stores** `null` for `delivery_time_duration` on confirmed delivery orders. That is not the same as
   its validator accepting a `null` we POST. **All 10 rows are delivery + ASAP — zero pickup, zero preorder.**
4. F6X633's round `18:15:00` is a **post-acceptance** override by staff (they cannot set it while `new`), not
   evidence that an explicit time is sent at accept.

---

## 3. Order status — what is actually known

`ZO = [Jn.NEW, Jn.CONFIRMED, Jn.KITCHEN, Jn.IN_DELIVERY, Jn.DELIVERED, Jn.CANCELLED]` is the portal's
**display-ordering** array, not a server transition ladder. `CANCELLED` sits last, so a monotonic reading
would make cancellation unreachable from anywhere — it cannot be a ladder.

The one index comparison found (`Wpe`) is **client-side**, sitting beside the diffing helpers `F_`/`Vpe`; it
compares two order *objects* and is almost certainly stale-update suppression for socket/poll merges (purpose
inferred — the call site is not captured). **JET's server-side transition rule is unknown.**

**What production actually proves:** an order in `new` cannot be moved by `PATCH /orders/{id}` at all. Both
`{"status":"in_delivery"}` and `{"status":"confirmed"}` returned `403 {"message":"Wrong status transition!"}`
(23 alerts across 3 locations, 2026-08-08). Because the *adjacent* transition was refused too, **JET gates
acceptance by endpoint, not by ladder distance — there is no ladder-walking workaround.**
`POST /orders/{id}/confirm-order` is the only accept path.

Every other transition is **inferred and untested**. One has positive evidence of being conditional:

```js
can_update_status_of_order(t){ return !(this.is_unified_order_flow && t.is_confirmed && !t.is_ready_for_kitchen) }
```

For a unified-order-flow restaurant the portal will not even offer the `confirmed → kitchen` PATCH until JET
sets `is_ready_for_kitchen`. And `can_revert_order_status && is_in_delivery && is_in_kitchen` only means the
*client* tolerates a backwards entry in its list — not that the server accepts such a PATCH.

**Mechanism of the 2026-08-07 change: unverified.** One hypothesis the bundle hints at: since PATCH
permissions are order-flow dependent, a JET-side migration of these restaurants to `unified_order_flow` /
courier-first would change PATCH behaviour with no API version bump. Unverified.

### 3.1 Transitions Srova must NEVER send

Standing rule. After a successful `confirm-order`, **Srova's involvement with JET for that order ends.**

- ❌ `PATCH {"status":"kitchen"}` — kitchen state belongs to the store's own workflow
- ❌ `PATCH {"status":"in_delivery"}` — would falsely mark food as en route; couriers/JET own this
- ❌ `PATCH {"status":"delivered"}` / `{"status":"cancelled"}`
- ❌ `POST /orders/{id}/issue-status` — JET permits it; we never send it
- ❌ `PATCH /restaurant/setting/{key}`

### 3.2 Race with the tablet

JET pushes new orders to the tablet over websocket (`live-orders-socket.takeaway.com`) plus FCM web push;
**we poll every 5 minutes.** Losing the race to a staff member is expected and normal. Our accept will then
hit an already-`confirmed` order — treat that as benign, never as a failure.

---

## 4. The tablet alarm — why acceptance matters so much (CLOSED)

```js
txe = e => e.some(t => {
  if (!t.is_new) return false;
  const n = Tz(new Date, t.created_at);           // seconds since the order arrived
  const r = n % 120;
  return n > 5 && (r < 5 || r > 115);
});
// polled every 10 s; fires toast "have_you_accepted_order" + sound
```

The repeating nag is **keyed to `is_new`**. Once the order leaves `new` — i.e. as soon as `confirm-order`
succeeds — it stops. This is why two evenings of failed accepts were so painful in the store, and it is the
strongest reason to keep the accept path healthy.

A separate one-shot `incoming_order_sound` plays on arrival via the socket push. Sound choices live in
`ui_settings` (`incoming_order_sound`, `order_update_sound`, `other_notification_sound`).

**There is no auto-accept feature on JET's side** — zero occurrences of `auto_accept` / `autoAccept` in the
entire bundle. Automatic acceptance is only possible through the API, i.e. through us.

---

## 5. Transport, headers and error semantics

### 5.1 Client configuration

```js
const Hn = Dn.create({ baseURL: fr.apiUrl, headers:{
  "X-Requested-With":"XMLHttpRequest",
  "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
  "Content-Type":"application/json" }})
```

Request interceptor adds exactly four conditional headers:

```js
Hn.interceptors.request.use(async e=>{ const t=await c7(), n=await Che(), r=u7(), i=_n.getState().token;
  if(!t){ /* no token -> abort client-side */ }
  e.headers.Authorization=`Bearer ${t}`;
  i && (e.headers["X-pin-token"]=i);
  n && (e.headers["X-Restaurant-Id"]=n);
  r && r!=="default" && r!=="internal" && (e.headers["X-Tenant"]=r);
  const l = await G6e(); … })
```

| Header | Source | Do we send it? |
|---|---|---|
| `Authorization: Bearer` | mandatory; missing token aborts client-side | ✅ |
| `Content-Type: application/json` | static | ✅ |
| `X-Requested-With: XMLHttpRequest` | static | ✅ added 2026-08-09 |
| `X-Timezone` | static, from browser tz | ✅ added 2026-08-09 (`Europe/Brussels`) |
| `X-Restaurant-Id` | `sessionStorage/localStorage.selectedRestaurantId` | ❌ **deliberately not sent** — see below |
| `X-pin-token` | only when the restaurant has PIN protection | ❌ n/a unless PIN is enabled |
| `X-Tenant` | `u7()`; returns `default` for takeaway.com → **not sent** | ❌ correct to omit |
| (`G6e()`) | resolved: **a stub returning `{}`** — contributes nothing | — |

**On `X-Restaurant-Id`:** the portal sends it on every request because one login can manage several
restaurants. Our JET credentials are per-location (a separate account per store), and our `GET /orders`
polling works without it. Sending a *wrong* id is more dangerous than omitting it, and we have no verified
source for the value. **If the first live accept returns 403, this is candidate #1** — source the id from
`GET /restaurant` and retry.

There is **no response interceptor and no retry config**; axios timeout is the default (unlimited) — we set
10 s ourselves.

### 5.2 Error handling (the portal's own switch)

```js
switch (e.response?.status) {
  case 500: toast(message ?? server_error); return;
  case 422: toast(message ?? error); return;
  case 404: toast(message ?? not_found); return;
  case 403:
    if (e.response.data.reason === "pin_required") { invalidate ["restaurant"]; promptPin(); return }
    if (e.response?.data?.message === "Wrong status transition!") { invalidate ["orders"]; toast("Order status transition failed."); return }
    toast(message ?? forbidden); return;
  default: console.error(...)
}
```

Note the semantics of `Wrong status transition!`: the portal **refetches the order list** — it treats it as
"my view is stale", not as a fatal error. Our workflow should do the same: re-fetch, and if `confirmed_at` is
now set, someone else accepted it and there is nothing wrong.

**Idempotency: none.** The body is three fields, none a client-generated id; no request-id or dedup header
exists in any inspected slice. **Never blind-retry an accept** — a retry after a lost response may 403, 422,
or succeed and overwrite the customer's promised time (`can_change_confirmed_time_of_order` is *true* once an
order is `confirmed`). On timeout: alert, do not retry.

### 5.3 Endpoint inventory (order API, baseURL `https://live-orders-api.takeaway.com/api`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/orders` | live order list |
| GET | `/orders/{id}` | single order detail — use as the pre-retry status probe |
| GET | `/orders/history?date_from=&date_to=` | history |
| GET | `/orders/history/export/{exportType}` | export |
| POST | `/orders/{id}/confirm-order` | **accept** |
| PATCH | `/orders/{id}` | status transition after acceptance |
| POST | `/orders/{id}/issue-status` | report an order issue |
| GET | `/restaurant` | restaurant settings (PIN state, order_flow, delivery_service) |
| PATCH | `/restaurant/setting/{key}` | change a setting |
| POST | `/account/actualize` | session keep-alive |

A second axios instance (`x7`) targets JET's "smart gateway" on a different host — unrelated to orders.

---

## 6. Srova implementation

**Workflow:** `resolve_and_push_takeaway_order` (n8n `XNeJaLEPB6uB94Ra`).
Chain: `Insert raw_orders` → **`Build Accept Body`** → **`Accept Takeaway Order`** → **`Flag Accept Failure`**
→ `Alert Accept Failure`.

`Build Accept Body` (Code node) emits:

```js
{ food_preparation_duration: 15,
  delivery_time_duration: (delivery_type === 'delivery' ? 25 : null),
  estimated_delivery_time: null }
```

`Accept Takeaway Order` (HTTP) posts `{{ JSON.stringify($json.accept_body) }}` with the five headers of §5.1,
`fullResponse: true`, `neverError: true`, timeout 10 s. `JSON.stringify` guarantees a genuine JSON `null`
(never the string `"null"`).

`Flag Accept Failure` classifies exactly like the portal: reads `statusCode`, extracts `reason`/`message`,
and — **only when the fetched order status was `new`** — writes a `dlq_alerts` row
(`queue_name = 'takeaway_accept'`) containing `http_status`, `jet_reason`, `response_body`, **the exact
`request_body` we sent**, `order_status_fetched`, `delivery_type`, `detail_id`, and a runbook that branches on
`pin_required`. Failures on already-`confirmed` orders are ignored on purpose (§3.2).

### Known gaps / deliberate choices

| Item | Status |
|---|---|
| `X-Restaurant-Id` | not sent — see §5.1. Candidate #1 if the first accept 403s |
| Hardcoded `15` / `25` | acceptable for now (matches what staff used on C4JFFV/YFTJK3/TVRWQ6) but these set the **customer's promised time**; move to `dim_location` when there is time (staff also used 10/15 and 10/35) |
| Pickup `null` | **unverified** — zero pickup rows exist. If a pickup order 422s, try `0` |
| Preorder | **unverified** — zero preorder rows. Watch whether JET anchors the ETA to `requested_time` |
| Token refresh timing | JET access tokens last ~5 min; we load the token at the top of the workflow. If a 401 appears, refresh immediately before the accept node |
| Alert gate | fires only when fetched status was `new`; consider inverting to "alert unless `confirmed_at` is now set" so an unreadable status cannot silently suppress an alert |

---

## 7. Verification checklist for the first live order

```sql
-- 1. JET accepted it WITHOUT a human touching the tablet
SELECT raw_payload->>'public_reference' AS ref,
       raw_payload->>'status'           AS status,
       raw_payload->>'confirmed_at'     AS confirmed_at,
       raw_payload->>'food_preparation_duration' AS prep,
       raw_payload->>'delivery_time_duration'    AS deliv,
       raw_payload->>'restaurant_estimated_delivery_time' AS est_delivery,
       raw_payload->>'delivery_type'    AS type
FROM raw_orders
WHERE source='takeaway' AND received_at > now() - interval '1 hour'
ORDER BY id DESC LIMIT 5;

-- 2. No accept alert
SELECT id, created_at, last_error FROM dlq_alerts
WHERE queue_name='takeaway_accept' AND created_at > now() - interval '1 hour';

-- 3. Reached the POS
SELECT external_ref, status, ls_order_id FROM canonical_orders
WHERE source='takeaway' AND created_at > now() - interval '1 hour'
ORDER BY created_at DESC LIMIT 5;
```

**PASS requires all five:**

| # | Field | Required |
|---|---|---|
| 1 | `confirmed_at` | non-null, **within seconds of our n8n execution** (minutes later ⇒ staff did it) |
| 2 | `status` | anything other than `new` |
| 3 | `food_preparation_duration` / `delivery_time_duration` | `15` / `25` — our values echoed back proves *we* accepted |
| 4 | `restaurant_estimated_delivery_time` | non-null, ≈ `confirmed_at + 40 min`. **This is the acceptance test for sending `null`.** If it comes back null, JET does *not* compute it → send `now + prep + deliv` instead (never the stale pre-acceptance value) |
| 5 | `dlq_alerts` | zero `takeaway_accept` rows |

Watch specifically: **the first pickup order** and **the first preorder** (`requested_time` non-null) — both
are unverified.

### Symptom → cause → action

| Symptom | Cause | Action |
|---|---|---|
| `confirmed_at` set, durations 15/25, est ≈ +40 min, no alert | **Working** | Mark this document confirmed |
| `confirmed_at` set but durations ≠ 15/25 | Staff accepted first | Benign — expected race (§3.2) |
| `confirmed_at` set, `est_delivery` null | JET does not compute the ETA | Send `now + prep + deliv`; fix before next service |
| `403` `reason:"pin_required"` | PIN protection on the tablet | Not a status problem — ask Joef to check the tablet PIN |
| `403` `message:"Wrong status transition!"` | Re-fetch: `confirmed_at` set ⇒ race, benign. Still null ⇒ **contract changed again** | Read `request_body` + `response_body` from the alert; try adding `X-Restaurant-Id`; re-fetch the bundle |
| `422` / `400` | Payload rejected | Suspicion order: (1) pickup `null` → try `0`; (2) `estimated_delivery_time: null` → try a timestamp; (3) stringified numerics |
| `401` | Token expired between poll and accept | Refresh immediately before the accept node |
| 200 but status stays `new` | Never observed | **Do not retry** (§5.2). Alert, capture, escalate |
| Timeout | Unknown whether it landed | **Do not retry** — no idempotency; a duplicate may rewrite the promised time |
| Works at Aalst, 403s at Berlare/Dender | Server rule may vary per location / `delivery_service` | Verify per location — Aalst passing does not prove Berlare |

---

## 8. Standing risks

1. **We are not a certified JET partner.** JET can tighten this API without notice — exactly what happened on
   2026-08-07. Deliverect was unaffected because certified partners get advance notice. **Partner
   certification is the only structural fix** (it would also unlock menu/price push, removing the manual work
   in `docs/plans/2026-08-05-price-sync-worklist.xlsx`).
2. The bundle hash is a canary for **client** changes only — it would *not* have caught the 2026-08-07
   server-side tightening. **The `takeaway_accept` alarm is the real canary. Keep it healthy above all else.**
3. Server behaviour may vary per location or `delivery_service`; verify each store separately.
4. `15` / `25` set the customer's promised time. Move to `dim_location` rather than editing the node.

---

## 9. Incident timeline

| When | What |
|---|---|
| until 2026-08-06 | `PATCH {"status":"in_delivery"}` accepted orders fine for months |
| 2026-08-07 evening | every accept 403s `Wrong status transition!`; `continueOnFail` swallowed it → silent. Staff accept nearly all orders manually. Joef: *"It was a disaster today"* |
| 2026-08-08 01:23 UTC | tried `{"status":"confirmed"}` + added the accept-failure alarm |
| 2026-08-08 14:40–19:10 UTC | the alarm proves `confirmed` is rejected too — 23 alerts, 3 locations |
| 2026-08-08 19:28 UTC | switched to `POST /orders/{id}/confirm-order` after reverse-engineering the portal bundle |
| 2026-08-09 | contract corroborated against production data; unknowns U1/U2/U5/U6/U7/U8 closed; node updated (null ETA, pickup null, portal headers, full response capture) |
| next service | **first live test** — §7 |
