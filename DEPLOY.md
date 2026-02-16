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
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_ADMIN_HOST` = `dashboard.ramenkagi.com`
- Midtrans: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`

Jangan commit `.env.local`; isi env hanya di Vercel (dan lokal).

---

## 7. Setelah deploy

- **ramenkagi.com** → web pelanggan.
- **dashboard.ramenkagi.com** → redirect ke `/admin` (login pakai user Supabase Auth).
- **media.ramenkagi.com** → Sanity Studio (edit menu, banner, dll.).

Kalau ada error build/runtime, cek log di Vercel → Deployments → Function / Build logs.
