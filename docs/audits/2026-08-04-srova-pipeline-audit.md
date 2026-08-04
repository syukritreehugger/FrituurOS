# Audit Pipeline Srova — 2026-08-04

> Dihasilkan oleh 5 auditor paralel + verifikasi adversarial (46 dari 58 temuan lolos verifikasi).
>
> **KOREKSI PENTING (diverifikasi manual setelah laporan dibuat):**
>
> 1. **B3 "529 order tersangkut `received`" BUKAN order hilang.** Rinciannya: 255 = LOC_DENDER yang
>    `is_active=false` (belum cutover, sengaja tidak di-push, masih ditangani Deliverect) + 274 = backlog
>    Berlare 21–28 Juli yang sudah diketahui dan sengaja tidak dibatalkan. Aliran 7 hari terakhir dari lokasi
>    aktif: 2026-08-03 Aalst 25/25 dan Berlare 16/16 sampai POS. Hanya 9 order dalam 7 hari yang tidak sampai
>    POS (4 ekor backlog Berlare + 5 `ls_failed` nyata). **Tidak ada order pelanggan yang hilang.**
> 2. **B2 sudah dipulihkan.** Regresi container (image basi 17 Juni) terjadi SAAT audit berjalan dan sudah
>    di-rollback 2026-08-04 ~01:15Z. `/api/health` kembali 200, `lib/auth/assert.ts` dan role gate hadir lagi.
>    Yang tersisa: image `srova:local` masih basi → tetap perlu rebuild (lihat B2).
> 3. **Temuan Kelas C perlu diverifikasi ulang sebelum ditindak.** Beberapa subagent yang menghasilkannya
>    ditandai melakukan credential exploration (menyapu vault/env/tabel token). Perlakukan sebagai lead yang
>    belum terkonfirmasi, bukan fakta.

---

> **STATUS REMEDIASI (2026-08-04 ~04:00 UTC, toko tutup):**
> SELESAI — B1a (RLS dlq_alerts), B4 (gate jam buka + LOC_FRITURIST off + 346 alert noise resolved),
> A4 (PLU ambigu: mapping sudah ada sejak 30 Jul, 2 order lama ditutup), A3 (workflow `shipday_compensate`
> dibangun + aktif, 2 pesan basi diproses, order Shipday 51036739 ter-cancel), A1+A6-Shipday (ETA dari waktu
> janji JET + expectedDeliveryDate + lat/lng + format alamat), A2+A5+A6 (normalizer Shopify: klasifikasi
> pickup via shipping method, phone fallback+E.164, hygiene line2, penanda alamat tanpa nomor), A7
> (normalizer Takeaway: extra->line2 dengan dedup, company_name->notes), C4 (UPSERT guard location_key +
> order_type di kedua normalizer), C6 (filter GDPR di-stage di repo), plus bonus: node DLQ generik
> push_lightspeed_order kini menulis dlq_alerts + cancel_reason (3 kegagalan senyap Jul 29-31 ditutup).
> Semua node Code teredit lolos `node --check`.
> BELUM — B1b RLS order_state_history (menunggu deploy C6), B2 rebuild image (butuh koordinasi),
> B5/C3 (app code, ikut deploy B2), C1 token Shopify Aalst (butuh mint manual), B6 telemetry.


# Srova — Audit Pipeline Order (2026-08-04)
**46 temuan terverifikasi → digabung jadi 21 item. Diurut berdasar risiko nyata ke order yang sedang jalan.**

---

## KELAS A — Bisa menyebabkan order MISSED atau MIS-DELIVERED (prioritas mutlak)

