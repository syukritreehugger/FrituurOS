# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Srova** — a SaaS operations console that replaces Deliverect for restaurant groups. Real-time orders, menu sync, and POS integration health across Shopify, Takeaway.com, Lightspeed L-Series, and Shipday. Currently piloting at **Ghysels-Vagenende Frituur Group** (four Belgian frituur locations: Aalst, Berlare, Dender, Herzele). It's a Next.js 16 app monitoring the order pipeline: Shopify/Takeaway.com orders flow through n8n workflows into Lightspeed L-Series POS, with Shipday for delivery dispatch. Supabase is the database (Postgres + RLS + Edge Functions).

Branding: the product is **Srova** (mixed case, like Vercel/Linear). "FrituurOS" was the old internal name and may still appear in legacy infrastructure (VPS path, customer email fingerprint `@frituuros.internal` — these are deliberately preserved because changing them would break Lightspeed customer dedup for existing orders).

## Commands

```bash
pnpm dev          # start dev server (localhost:3000)
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # vitest — watch mode
pnpm test -- --run                          # single pass, no watch
pnpm test -- --run lib/queries/alerts.helpers.test.ts  # single file
```

**Deployment:** The app runs on VPS at `https://srova.ghysels-vagenende.be/`. Do not start `pnpm dev` locally for UI verification — test against the deployed URL.

## Deployment

- **GitHub repo:** `https://github.com/syukritreehugger/Srova.git` (renamed from FrituurOS on 2026-06-17; GitHub auto-redirects the old URL)
- **VPS:** `ssh root@72.61.208.251` — app runs at `https://srova.ghysels-vagenende.be/`
- VPS clone path is still `/var/www/frituur-os` (not renamed; cosmetic only)
- Do not run `pnpm dev` locally for UI testing — test against the deployed URL.

## MCP Access

- **n8n workflows** — use `mcp__n8n-mcp__*` tools (list, get, update, executions). Prefer these over manual REST calls to `N8N_API_URL`.
- **Supabase database** — use `mcp__supabase-self-hosted__*` tools (execute_sql, apply_migration, list_tables, get_logs). Always verify live schema here rather than trusting `types/supabase.ts` snapshots alone.

## Key Environment Variables

Copy `.env.example` to `.env.local`. Critical vars:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; server-only
- `NEXT_PUBLIC_DEV_SKIP_AUTH=1` — skips auth middleware + uses service-role client in dev
- `NEXT_PUBLIC_USE_MOCK_DATA=1` — returns hardcoded mock data from query functions
- `N8N_API_URL` / `N8N_API_KEY` — n8n instance for pipeline control
- `SHOPIFY_AALST_DOMAIN` / `SHOPIFY_AALST_TOKEN` — per-location Shopify Admin API (same pattern for `BERLARE`, `DENDER`, `FRITURIST`)

## Architecture

**Route groups:**
- `(app)/*` — authenticated dashboard pages. Layout fetches integration health and DLQ alert count for the sidebar/topbar. Key routes: `/` (dashboard), `/orders`, `/orders/[id]`, `/alerts`, `/alerts/[id]`, `/pipeline`, `/menu`, `/settings`, `/locations`, `/integrations`, `/restaurant-status`, `/opening-times`, `/snooze`, `/mappings`, `/audit`, `/gdpr`.
- `(auth)/*` — login + MFA flows. MFA enforcement is currently disabled (`requiresMFA()` always returns `false` in `middleware.ts`). Default role when `app_metadata.role` is absent: `management`.
- `api/auth/signout` — sign-out API route.

