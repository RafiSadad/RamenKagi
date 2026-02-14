# RamenKagi

MVP aplikasi pemesanan restoran **Kagi Ramen** — target 2 hari. Fokus: **Wow Factor** UI, stabilitas, maintain mudah, dan ruang **upselling** untuk revenue.

---

## Profil & Mindset

- **Role:** 30% Engineer, 70% Sales  
- **Prinsip:** No over-engineering. Solusi paling sederhana, ringan, dan elegan.  
- **Prioritas:** Upselling di Add to Cart / Checkout Drawer (contoh: "Tambah Ocha", topping telur).

---

## Tech Stack

| Area | Pilihan |
|------|--------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS (Menu) | Sanity.io |
| DB (Orders) | Supabase (PostgreSQL) |
| State | Zustand (dilarang Redux) |
| Notifikasi | Telegram Bot API (Server Actions / Route Handlers) |

**UI & Visual:** Shadcn UI (Drawer, Button, Card, Toast) · Framer Motion · **Lenis** (smooth scroll di layout) · lucide-react.  
**Dilarang:** MUI, Chakra, library UI raksasa.

---

## Arsitektur (Next.js App Router)

1. **Server vs Client:** Default Server Components. Pakai `"use client"` hanya untuk: onClick, useState, useRef, useEffect, Lenis, Framer Motion, Zustand.
2. **Data:** Fetch Sanity di Server Components. Mutasi (checkout, notif Telegram) lewat **Server Actions** atau **Route Handlers** — jangan ekspos API key di client.
3. **Styling:** Tailwind + `cn()` (clsx + tailwind-merge) untuk class dinamis.
4. **Cart:** Zustand (memory atau localStorage; prioritaskan kecepatan MVP).

---

## Struktur Folder

```
RamenKagi/
├── kagi-app/           # Next.js app
│   ├── src/
│   │   ├── app/        # Halaman, layout, api
│   │   ├── components/
│   │   │   └── ui/     # Shadcn
│   │   ├── lib/        # Sanity, Supabase, utils
│   │   └── store/      # Zustand (cart)
│   └── ...
└── studio-ramen-kagi/  # Sanity Studio
```

---

## Menjalankan Project

- **App:** `cd kagi-app && npm run dev`
- **Sanity Studio:** `cd studio-ramen-kagi && npm run dev`

---

## Supabase: migration (tabel orders, payments, menu_stock)

**Opsi A — Supabase CLI (disarankan)**

1. Login sekali: `npx supabase login` (buka browser, masuk akun Supabase).
2. Dari folder `kagi-app`: link project  
   `npx supabase link --project-ref pmdwacvnlzbsawlqkvyt`  
   Saat diminta **Database password**, isi password DB dari Supabase (sama dengan di `DATABASE_URL`).
3. Push migration: `npx supabase db push`.

**Opsi B — Script (pakai DATABASE_URL)**

- Dari folder `kagi-app`: `npm run db:push`  
  (membaca `DATABASE_URL` dari `.env.local`, lalu `supabase db push --db-url ...`).  
  Jika muncul ENOTFOUND, pakai Opsi A atau Opsi C.

**Opsi C — SQL Editor**

- Buka Supabase Dashboard → SQL Editor → New query, paste isi file di `kagi-app/supabase/migrations/` (urut: `20250214000000_create_menu_stock.sql`, lalu `20250214000002_create_orders_and_payments.sql`), jalankan Run.
