# JET live-orders portal — complete vendored bundle + original sources

Everything the Just Eat Takeaway **restaurant portal** (`https://live-orders.takeaway.com`) serves, captured
2026-08-09, plus its **original TypeScript sources** recovered from the public sourcemap.

We are not a certified JET partner and have no official API documentation. This directory *is* our
documentation: what the portal itself does is the de-facto contract. It is the evidence behind
[`../TAKEAWAY-ACCEPT-CONTRACT.md`](../TAKEAWAY-ACCEPT-CONTRACT.md).

## What is here

| Path | What | Size | Safe to open? |
|---|---|---|---|
| `src/` | **156 original TypeScript/TSX source files** recovered from the sourcemap | 322 KB | ✅ yes — normal code, longest line 1 377 chars |
| `index.html` | portal entry document | 7 KB | ✅ |
| `manifest.json` | PWA manifest | 2 KB | ✅ |
| `style-Hww_4wf0.css` | stylesheet, re-wrapped to 1 651 lines | 188 KB | ✅ |
| `raw/index-D_IofYHW.js.gz` | the shipped minified bundle | 821 KB gz (2.6 MB raw) | ⚠️ gzipped on purpose |
| `raw/index-D_IofYHW.js.map.gz` | the sourcemap `src/` came from | 2.3 MB gz (9.9 MB raw) | ⚠️ gzipped on purpose |

**Read `src/` — not `raw/`.** The two files in `raw/` are single lines of 631 KB and 9.9 MB. Opening either
one in an editor, a search indexer or an AI agent's context loads that whole line at once; during this
investigation that repeatedly killed WSL with `Wsl/Service/E_UNEXPECTED`. They are stored gzipped so nothing
can wander into them by accident, while still being preserved byte-for-byte in case JET pulls them.

```bash
# only if you genuinely need the raw form
gunzip -c raw/index-D_IofYHW.js.gz > /tmp/jet_bundle.js
# and then never grep it unbounded:
grep -oE '.{0,200}confirm-order.{0,300}' /tmp/jet_bundle.js | head -c 3000
```

## Provenance

| | |
|---|---|
| Source | `https://live-orders.takeaway.com` |
| Bundle | `/assets/index-D_IofYHW.js` — 2 667 175 bytes, md5 `f50adeba380d155b2612ad6cb616e639` |
| Sourcemap | `/assets/index-D_IofYHW.js.map` — 9 882 143 bytes, **publicly served** |
| Retrieved | 2026-08-08 (bundle) / 2026-08-09 (full capture incl. sourcemap) |

The sourcemap carries `sourcesContent`, i.e. the actual pre-minification source. Of its 1 057 entries, 177 are
JET's own files (the rest are `node_modules`); 156 of those are text and are extracted into `src/`.

## Map of `src/` — where to look for what

### The API layer — `src/shared/api/`

| File | Contains |
|---|---|
| **`orders.ts`** | **`confirmOrderApi` (the accept call)**, `updateOrderStatusApi`, `createOrderIssueApi`, `getOrdersApi`, history + export |
| `restaurants.ts` | `GET /restaurant`, `PATCH /restaurant/setting/{key}` |
| `account.ts` | `POST /account/actualize` (session keep-alive) |
| `devices.ts` | push-device registration |
| `notifications.ts`, `pin.ts`, `chains.ts`, `mqttCredentials.ts`, `holidaySurvey.ts` | the rest |

### The models — `src/shared/models/`

| File | Contains |
|---|---|
| **`OrderModel.ts`** | every order field + the `is_*` getters (`is_new`, `is_asap`, `is_preorder`, `is_pickup`, `is_scheduled`, `acceptance_time`, …) |
| **`RestaurantModel.ts`** | the capability predicates: `can_change_confirmed_time_of_order`, `can_change_delivery_duration_of_order`, `can_change_cooking_duration_of_order`, `can_update_status_of_order`, `can_revert_order_status`, and the `delivery_service` / `order_flow` classification |

### Transport — `src/shared/ajax/`

`axiosSetup.ts` (baseURL + the complete header contract), `platformHeaders.ts` (returns `{}` on web).

### Behaviour worth knowing — `src/shared/helpers/` and `src/shared/hooks/`

| File | Why it matters |
|---|---|
| **`isNewOrderNotAccepted.ts`** | the tablet's nag predicate — keyed to `order.is_new` |
| **`useWatchForNewOrders.ts`** | runs it every 10 s and plays `other_notification_sound` |
| **`order/shouldIgnoreOrderUpdate.ts`** | stale-update guard (the thing that is *not* a server transition validator) |
| `order/showOrderUpdateNotification.ts`, `differenceInObjects.ts` | which field changes trigger a re-render/notification |
| `services/sockets/listeners/` | `orderCreatedListener`, `orderUpdateListener` — the websocket push path |