### A1. Shipday ETA di-hardcode `now+20 / now+45` — waktu janji JET tidak pernah dipakai
- **Rusak apa:** setiap order Shipday memberitahu driver "siap 20 menit, antar 45 menit" tanpa melihat janji sebenarnya. Pre-order muncul di papan dispatch berjam-jam sebelum makanannya ada. Ditambah: `fmt()` hanya kirim `HH:MM:SS` dari getter UTC (tanpa `expectedDeliveryDate`), jadi Brussels UTC+2 merender ETA ~75 menit **di masa lalu** saat order baru dibuat.
- **Bukti:** `push_shipday_order` (C3SfhvbDjYPZinKm), node `build-payload`, versi aktif cb4edb31: `const pickup = new Date(now.getTime()+20*60*1000)` → `expectedPickupTime: fmt(pickup)`. Live: n=682 order takeaway ter-push punya `raw_payload->>'restaurant_estimated_delivery_time'`; **100 (15%) meleset >15 menit**, max 349 menit (`Takeaway - FCDTYF`, shipday 49901534, push 11:56Z vs janji 17:45Z). 14 pre-order meleset >2 jam, 6 beda tanggal kalender.
- **Fix:** `Load Canonical Order` join `raw_orders` ambil `restaurant_estimated_delivery_time` / `_pickup_time`, teruskan lewat `Filter Shipday Idempotency`, set `expectedPickupTime`/`expectedDeliveryTime` **+ `expectedDeliveryDate`** (UTC `yyyy-mm-dd`), konversi pakai `dim_location.timezone` bukan hardcode. Fallback `now+45` hanya kalau sumber kosong.
- **Kapan:** **jendela tutup toko.** Edit node + reaktivasi workflow, dan butuh 1 order uji end-to-end.

### A2. Order pickup Shopify dinormalisasi jadi `delivery`, dengan alamat frituur sendiri
- **Rusak apa:** ~9–10% order Shopify (Local Pickup tetap mengirim `shipping_lines` + `shipping_address`) masuk sebagai delivery. Tiket POS cetak `ADRES: Bredestraat 123, 9300 Aalst` (alamat toko sendiri) dan mendarat di **ls_table_ids yang salah** (`shopify_delivery` bukan `shopify_pickup`).
- **Bukti:** `shopify_normalize_to_canonical` (OdYCsotEru63kxN7): `const isDelivery = (shipping_lines.length>0) || shipping_address != null`. Live 30d: 128/1253 raw Shopify punya penanda pickup, hanya 12/845 canonical yang `order_type='pickup'`. 90d: 55 "delivery" ke `Bredestraat 123` (Aalst) + 36 ke `Boonvennestraat 8` (Berlare) = 91, **81 sudah di-push ke Lightspeed**.
- **Fix:** klasifikasi dari `shipping_lines[0].code/title` — kode beda per toko (`Afhaal [_230]` Berlare, `Ophalen in frituur [_237]` Aalst), jadi pakai regex generik `/afhaal|ophalen|store pickup|pickup/i`. Set `customer.address = null` untuk pickup. Tambah guard: tolak delivery yang alamatnya = `dim_location.restaurant_address`.
- **Kapan:** **jendela tutup toko** (mengubah node normalizer di jalur ingest utama).
- **Catatan:** belum jadi mis-delivery karena Shopify tidak pernah masuk Shipday (0/833 dalam 90d). Begitu dispatch Shopify dinyalakan, ini langsung jadi driver dikirim ke toko sendiri.

### A3. `q_orders_compensate` tidak punya consumer — Shipday tidak pernah dibatalkan saat POS gagal
- **Rusak apa:** trigger `tg_order_state_history_shipday_compensate` meng-enqueue job pembatalan Shipday, tapi **tidak ada workflow n8n yang membacanya** (dicek 424 workflow + workflow_history: 0 hit). Order gagal di POS tapi driver tetap terjadwal.
- **Bukti:** 2 pesan di `pgmq.q_q_orders_compensate`, `read_ct=0`, umur 6.0 dan 4.9 hari (`Takeaway - TRQGM4`/51036739, `Takeaway - MBQTXV`/51084806, keduanya `ls_failed`). Tidak ada `dlq_alerts` untuk keduanya → nol sinyal ke operator.
- **Bonus bug:** 2 order `ls_failed` Berlare lain **tidak pernah di-enqueue sama sekali** — race tulis: `order_state_history` mencatat ls_failed 1,5 detik sebelum `shipday_pushed_at` ditulis, jadi guard `IF shipday_pushed_at IS NULL THEN RETURN` keluar diam-diam.
- **Fix:** bangun consumer `shipday_compensate` (`DELETE /orders/{id}`, set `shipday_compensated_at`, `pgmq_delete_order`). Sementara itu: buat cabang trigger menulis `dlq_alerts` supaya minimal terlihat di /alerts. Perbaiki urutan tulis atau longgarkan guard.
- **Kapan:** aman kapan saja (bikin workflow baru, tidak menyentuh jalur push).