**Data flow:**
- `lib/supabase/server.ts` — creates the per-request Supabase client. In dev with `DEV_SKIP_AUTH=1`, it uses service-role to bypass the `canonical_orders_default_deny` RESTRICTIVE RLS policy.
- `lib/supabase/service.ts` — service-role client for server-only operations.
- `lib/queries/` — server-side data fetching (dashboard KPIs, orders, alerts, health, pipeline). Each function queries Supabase directly and falls back to mock data when `NEXT_PUBLIC_USE_MOCK_DATA=1`.
- `lib/n8n.ts` — REST client to control n8n workflows (activate/deactivate/status). Hardcoded workflow IDs for Shopify webhook handlers, LS pusher, and the poller.
- `lib/shopify.ts` — Shopify Admin REST API client (`2024-10`). `getProductsForLocation(loc)` fetches all variants page-by-page; used by the `/menu` mapping page. Per-location config reads `SHOPIFY_*_DOMAIN` / `SHOPIFY_*_TOKEN` env vars.
- `lib/queries/alerts.helpers.ts` — pure helpers: `humanStage()` (queue name → human label), `classify()` (attempt count → severity), `readError()` (JSONB → `ErrorJson`). Unit-tested in `alerts.helpers.test.ts`.
- `lib/constants.ts` — canonical location keys (`LOC_AALST`, `LOC_BERLARE`, `LOC_DENDER`, `LOC_FRITURIST`), order state enum, and UI tone mappings. These must match the Postgres ENUMs exactly.
- `lib/data.ts` — static mock/dummy data for the dashboard skeleton (not used in production queries).

**Database schema (hand-maintained types in `types/supabase.ts`):**
- `canonical_orders` — central order table with status state machine
- `raw_orders` — raw webhook payloads with HMAC validation
- `dlq_alerts` — dead-letter queue alerts for failed pipeline stages
- `ls_tokens` — Lightspeed OAuth tokens per location
- `raw_ls_products` — Lightspeed catalog synced by `sync_lightspeed_products` n8n workflow; used for PLU pre-validation (Phase B)
- `audit_log` / `order_state_history` — immutable audit trail (see types/supabase.ts)
- `menu_sync_log` — menu sync history
- `v_pipeline_latency` — materialized view for p50/p95/p99 latency metrics

**Supabase RPC functions called from queries:**
- `pgmq_send_order(order_id, location_key)` — enqueues to pgmq (wrapper; do not call `pgmq.send()` directly)
- `pgmq_delete_order(msg_id, queue_name)` — dequeues from pgmq (wrapper; `pgmq.delete()` is permission-denied)
- `retry_ladder_stats(p_location_key)` — returns `{ live, history_24h, dlq_depth }` JSON for the pipeline page

**Order pipeline states:** `received` → `normalized` → `pushing_ls` → `ls_sent` → `ls_accepted` → `shipday_sent` → `complete` (with `ls_failed`, `ls_rejected`, `cancelled` as terminal error states).

**UI layer:**
- shadcn/ui (new-york style) with Radix primitives in `components/ui/`
- Dashboard components in `components/dashboard/`
- Tailwind CSS v4, Geist font family, Lucide icons
- Authorization: CASL (`@casl/ability` + `@casl/react`) for role-based access; user role comes from `app_metadata.role`

## Conventions

- Server Components by default; all data fetching in `lib/queries/` via `async` functions called from page-level components.
- Server Actions in `actions.ts` files colocated with their page.
- The `payment` column is JSONB — always use the `readTotalCents()` helper to safely extract `payment.total_cents`.
- Supabase types are hand-maintained (not auto-generated) — update `types/supabase.ts` when changing the schema.
- n8n workflow IDs are hardcoded constants in `lib/n8n.ts` and `lib/queries/health.ts`.
- `cancel_reason` on `canonical_orders` is dual-use: a human-readable string normally, but Phase D2 auto-retry stores `{"auto_retry_count": N}` JSON in it. Read with `(cancel_reason::jsonb->>'auto_retry_count')::int` in SQL; never overwrite without preserving the retry count.
- The `/menu` page includes a help text written in Bahasa Indonesia ("Bagaimana ini bekerja") — that is intentional for the owner audience.

## n8n Pipeline Modifications (Phase A/B)

**push_lightspeed_order** (`2ENsv7R4I8H5L3cf`) — 29 nodes as of 2026-05-12.

Phase A (idempotency, live since 2026-05-07): After `Load LS Token`, the workflow checks Lightspeed for an existing order with the same `external_ref` via `Check LS Existing → Filter LS Idempotency → IF Idempotency Skip`. If found, it adopts the existing LS order instead of re-pushing.