## The five findings that actually changed our implementation

### 1. Accepting an order — the real signature

`src/shared/api/orders.ts`:

```ts
export function confirmOrderApi(params: {
    id: number;
    cookingTime: number | null;
    deliveryDurationTime: number | null;
    estimatedDeliveryTime: Date | null;
}): Promise<OrderData> {
    const estimatedDeliveryTime = params.estimatedDeliveryTime
        ? params.estimatedDeliveryTime.toISOString().split('.')[0] + 'Z'
        : null;

    return axios({
        url: `/orders/${params.id}/confirm-order`,
        method: 'post',
        data: {
            food_preparation_duration: params.cookingTime,
            delivery_time_duration: params.deliveryDurationTime,
            estimated_delivery_time: estimatedDeliveryTime
        }
    }).then((response) => transformEntityTimeToDateObjects(response.data));
}
```

**All three values are declared `| null` in JET's own types.** That settles the nullability question that our
production data could only hint at. Sending `null` for `delivery_time_duration` on a pickup order is
type-correct, not a gamble.

`updateOrderStatusApi` (`PATCH /orders/{id}` `{status}`) is a *separate* function — it is not how you accept.

### 2. `estimated_delivery_time` is pre-filled at arrival, then replaced

`OrderModel.ts`, verbatim comment from JET's own developers:

```ts
readonly restaurant_estimated_delivery_time!: Date | null; // this is filled when just eat order arrives
```

So the value present on a `new` order is JET's **pre-acceptance projection**, computed when the customer
ordered — it goes stale by however long the order waits. Our old code echoed exactly that value back as the
customer's promise. Combined with `can_change_confirmed_time_of_order` (below) the conclusion is firm: send
`null` and let JET recompute from the durations.

### 3. The capability predicates — `RestaurantModel.ts`

```ts
can_change_confirmed_time_of_order(order) {
    return this.is_own_delivery && !order.is_cancelled && !order.is_delivered && !order.is_new;
}
can_change_delivery_duration_of_order(order) {
    return !this.is_courier_first && this.is_own_delivery && order.is_delivery;
}
can_change_cooking_duration_of_order(order) {
    return !((this.is_3PL || this.is_scoober || this.is_delco || this.is_haal) && this.is_courier_first && order.is_delivery);
}
can_update_status_of_order(order) {
    return !(this.is_unified_order_flow && order.is_confirmed && !order.is_ready_for_kitchen);
}
get can_revert_order_status() { return this.is_own_delivery || this.is_unified_order_flow; }
```

- The portal **cannot set a time while the order is `new`** → at accept it always posts `null`.
- The portal **cannot produce a delivery duration for a pickup order** → `0` is a value it can never send.
- `delivery_service` ∈ `own_delivery` | `scoober` | `just_eat_rds` | `delco` | `haal` | 3PL;
  `order_flow` adds a second axis (`courier_then_restaurant`, unified flows).
  **Our restaurants are `own_delivery`** — 183 JET orders over 7 days, `couriers: []` on every one.

### 4. The tablet alarm is keyed to `is_new`

```ts
// isNewOrderNotAccepted.ts
export const isNewOrderNotAccepted = (orders: OrderModel[]) =>
    orders.some((order) => {
        if (!order.is_new) return false;
        const timePassed = differenceInSeconds(new Date(), order.created_at);
        const difference = timePassed % 120;          // get diff every 120s
        return timePassed > 5 && (difference < 5 || difference > 115);
    });
```

`useWatchForNewOrders.ts` polls it every 10 s and shows *"have you accepted order"* with a sound. **A
successful accept is what silences the tablet** — which is why two evenings of failed accepts were so painful
in the store. There is **no auto-accept setting anywhere in the portal**: automatic acceptance is only
possible through the API, i.e. through us.

### 5. `shouldIgnoreOrderUpdate` is not a transition validator

```ts
export const shouldIgnoreOrderUpdate = (existingOrder, newOrder, restaurant) => {
    const previousStatusIndex = ORDER_STATUSES_SEQUENCE.findIndex((s) => s === existingOrder.status);
    const newStatusIndex = ORDER_STATUSES_SEQUENCE.findIndex((s) => s === newOrder.status);
    if (existingOrder.status === orderStatus.CANCELLED) return false;           // Cancelled orders can be moved back
    if (restaurant.can_revert_order_status && existingOrder.is_in_delivery && newOrder.is_in_kitchen) return false;
    return previousStatusIndex > newStatusIndex;
};
```