### A4. 2 order Berlare tidak pernah sampai POS — `AMBIGUOUS:Special saus | CK`, belum diperbaiki 6 hari
- **Bukti:** `dlq_alerts` 7597003 & 7599262, code 11401, keduanya `resolved_at IS NULL`; order `Takeaway - X7YMMM` & `YVXK46` masih `ls_failed`, `ls_order_id IS NULL`. Penyebab masih hidup: `raw_ls_products` LOC_BERLARE (sync 2026-08-03) punya **dua** produk visible bernama persis `Special saus | CK` — `4218103` (sku F25) dan `4218193` (sku Ks11).
- **Catatan penting:** hanya gagal kalau dipesan sebagai **line item** berdiri sendiri; sebagai modifier lolos. 90 order Berlare mengandung string itu, hanya 2 gagal — tapi akan terulang.
- **Fix:** rename/nonaktifkan salah satu PLU duplikat di Lightspeed, lalu replay 2 order + set `resolved_at`. **Blocked oleh C1 (token Aalst) tidak — ini Berlare, /menu Berlare masih hidup.**
- **Kapan:** aman jam kerja.

### A5. Telepon customer Shopify hilang di 71% order
- **Bukti:** normalizer hanya baca `order.customer?.phone`. Live 30d: `shipping_address.phone` ada di 1248/1253 raw, tapi 242/341 canonical (71%) phone-nya null. Contoh `#online-5514` ship_phone=0468063573 → canon null. Lightspeed dapat `telephone: ''` di 241 dari 338 order Shopify (30d), dan LS bikin customer baru per order jadi tidak ada record lama yang menambal.
- **Dampak:** kurir/counter tidak bisa telepon saat alamat tidak ketemu — pengali langsung dari A2/A6.
- **Fix:** `phone: order.customer?.phone ?? order.shipping_address?.phone ?? order.phone ?? null`, normalisasi ke E.164 (`0468…` → `+3246…`).
- **Kapan:** jendela tutup toko (node normalizer).
- **Koreksi:** hanya jalur Lightspeed, bukan Shipday (Shopify di-gate `IF Source Takeaway?`).

### A6. Alamat Shopify: line1+line2 digabung mentah, dan 9 order tanpa nomor rumah sama sekali
Tiga sub-masalah, satu perbaikan:
- **Duplikasi/mangling:** 139/833 order delivery Shopify (90d) punya line2. **15 di antaranya rusak jelas** — 12 line1 sudah memuat line2 (`Leeuwerikenlaan 19` + `19` → "Leeuwerikenlaan 19 19"), 1 line2 mengulang seluruh alamat + kota, 2 line2 = kode pos (`9310`, `9308`). Sisanya (bus/verdiep) benar digabung.
- **Tanpa nomor rumah:** 9 order delivery nyata (90d) line1 tanpa digit & line2 kosong (`Biesebroekweg`, `Koffiestraat`, `Bontegem`) — lolos tanpa validasi apa pun. Takeaway: 0/1539.
- **Latent Shipday:** `Build Shipday Payload` join `[line1, line2, zip, city, country].join(', ')` → "Oscar debunnestraat, 80 b33, 9300, Aalst, BE", dan **membuang `lat`/`lng` yang sudah ada di 427/428 order** sehingga Shipday dipaksa geocode string cacat.
- **Fix:** di normalizer — skip line2 jika line1 sudah memuatnya (normalized substring) atau line2 match `^9\d{3}$`; assert `order_type='delivery'` wajib ada digit di line1+line2, kalau tidak → `dlq_alerts`. Di `Build Shipday Payload` — kirim `deliveryLatitude`/`deliveryLongitude` dari `customer.address.lat/lng`, dan format `"street, 9300 Aalst, Belgium"`.
- **Kapan:** normalizer = jendela tutup; guard Shipday lat/lng = jendela tutup (satu edit bareng A1).

