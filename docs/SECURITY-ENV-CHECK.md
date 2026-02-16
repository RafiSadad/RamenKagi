# Cek Keamanan & Env – Ramen Kagi

## 1. Keamanan kode

### Rahasia hanya di server
- **SUPABASE_SERVICE_ROLE_KEY** dipakai hanya di:
  - API routes: `api/receipt/upload`, `api/cron/clean-receipts`, `api/midtrans/webhook`
  - Server Actions: `app/actions.ts`
  - Lib yang dipanggil dari server: `lib/menu-stock.ts`, `lib/admin-orders.ts` (dipakai dari Server Components / admin)
- **MIDTRANS_SERVER_KEY** hanya di: `api/midtrans/webhook`, `api/payment/route.ts`
- **TELEGRAM_BOT_TOKEN** & **TELEGRAM_CHAT_ID** hanya di: `api/receipt/upload`, `api/midtrans/webhook`, `app/actions.ts`

Tidak ada rahasia di-file yang pakai `"use client"` atau yang di-import ke client. Aman.

### Yang memang untuk client (NEXT_PUBLIC_)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `PUBLISHABLE_KEY` → client Supabase (auth, read terbatas)
- `NEXT_PUBLIC_SANITY_*` → fetch konten
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` → UI pembayaran

Ini aman untuk diexpose ke browser.

---

## 2. Env yang dipakai di kode (Vercel)

| Env | Dipakai di | Wajib? |
|-----|------------|--------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase client, API, cron | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY atau PUBLISHABLE_KEY | Client + middleware | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Upload nota, webhook, orders, menu-stock, admin-orders | ✅ |
| NEXT_PUBLIC_SANITY_PROJECT_ID, DATASET | Sanity fetch | ✅ |
| SANITY_API_TOKEN, SANITY_API_WRITE_TOKEN | Sanity (read/write) | ✅ |
| TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID | Notif pesanan + pembayaran + foto nota | ✅ |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY, NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION | Payment + webhook | ✅ |
| **CRON_SECRET** | `api/cron/clean-receipts` (auth request cron) | ✅ supaya cron jalan |
| NEXT_PUBLIC_ADMIN_HOST | `proxy.ts` (redirect dashboard) | Opsional |
| DATABASE_URL | Bisa untuk migrasi/CLI | Opsional |

---

## 3. Yang perlu dicek di Vercel

1. **CRON_SECRET**  
   Kalau belum ada: Vercel → Project **ramen-kagi** → Settings → Environment Variables → Add:  
   Name: `CRON_SECRET`, Value: (string rahasia, mis. dari `openssl rand -hex 32`).  
   Tanpa ini, endpoint cron pembersihan receipt bisa return 401.

2. **NEXT_PUBLIC_ADMIN_HOST**  
   Kalau pakai domain dashboard: set `NEXT_PUBLIC_ADMIN_HOST` = `dashboard.ramenkagi.com` (atau domain admin kamu).

3. Jangan commit `.env.local`; nilai rahasia hanya di Vercel (dan lokal untuk dev).

---

## 4. Ringkasan

- **Keamanan:** Rahasia (Service Role, Midtrans Server, Telegram) hanya dipakai di server; tidak ada kebocoran ke client.
- **API/env:** Yang wajib untuk fitur saat ini (order, bayar, nota, Telegram, cron) sudah tercover. Satu yang sering terlupa: **CRON_SECRET** untuk cron hapus file nota lama.