The function name says it: it decides whether an **incoming update** is older than what we already hold, for
socket/poll merging. An earlier draft of our contract mistook this for JET's server-side transition rule —
`ORDER_STATUSES_SEQUENCE` is display/merge ordering, and `cancelled` sits last in it. **JET's server rule
remains unknown**; what production proves is that a `new` order cannot be moved by `PATCH` at all.

## Header contract — `axiosSetup.ts`, verbatim

```ts
const axiosSetup = axios.create({
    baseURL: config.apiUrl,                    // https://live-orders-api.takeaway.com/api
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Content-Type': 'application/json'
    }
});

axiosSetup.interceptors.request.use(async (axiosConfig) => {
    const token = await getAccessToken();
    const selectedRestaurantId = await getSelectedRestaurantId();
    const tenant = getTenant();
    const pinToken = usePinStore.getState().token;

    if (!token) { /* abort the request client-side */ }

    axiosConfig.headers['Authorization'] = `Bearer ${token}`;
    if (pinToken)            axiosConfig.headers['X-pin-token'] = pinToken;
    if (selectedRestaurantId) axiosConfig.headers['X-Restaurant-Id'] = selectedRestaurantId;
    if (tenant && tenant !== 'default' && tenant !== 'internal') axiosConfig.headers['X-Tenant'] = tenant;

    const platformHeaders = await getPlatformHeaders();   // returns {} on web
    ...
});
```

**On `X-Restaurant-Id`** — `services/auth/index.ts`:

```ts
async function getAssignedRestaurants() {
    if (isJetEmployee() && keycloak.tokenParsed) return keycloak.tokenParsed.rids;
    const info = await keycloak.loadUserInfo();
    return (info as { rids: string[] }).rids;      // ← from the Keycloak userinfo endpoint
}
export async function getSelectedRestaurantId() {
    return sessionStorage.getItem('selectedRestaurantId') || localStorage.getItem('selectedRestaurantId');
}
```

The id list comes from **userinfo**, not from the token — so our tokens lacking `rids` is normal, not a defect.
The header exists because one login can manage several restaurants; each of our credentials is a single
restaurant (`atyp: "restaurant"`, one `aid`: Berlare `8218856`, Dender `8350673`). We omit it, and our polling
has always worked. **If an accept ever 403s with `confirmed_at` still null**, the procedure to source it is:

```
GET https://partner-hub.justeattakeaway.com/auth/realms/restaurant/protocol/openid-connect/userinfo
Authorization: Bearer <that location's access_token>
→ take rids[0] and send it as X-Restaurant-Id
```

`getTenant()` returns `default` unless the page origin matches a tenant domain — so **not** sending
`X-Tenant` is correct for us.

## Refreshing this capture

JET ships new builds; the filename hash changes with it. The bundle hash is a canary for **client** changes
only — it would not have caught the 2026-08-07 *server*-side tightening. The `takeaway_accept` alarm in
`dlq_alerts` is the real canary.

```bash
ssh vps-ghysels 'cd /tmp && rm -rf jetportal && mkdir jetportal && cd jetportal
  UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"
  curl -s -A "$UA" https://live-orders.takeaway.com/ -o index.html
  SRC=$(grep -oE "/assets/index-[A-Za-z0-9_-]+\.js" index.html | head -1)
  curl -s -A "$UA" "https://live-orders.takeaway.com$SRC"     -o bundle.js
  curl -s -A "$UA" "https://live-orders.takeaway.com$SRC.map" -o bundle.js.map'
```

Then extract the sources (this is how `src/` was produced):

```python
import json, os, re
m = json.load(open('bundle.js.map'))
for s, c in zip(m['sources'], m['sourcesContent']):
    if 'node_modules' in s or c is None: continue
    if s.endswith(('.mp3', '.png', '.svg', '.ico', '.woff', '.woff2')): continue
    p = os.path.join('src', re.sub(r'^(\.\./)+', '', s))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(c)
```

Do the download and extraction **on the VPS**, then copy only `src/` + the gzipped originals into the repo.

## Legal / handling

Publicly served static assets (including a publicly served sourcemap) of a service we are an authenticated
business customer of, retained solely for interoperability with our own restaurant accounts. Not
redistributed outside this repository. Contains no credentials and no personal data.