### A7. Field alamat Takeaway yang dibuang: `company_name` (dan `extra`)
- **Bukti:** `Normalize Order` (XNeJaLEPB6uB94Ra) hardcode `line2:null` dan tidak pernah baca `c.extra` / `c.company_name`. Live: `company_name` non-null di **37 order, 18 sudah ter-push ke Shipday** dengan isi seperti *"Deur staat in de carport achter de bruine Citroën"* (4x), *"Onderste bel na jh snuffel"*, *"Rozendreef 190 9300 Aalst Belgium"*. `extra` (floor/bus) hanya 5 order dan 4 di antaranya sudah terduplikasi di `street_number` — jadi **company_name adalah kerugian nyata, extra hanya laten**.
- **Fix:** `line2 = (c.extra||[]).join(', ') || null`, dan append `c.company_name` ke `customer.notes`. `Build Shipday Payload` sudah konsumsi line2 → propagasi otomatis.
- **Kapan:** jendela tutup toko.

---

## KELAS B — Monitoring buta: order gagal ada, tapi tidak ada yang melihat

### B1. 🔴 `/alerts`, KPI dashboard, bell, dan timeline order semuanya kosong karena RLS
Satu akar, lima gejala. `dlq_alerts` dan `order_state_history` punya **hanya** policy RESTRICTIVE `*_default_deny` (`qual: false`, roles `{public}`), tanpa policy permissive. Semua pembaca memakai client user (anon), bukan service client.

| Permukaan | File | Yang operator lihat |
|---|---|---|
| /alerts list | `lib/queries/alerts.ts:26,37` | "No active alerts." |
| KPI "Orders stuck" | `lib/queries/dashboard.ts:180,292` | **0, warna hijau** |
| Bell popover | `components/dashboard/alert-bell.tsx:58,124` | "No unresolved alerts. Pipeline healthy." |
| /alerts/[id] + retry/resolve | `alerts/[id]/page.tsx:33`, `alerts/actions.ts:45` | 404 / "DLQ entry not found" |
| Timeline order | `orders/[id]/page.tsx:79,240` | "No state history yet." (10.403 baris ada) |

- **Bukti:** `set local role authenticated; select count(*) from dlq_alerts` → **0**, sementara `postgres` melihat **485 total / 347 unresolved**. Prod: `NODE_ENV=production`, `NEXT_PUBLIC_DEV_SKIP_AUTH=0` → tidak ada fallback service-role.
- **Kontradiksi yang bikin operator makin bingung:** badge sidebar di `app/(app)/layout.tsx:23` memakai `createServiceClient()` dan menampilkan **347 asli** — badge merah bersebelahan dengan halaman "Pipeline healthy".
- **Fix:** pola sudah ada satu file di sebelahnya. Ganti ke `createServiceClient()` di `lib/queries/alerts.ts`, `dashboard.ts` (dlq count), `alerts/[id]/page.tsx`, `alerts/actions.ts`, `orders/[id]/page.tsx`. Bell adalah komponen browser → butuh route API server-side, **jangan** longgarkan RLS untuk anon. Tambahkan state `error` terpisah agar UI bisa bilang "Unable to load alerts" bukan "No active alerts".
- **Kapan:** **aman jam kerja** (perubahan read-path, tanpa migrasi).
- **Ini alasan A3 & A4 tidak pernah ditangani selama berhari-hari.**

