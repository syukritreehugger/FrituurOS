# JET live-orders portal bundle — where the raw source lives

The raw JavaScript bundle of Just Eat Takeaway's restaurant portal is **deliberately NOT kept in the working
tree**. It is 2.6 MB on a **single 631 501-character line**, and every tool that touches a repo file — editor,
linter, git diff, search indexer, AI agent — tries to load that line into memory at once. On this machine that
repeatedly crashed WSL with `Wsl/Service/E_UNEXPECTED`.

Everything derived from it is already distilled into the small files listed below. You almost never need the
raw bundle.

## Where to get the raw bundle when you actually need it

| Location | How |
|---|---|
| **Git history** (authoritative copy) | `git show 3ddbfa7:"docs/API Docs/takeaway-portal-bundle/index-D_IofYHW.js" > /tmp/jet_bundle.js` |
| **VPS** | `ssh vps-ghysels` → `/tmp/jet_bundle.js` |
| **Upstream** | `https://live-orders.takeaway.com/assets/index-D_IofYHW.js` (hash changes on every JET release) |

| | |
|---|---|
| Size | 2 667 175 bytes |
| md5 | `f50adeba380d155b2612ad6cb616e639` |
| Retrieved | 2026-08-08, during the order-acceptance incident |

## ⚠️ Rules for working with it

**Do the heavy grepping on the VPS, never in WSL, and never inside the repo folder.**

Forbidden — these crash the machine:
```bash
cat /tmp/jet_bundle.js              # 2.6 MB into your terminal
grep "confirm-order" /tmp/jet_bundle.js   # prints the whole 631 KB line
grep -C5 pattern /tmp/jet_bundle.js       # five times worse
```
Also: never open it in VS Code, and never leave it inside the repo — the editor and language servers will
read it on their own.

Safe access — bound the match *and* the output:
```bash
ssh vps-ghysels "grep -oE '.{0,200}confirm-order.{0,300}' /tmp/jet_bundle.js | head -c 3000"
```

Or slice it in Python on the VPS:
```python
import re
src = open('/tmp/jet_bundle.js', encoding='utf-8', errors='replace').read()
for m in list(re.finditer(r'confirm-order', src))[:3]:
    print(src[max(0, m.start()-250) : m.end()+400], '\n---')
```

## Use these instead (small, safe, already in the repo)

- `../TAKEAWAY-ACCEPT-CONTRACT.md` — the derived contract: how to accept a JET order, the state machine,
  our implementation, and the verification checklist. **Start here.**
- `../TAKEAWAY-bundle-evidence-2026-08-08.md` — pass 1: 20 curated sections (~25 KB)
- `../TAKEAWAY-bundle-evidence-pass2.md` — pass 2: 18 sections — auth/interceptors, transition helpers,
  websocket, polling, preorder handling (~21 KB)

## Landmarks inside the bundle

| Symbol | What it is |
|---|---|
| `Hn` | the axios wrapper — `Hn({url, method, data})`, baseURL `https://live-orders-api.takeaway.com/api` |
| `di` | response mapper that normalises date strings |
| `UBe` | **accept an order** → `POST /orders/{id}/confirm-order` |
| `qBe` | status transition → `PATCH /orders/{id}` `{status}` (post-acceptance only) |
| `HBe` | order issue → `POST /orders/{id}/issue-status` |
| `exe` | order list → `GET /orders` |
| `Jn` | status enum (`NEW`, `CONFIRMED`, `KITCHEN`, `IN_DELIVERY`, `DELIVERED`, `CANCELLED`) |
| `ZO` | statuses in **display** order — *not* a server transition ladder (see contract §3) |
| `Wpe` | client-side index comparison — most likely stale-update suppression |
| `G6e` | stub returning `{}` — contributes no headers |
| `can_change_confirmed_time_of_order` | proves the portal cannot set an ETA while an order is `new` |
| `can_update_status_of_order` | PATCH availability depends on `is_unified_order_flow` + `is_ready_for_kitchen` |

## Refreshing after a JET release

```bash
ssh vps-ghysels 'curl -s -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" \
  https://live-orders.takeaway.com/ -o /tmp/jet_index.html
  grep -oE "/assets/index-[A-Za-z0-9_-]+\.js" /tmp/jet_index.html'
```
Download that path **onto the VPS**, re-run the extraction there, and commit only the small evidence files.
If you must vendor the raw bundle again, commit it and then delete it from the working tree in the same
session — do not leave it lying in the repo.

Note: the bundle only contains the shared application layer. The React components that *call* `UBe` live in a
separate micro-frontend, so the default `cookingTime` / `deliveryDurationTime` values staff see in the tablet
UI are not observable here — those were derived from our own production data (contract §2.2).

## Legal / handling

Publicly served static asset of a site we are an authenticated business customer of, retained solely for
interoperability with our own restaurant accounts. Not redistributed outside this repository. Contains no
credentials or personal data.