Phase B (PLU pre-validation, live since 2026-05-12): Inserted between `Load dim_location` and `Load LS Token`:
- `Load LS Catalog SKUs` — fetches all visible SKUs from `raw_ls_products` for the location
- `Validate Order PLUs` — checks every item/modifier PLU against the catalog
- `IF PLU Valid` → TRUE: continue to `Load LS Token` (normal flow) | FALSE: `DLQ: PLU Mismatch`
- `DLQ: PLU Mismatch` — transitions order `normalized → pushing_ls → ls_failed`, inserts `dlq_alerts` with `code: 11401`, deletes queue message (no auto-retry — PLU mismatch requires manual fix at `/menu`)

**Fixing notes for DLQ node SQL:** uses `pgmq_delete_order()` wrapper (not `pgmq.delete()` directly — permission denied). `dlq_alerts.msg_id` is NOT NULL — must be included. `canonical_orders` schema_version must be `"1.1"`, payment needs `status` + `currency: "EUR"`, `method` must be enum (`card_online`/`cash`/`bancontact`/`voucher`/`other`), vat_lines needs ≥1 entry.

**Phase C (webhook deduplication, live since 2026-05-12):** `canonical_orders_unique_active_idx` UNIQUE partial index on `(source, external_ref, location_key) WHERE status != 'cancelled'`. `shopify_normalize_to_canonical` (`OdYCsotEru63kxN7`) UPSERT upgrades `INSERT … DO NOTHING` to full `ON CONFLICT … DO UPDATE` — second webhooks update items/payment/vat_lines/customer instead of being silently dropped. `(xmax = 0) AS was_inserted` flag skips re-enqueueing for duplicates.

**Phase D1 (token expiry monitoring, live since 2026-05-12):** `monitor_token_expiry` workflow (`PYJ5HqtZErvCR95V`) — ScheduleTrigger 15min → queries `ls_tokens` where `expires_at < NOW() + 30min` → classifies `critical` (<10min) or `warning` (<30min) → dedup check (no alert in last 2h) → inserts `dlq_alerts` with `queue_name: 'ls_token_expiry'`, `msg_id: 0` (sentinel, no real queue msg). Stage label `ls_token_expiry` → "LS token refresh" in dashboard.

**Phase D2 (stuck order auto-retry, live since 2026-05-12):** `monitor_stuck_orders` workflow (`YIjqWVqCnUg6Az7X`) — ScheduleTrigger 5min → queries orders stuck in `pushing_ls`/`ls_sent` for >10min → batches 1-by-1 → IF `retry_count < 3`: increment counter in `cancel_reason` JSONB + `pgmq_send_order()` re-enqueue → ELSE: `dlq_alerts` with `code: STUCK_RETRY_LIMIT`. Reads retry count via `(cancel_reason::jsonb->>'auto_retry_count')::int`. Re-enqueue uses `pgmq_send_order()` wrapper (not `pgmq.send()` directly).

## Design Context

### Users
Three overlapping user groups (owner-operators, hired location managers, tech maintainer). Used during high-pressure frituur service where attention is split — must be scannable in seconds.

### Brand Personality
**Clean, Warm, Professional.** Apple-like precision with warmth from amber/honey tones tied to the frituur identity.

### Emotional Goal
**Trust & reliability** — "The system handles it." Reassure operators the pipeline works. Errors visible but not alarming unless action is needed.

### Aesthetic Direction
- References: Vercel, Linear. Anti-references: legacy POS software.
- oklch warm palette. Primary = deep charcoal. Accent = "fry-amber." Semantic: emerald=healthy, amber=warn, rose=critical.
- Geist Sans/Mono. Small labels (10-13px), uppercase tracking, tabular nums. Font features `ss01`, `cv11`.
- Subtle elevated cards, glass topbar, 0.75rem base radius. Restrained motion.
- Custom utilities: `.card-elevated`, `.glass`, `.pulse-dot`, `.grid-pattern`.

### Design Principles
1. **Glanceable over explorable** — Status understood in 2 seconds via color/size hierarchy.
2. **Calm until it matters** — Quiet default; alerts escalate visually only when action is needed.
3. **Warm precision** — Apple craft + amber warmth. Never clinical or cold.
4. **Data-dense, not cluttered** — Meaningful numbers without visual noise.
5. **Consistent semantic color** — Emerald/amber/rose always mean healthy/warning/critical, never decorative.