### B2. Container prod bisa reverting sendiri — image `srova:local` basi 2026-06-17
- **Bukti:** container lama sudah di-build in-place (`/app/.next/BUILD_ID` Jun 20 03:43), tapi image tidak pernah di-rebuild. Pada 2026-08-04T01:06:52Z container di-recreate dari image basi (lama di-rename `srova_prekeyfix`) → **seluruh 5 commit hilang**: `/app/lib/auth/` tidak ada, `grep -c assertManagement` = 0 di gdpr & menu actions, `/app/app/api/health` hilang, `lib/n8n.ts` balik ke `AbortSignal.timeout(5000)`, `curl /api/health` → 307 ke /login.
- **Kondisi live sekarang:** GDPR actions, DLQ actions, dan mutasi PLU mapping **tidak punya role gate**.
- **Fix:** `docker build` + tag dari git HEAD f3baa77 di VPS, lalu redeploy. Bake commit SHA ke image dan expose di `/api/health` supaya drift terdeteksi. Catatan: hunk `alerts/actions.ts` dari 31b7c76 memang tidak pernah ada (`retryDlq`/`editAndReplay`/`discardDlq` belum di-gate) — tambahkan.
- **Kapan:** **jendela tutup toko** (restart app).

### B3. Order tidak pernah mencapai `complete`; 529 order tersangkut di `received`
- **Bukti:** semua 234 baris `complete` punya timestamp **identik** `2026-06-17 06:16:01.355422+00` → satu backfill bulk, bukan output pipeline. `shipday_sent` **nol baris seumur hidup**. Sebabnya: `push_shipday_order` node `Success: Update Shipday Id` & `Adopt Existing` hanya `UPDATE canonical_orders SET shipday_order_id=…, shipday_pushed_at=now()` — tidak pernah menyentuh `status`.
- **Lebih mendesak:** **529 order status `received`** (terbaru 2026-08-02) dan 4 di `ls_sent`. Monitor stuck-order Phase D2 hanya mengawasi `pushing_ls`/`ls_sent`, jadi 529 itu tidak diawasi siapa pun. **Ini kandidat order missed yang perlu dicek manual dulu sebelum apa pun.**
- **Fix:** (1) audit 529 order `received` sekarang juga — apakah ada yang tidak pernah masuk POS. (2) Tambah `status='shipday_sent'` di node Shipday sukses, atau resmikan `ls_accepted` sebagai terminal dan perbarui `lib/constants.ts`. (3) Perluas monitor D2 ke `received`.
- **Kapan:** audit aman kapan saja; edit workflow = jendela tutup.
- **Tidak terpengaruh:** `v_pipeline_latency` (filter `ls_pushed_at`, tidak baca status) dan `TERMINAL_OK` di `dashboard.ts:58` sudah menghitung `ls_accepted` sebagai sukses.

### B4. Kanal alert tenggelam: 320 dari 347 alert unresolved adalah `takeaway_poll_silent`
- **Bukti:** cadence ~2 jam **sepanjang malam** (Berlare 2026-08-03: 00:00, 02:00, 04:10 … 23:50) karena aturannya `expected_max_gap_minutes: 45` tanpa guard jam buka. `LOC_FRITURIST` (dibuat 2026-07-31, `is_active=true`, semua kolom integrasi NULL, 0 order) menyumbang 39 alert yang **secara struktural tidak akan pernah bisa clear** (`last_takeaway_insert_at: null`). Tidak ada resolver — `resolved_at` NULL 100%.
- **Fix:** (1) `UPDATE dim_location SET is_active=false WHERE location_key='LOC_FRITURIST'` sampai provisioning selesai — ini juga mencegah jebakan NULL `lightspeed_location_id` nanti. (2) Gate cek poll-silence ke jam buka lokasi. (3) Auto-resolve saat insert berikutnya terdeteksi.
- **Kapan:** aman jam kerja.

