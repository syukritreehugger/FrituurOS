# JET live-orders portal bundle (raw)

`index-D_IofYHW.js` — the complete JavaScript application bundle of Just Eat Takeaway's **restaurant portal**
(`https://live-orders.takeaway.com`), retrieved **2026-08-08**.

| | |
|---|---|
| Source URL | `https://live-orders.takeaway.com/assets/index-D_IofYHW.js` |
| Size | 2 667 175 bytes |
| md5 | `f50adeba380d155b2612ad6cb616e639` |
| Retrieved | 2026-08-08, during the order-acceptance incident |

## Why it is in the repo

We are **not** a certified JET partner and have no official API documentation. This bundle is the app JET's
own staff-facing portal runs, so the API calls inside it are the de-facto contract. It is the primary evidence
behind `../TAKEAWAY-ACCEPT-CONTRACT.md` — vendored here so the contract can be re-derived even if JET ships a
new build (and so we can diff old vs new when they do).

## ⚠️ How to read it without killing your machine

This is **minified**: 4 905 lines, but the longest single line is **631 501 characters**. During this
investigation, agents grepping it without bounds dumped 600 KB+ into their context and repeatedly crashed the
whole WSL environment.

**Never** do this:
```bash
cat index-D_IofYHW.js            # 2.6 MB into your terminal
grep "confirm-order" index-*.js  # prints the entire 631 KB line
grep -C5 pattern index-*.js      # same, five times over
```

**Always** bound both the match and the output:
```bash
grep -oE '.{0,200}confirm-order.{0,300}' index-D_IofYHW.js | head -c 3000
```

Or slice it in Python:
```python
import re
src = open('index-D_IofYHW.js', encoding='utf-8', errors='replace').read()
for m in list(re.finditer(r'confirm-order', src))[:3]:
    print(src[max(0, m.start()-250) : m.end()+400], '\n---')
```

## Pre-extracted evidence (use these first)

Two curated files already contain the load-bearing slices — read them before touching the raw bundle:

- `../TAKEAWAY-bundle-evidence-2026-08-08.md` — pass 1, 20 sections (~25 KB)
- `../TAKEAWAY-bundle-evidence-pass2.md` — pass 2, 18 sections: auth/interceptors, transition helpers,
  websocket, polling, preorder handling (~21 KB)

## Landmarks inside the bundle

| Symbol | What it is |
|---|---|
| `Hn` | the axios wrapper — `Hn({url, method, data})` |
| `di` | response mapper that normalises date strings |
| `UBe` | **accept an order** → `POST /orders/{id}/confirm-order` |
| `qBe` | status transition → `PATCH /orders/{id}` `{status}` |
| `HBe` | order issue → `POST /orders/{id}/issue-status` |
| `exe` | order list → `GET /orders` |
| `Jn` | status enum (`NEW`, `CONFIRMED`, `KITCHEN`, `IN_DELIVERY`, `DELIVERED`, `CANCELLED`) |
| `ZO` | array of statuses in display order (**not** a server transition ladder — see contract §3) |
| `Wpe` | client-side index comparison, most likely stale-update suppression |
| `can_change_confirmed_time_of_order` | proves the portal cannot set the ETA while an order is `new` |
| `can_update_status_of_order` | shows PATCH availability depends on `is_unified_order_flow` + `is_ready_for_kitchen` |

## Refresh procedure

JET can ship a new build at any time; the filename hash changes with it. To refresh:

```bash
ssh vps-ghysels 'curl -s -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" \
  https://live-orders.takeaway.com/ -o /tmp/jet_index.html
  grep -oE "/assets/index-[A-Za-z0-9_-]+\.js" /tmp/jet_index.html'
```

Then download that path, drop it in this folder, and re-derive the contract. Do the heavy grepping **on the
VPS**, not in WSL.

Note: the bundle only contains the shared application layer — the React components that *call* `UBe` live in a
separate micro-frontend that this page does not serve, so the default `cookingTime` / `deliveryDurationTime`
values a human sees in the tablet UI are not observable here. Those were derived from our own production data
instead (see contract §2.2).

## Legal / handling

Publicly served static asset of a site we are an authenticated business customer of, retained solely for
interoperability with our own restaurant accounts. Not redistributed outside this repository. Contains no
credentials or personal data.
