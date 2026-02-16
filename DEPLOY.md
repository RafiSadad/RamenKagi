# Deploy Ramen Kagi ke Vercel

Target domain:

| Layanan        | Domain                  | Repo / folder          |
|----------------|-------------------------|------------------------|
| Web (menu + order) | **ramenkagi.com**       | `kagi-app` (Next.js)   |
| Admin (dashboard)  | **dashboard.ramenkagi.com** | `kagi-app` → `/admin`  |
| Sanity (media/CMS) | **media.ramenkagi.com**  | `studio-ramen-kagi`    |

---

## 1. Persiapan

- Akun [Vercel](https://vercel.com) (login pakai GitHub).
- Repo ini sudah di-push ke GitHub.
- Domain **ramenkagi.com** (dan subdomain) sudah kamu punya; nanti diatur di DNS (CNAME ke Vercel).

---

## 2. Deploy Web + Admin (satu project)

Satu project Vercel untuk **kagi-app**; dua domain: ramenkagi.com (web) dan dashboard.ramenkagi.com (admin).

### 2.1 Buat project di Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. **Import** repo GitHub (RamenKagi).
3. **Configure:**
   - **Root Directory:** `kagi-app` (klik Edit, pilih folder `kagi-app`).
   - **Framework Preset:** Next.js (terdeteksi otomatis).
   - **Build Command:** `next build` (default).
   - **Output Directory:** (kosongkan / default).
4. **Environment Variables:** tambah semua variabel dari `.env.local` (Supabase, Sanity, Telegram, Midtrans).  
   Untuk **dashboard.ramenkagi.com** agar redirect ke `/admin`, tambah:
   - **Name:** `NEXT_PUBLIC_ADMIN_HOST`  
   **Value:** `dashboard.ramenkagi.com`  
   (Centang Production / Preview jika perlu.)
5. Deploy.

### 2.2 Tambah domain

1. Project → **Settings** → **Domains**.
2. Add:
   - `ramenkagi.com` (primary, untuk web).
   - `dashboard.ramenkagi.com` (untuk admin).
3. (Opsional) `www.ramenkagi.com` → redirect ke `ramenkagi.com` (Vercel bisa set redirect).

Hasil:

- **ramenkagi.com** → web (menu, order).
- **dashboard.ramenkagi.com** → otomatis redirect ke **dashboard.ramenkagi.com/admin** (login admin).

---

## 3. Deploy Sanity Studio (media.ramenkagi.com)

Satu project Vercel terpisah untuk Sanity Studio.

### 3.1 Buat project kedua di Vercel

1. **Add New** → **Project** → pilih **repo yang sama** (RamenKagi).
2. **Configure:**
   - **Root Directory:** `studio-ramen-kagi`.
   - **Framework Preset:** **Other** (bukan Next.js).
   - **Build Command:** `npm run build` (jalan `sanity build`).
   - **Output Directory:** `dist`.
   - **Install Command:** `npm install`.
3. **Environment Variables** (kalau Studio butuh env):
   - Biasanya Sanity Studio cukup `projectId` + `dataset` di `sanity.config.ts` (sudah ada).  
   - Kalau pakai env untuk project/dataset, tambah `NEXT_PUBLIC_SANITY_PROJECT_ID` dan `NEXT_PUBLIC_SANITY_DATASET` sama seperti di kagi-app.
4. Deploy.

### 3.2 Domain

1. Project Sanity → **Settings** → **Domains**.
2. Add: `media.ramenkagi.com`.

---

## 4. DNS di registrar (ramenkagi.com)

Di tempat kamu beli domain (Niagahoster, Cloudflare, GoDaddy, dll.):

1. **ramenkagi.com** (apex):
   - Vercel biasanya kasih instruksi: A record ke `76.76.21.21` atau CNAME ke `cname.vercel-dns.com`. Ikuti yang muncul di Vercel → Domains untuk masing-masing domain.
2. **dashboard.ramenkagi.com** (subdomain):
   - CNAME → `cname.vercel-dns.com` (atau nilai yang Vercel tunjukkan untuk project kagi-app).
3. **media.ramenkagi.com** (subdomain):
   - CNAME → `cname.vercel-dns.com` (atau nilai yang Vercel tunjukkan untuk project studio).

Setelah DNS propagate (beberapa menit–jam), Vercel akan issue SSL dan domain aktif.

---

## 5. CORS Sanity (agar Studio di media.ramenkagi.com bisa akses API)

1. [sanity.io/manage](https://sanity.io/manage) → pilih project **j2xbsoqh** (ramen-kagi).
2. **API** → **CORS origins** → Add:
   - `https://media.ramenkagi.com`
   - `https://ramenkagi.com`
   - (Development: `http://localhost:3333` dan `http://localhost:3000` kalau dipakai.)
3. Save.

---

## 6. Ringkasan env di Vercel (project kagi-app)

Salin dari `.env.local` ke Vercel → Settings → Environment Variables (project **kagi-app**):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` atau `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Supabase Storage: untuk **simpan nota**, bucket `nota` (public) akan dibuat otomatis saat pertama kali user simpan nota. Gambar nota juga dikirim ke Telegram; file di Storage dihapus otomatis **tiap hari** (cron tengah malam UTC; file lebih tua dari 3 hari dihapus).
- **CRON_SECRET**: buat nilai rahasia (mis. `openssl rand -hex 32`) dan set di Vercel → Environment Variables. Dipakai untuk auth endpoint cron pembersihan receipt (wajib di production).
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_ADMIN_HOST` = `dashboard.ramenkagi.com`
- Midtrans: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`

Jangan commit `.env.local`; isi env hanya di Vercel (dan lokal).

---

## 6.1 Fitur Nota (simpan + kirim Telegram + hapus otomatis) — yang perlu di Vercel

Kode nota (upload + cron) sudah ada di **kagi-app**; begitu deploy, API ikut terpasang. Yang harus kamu set di Vercel:

1. **Deploy seperti biasa**  
   Pastikan project Vercel pakai **Root Directory: `kagi-app`**. Setiap push/deploy akan include `vercel.json` (cron) dan route `/api/receipt/upload`, `/api/cron/clean-receipts`.

2. **Environment Variables** (project kagi-app) — untuk nota wajib:
   - **Supabase** (sudah dipakai order): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`  
     → dipakai untuk upload gambar ke bucket `nota` dan untuk cron hapus file.
   - **Telegram** (sudah dipakai notif pesanan): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`  
     → dipakai untuk kirim foto nota ke grup/chat.
   - **CRON_SECRET** (khusus cron):  
     → Buat nilai rahasia (di PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])` atau pakai [random.org](https://random.org)).  
     → Di Vercel: **Settings → Environment Variables** → Add → Name: `CRON_SECRET`, Value: (nilai rahasia tadi).  
     → Tanpa ini, endpoint cron bisa return 401. Kalau `CRON_SECRET` sudah di-set di Vercel, Vercel akan kirim secret itu di header saat memanggil cron.

3. **Cron**  
   Tidak perlu konfigurasi tambahan. Jadwal ada di **kagi-app/vercel.json** (`/api/cron/clean-receipts`, sekali sehari). Setelah deploy, Vercel otomatis jalankan cron di production.

4. **Supabase Storage**  
   Bucket **`receipts`** akan dibuat otomatis saat pertama kali ada user yang simpan nota (jika belum ada). Kalau mau buat manual: Supabase Dashboard → Storage → New bucket → nama `nota`, **Public** on.

Setelah itu: user simpan nota → upload ke Storage → foto ke Telegram → link dibuka user. File di Storage dihapus cron tiap hari (yang umur > 3 hari).

---

## 7. Setelah deploy

- **ramenkagi.com** → web pelanggan.
- **dashboard.ramenkagi.com** → redirect ke `/admin` (login pakai user Supabase Auth).
- **media.ramenkagi.com** → Sanity Studio (edit menu, banner, dll.).

Kalau ada error build/runtime, cek log di Vercel → Deployments → Function / Build logs.