### B5. Fail-open di seluruh lapisan status
Dikumpulkan, semuanya "gagal → hijau":
- `layout.tsx:11-18` → `catch { return [] }` → reduce seed `"operational"` → **"All systems healthy"**.
- `pipeline-health.ts:65-73` → RPC error → `level:'healthy', queues:[]`; `:45-47` retry ladder semua nol. Bahkan tanpa error: `WATCHED_QUEUES` hanya `['q_orders_normalize','q_orders_push_ls']` → **`q_orders_compensate` yang macet 5 hari (A3) tidak pernah muncul**, begitu juga `q_orders_push_shipday`.
- `dashboard.ts:68-71,278-282` + `integration-store.ts:100` → denominator 0 → **success rate 100% hijau**. Di integration-store `denom = ok + failed`, jadi pipeline yang semua order-nya masih in-flight juga baca 100%.
- `health.ts:142-146` → 0 baris `takeaway_tokens` → `'operational'` (hijau) — kebalikan dari cabang Lightspeed `:111` yang fail-closed ke `'down'`.
- `page.tsx:100` → `pollerResult.ok ? … : false` → error n8n dianggap "pipeline jalan"; sedangkan `health.ts:78,107,154` melakukan sebaliknya dan melaporkan "5 handler(s) paused" / "pipeline paused" tanpa menyebut ini masalah auth.
- **Fix:** tambah state ketiga `unknown` di seluruh jalur ini; jangan pernah collapse error ke nilai sehat. `WATCHED_QUEUES` → baca semua queue dari `pgmq_metrics_phase1()`.
- **Kapan:** aman jam kerja.

### B6. Nol telemetry error di lapisan app
`console.error` hanya ada 4 tempat; `docker logs srova` = 580 byte; `SENTRY_DSN` false; monitor uptime-kuma #2 "Error Tracking" → `errors.ghysels-vagenende.be` mengembalikan **HTTP 000** (tidak pernah di-deploy). Halaman `/settings` menampilkan `SLACK_WEBHOOK_URL set:true` padahal variabel itu **tidak ada** di env container — daftar SECRETS itu fiksi hardcoded. Retensi n8n efektif hanya **17 jam** (`EXECUTIONS_DATA_MAX_AGE=168` dikalahkan `PRUNE_MAX_COUNT=10000` karena `push_lightspeed_order` membakar ~8.6k eksekusi/hari) — forensik >1 hari mustahil.

---

## KELAS C — Config & credential

**C1. `SHOPIFY_AALST_TOKEN` sudah dicabut (HIGH).** Probe `shop.json`: Aalst `tipzakske.myshopify.com` → **401** "Invalid API key or access token"; Berlare & Dender → 200. Env container, `.env.local` VPS, dan `vault.decrypted_secrets['shopify_admin_token_LOC_AALST']` semuanya md5 `a7624a53…` — identik dan sama-sama mati. `menu-mapping.ts:91-119` menelan kegagalan dan menampilkan **seluruh katalog LS sebagai `ls_only`** — bukan blank, tapi menyesatkan. Order intake tidak terpengaruh (webhook secret terpisah, 179 webhook Aalst 7 hari terakhir semua `hmac_valid=true`). **Fix:** mint token baru (min `read_products`), update `.env.local` **dan** vault, restart. Aman jam kerja kecuali restart → jendela tutup.

**C2. `N8N_API_KEY` — sudah beres.** Kunci di `/var/www/frituur-os/.env.local` diperbaiki 2026-08-04 01:06:50Z dan sekarang 200. Kunci mati hanya tersisa di `.env.local.bak-20260804-010650` → **hapus file .bak itu** agar tidak dipulihkan tak sengaja. Repo lokal juga sudah valid.

**C3. Hanya poller Takeaway Aalst yang bisa dikontrol app.** `lib/n8n.ts:16` cuma punya `TAKEAWAY_POLLER_ID='86E91MXlXNDO5DA6'`; n8n menjalankan tiga (`nhPFskveanP465z9` Berlare, `e4R3OlqGpDVG3DW2` Dender, semua aktif, 209 eksekusi/24j). Toggle di **/settings** (bukan /pipeline) hanya membungkam Aalst; tile "Takeaway.com" active/paused juga hanya baca Aalst. Mitigasi: `monitor_takeaway_poll_health` sudah per-lokasi, jadi poller mati tetap memicu alert. **Fix:** ganti konstanta jadi map per-lokasi. Aman jam kerja.

**C4. UPSERT normalizer pakai `(source, external_ref)`, bukan key Phase C.** Kedua normalizer `ON CONFLICT (source, external_ref)`, mengikat ke `canonical_orders_source_external_ref_uk`, bukan `canonical_orders_unique_active_idx (source, external_ref, location_key) WHERE status<>'cancelled'`. `location_key` **tidak ada** di `DO UPDATE SET` → jika dua toko bertabrakan external_ref, order toko B menimpa payload toko A **tapi tetap memakai location_key toko A** → dikirim ke dapur & zona dispatch yang salah, dan order A hilang, tanpa alert. Belum pernah terjadi (format order-name ketiga toko kebetulan beda). Aman jam kerja untuk fix.

**C5. Tabel `audit_log` tidak pernah dibuat.** Live DB hanya punya `public.audit_logs` — itu tabel checklist inspeksi higiene berbahasa Belanda, kolomnya sama sekali beda. Semua insert audit di `alerts/actions.ts:21`, `gdpr/actions.ts:51,112` **gagal senyap** (return value dibuang, typed `Promise<void>`). Jejak audit compliance = kosong; panel DSAR melaporkan "0 audit rows" sebagai sukses. **Fix:** buat tabel `audit_log`, jangan repoint ke `audit_logs`. Jangan jalankan migrasi ini tanpa konfirmasi.

**C6. Export DSAR GDPR bocor lintas-subjek.** `gdpr/actions.ts:40-43` query `order_state_history` `.limit(500)` **tanpa filter apa pun** — bandingkan `:39` yang memfilter `customer->>email`. Saat ini return 0 (RLS), tapi: (a) export GDPR Art.15 sekarang tidak lengkap tanpa error, (b) begitu RLS diperbaiki untuk B1, ini langsung mendump 500 riwayat order orang lain, (c) di dev dengan `DEV_SKIP_AUTH=1` kebocoran **sudah aktif sekarang** (service-role bypass). **Perbaiki filter ini SEBELUM B1.**

**C7. Lain-lain (low/info).** `Load Shipday Key` return 0 baris → seluruh cabang termasuk DLQ di-skip, pesan loop selamanya tanpa jejak (laten; pemicu realistis = rotasi vault untuk Aalst/Berlare). `v_pipeline_latency`: `authenticated` diberi INSERT/UPDATE/DELETE tapi **tidak SELECT** → p50/p95/p99 permanen 0ms (belum dirender di mana pun). Search bar `search-bar.tsx:60` buang `error` → user tanpa `app_metadata.role` (9 dari 10 akun) dapat "no results" padahal RLS menolak; middleware default ke `management`, policy DB default ke `false` — app dan DB tidak sepakat. `/api/health` hanya ping Postgres, dan RPC-nya `check_orphan_raw_orders` adalah write-path yang unauthenticated. `menu_sync_log` tidak pernah ada di DB (CLAUDE.md:70 salah). `raw_orders.created_at` NULL untuk 100% baris takeaway (1871) — jangan pakai kolom itu untuk analitik, pakai `received_at`. Duplikasi kredensial Shipday di n8n: **jangan hapus** — kedua family dipakai workflow aktif berbeda, yang perlu hanya checklist rotasi.

---

## Urutan eksekusi yang disarankan

| # | Aksi | Jendela |
|---|---|---|
| 0 | Audit manual 529 order status `received` + 4 `ls_sent` — cek apakah ada order pelanggan yang benar-benar hilang | sekarang |
| 1 | Rekonsiliasi manual 4 Shipday orphan + resolve 2 order PLU Berlare (A3/A4) | sekarang |
| 2 | Fix filter GDPR `order_state_history` (C6) | jam kerja |
| 3 | Pindah pembaca alert/timeline ke `createServiceClient()` (B1) | jam kerja |
| 4 | `is_active=false` untuk LOC_FRITURIST + gate jam buka poll-silence (B4) | jam kerja |
| 5 | Rebuild image `srova:local` dari HEAD + gate `alerts/actions.ts` (B2) | tutup toko |
| 6 | Rombak `Build Shipday Payload`: waktu janji + expectedDeliveryDate + timezone dari dim_location + lat/lng delivery (A1, A6-Shipday) | tutup toko |
| 7 | Normalizer Shopify: klasifikasi pickup, phone fallback, notes, guard line2/nomor rumah (A2, A5, A6) | tutup toko |
| 8 | Normalizer Takeaway: company_name + extra (A7) | tutup toko |
| 9 | Bangun consumer `shipday_compensate` (A3) | jam kerja |
| 10 | Token Shopify Aalst baru (C1), map poller per-lokasi (C3), state `unknown` di fail-open (B5) | campuran |

---

## ✅ Dicek dan BERSIH — tidak ada temuan

- **Refresh token Lightspeed** — `token_keeper_lightspeed` (XYK0bqAXmvJFtga8): 20 eksekusi terakhir semua `success`, cadence 20 menit persis, TTL sisa ~51 menit dari umur 60 menit (headroom 3x). Ketiga lokasi punya access token & refresh token berbeda, panjang 424.
- **Refresh token Takeaway/JET** — ketiga lokasi `is_active=true`, di-refresh setiap poll, refresh window sliding 30 hari (`exp-iat = 2592000s`), akun JET berbeda per lokasi. (Catatan: access token JET hanya berumur **5 menit** — sehat sekarang, tapi headroom tipis kalau poller macet.)
- **Kelengkapan vault** — `shipday_api_key_LOC_*`, `shopify_admin_token_LOC_*`, `shopify_webhook_secret_LOC_*`, `lightspeed_oauth_client_id/secret` semua ada untuk 3 lokasi pilot.
- **Validasi HMAC webhook Shopify** — 179 webhook Aalst dalam 7 hari, `hmac_valid=true` 100%. Intake tidak terpengaruh token Admin API yang mati.
- **Idempotensi Phase A** (`Check LS Existing` → adopt) dan **dedup Phase C** (UPSERT penuh + flag `xmax=0`) berfungsi — tidak ditemukan order duplikat di data live.
- **Alamat Takeaway/JET** — 0 dari 1539 order delivery Takeaway (60d) kehilangan `street_number`. Masalah alamat murni sisi Shopify.
- **`v_pipeline_latency`** — definisi view benar (`WHERE ls_pushed_at IS NOT NULL`, percentile atas `ls_pushed_at - created_at`); tidak terkontaminasi bug status `complete`.
- **`TERMINAL_OK` di dashboard** (`dashboard.ts:58`, `integration-store.ts:93`) sudah menghitung `ls_accepted` sebagai sukses — success rate tidak salah gara-gara B3.
- **Alert bell → n8n**, monitor uptime n8n (uptime-kuma #1) aktif dan hijau.
- **`monitor_takeaway_poll_health`** benar-benar per-lokasi (loop `v_takeaway_poll_health`), jadi poller Berlare/Dender yang mati tetap memicu alert meski toggle app-nya cuma Aalst.
- **Modifier PLU** — `Special saus | CK` sebagai modifier lolos validasi di 88 order lain; ambiguitas hanya menyentuh line item.