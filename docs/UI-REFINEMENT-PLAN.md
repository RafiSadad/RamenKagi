# Rencana Refinemen UI — Kagi Ramen

Rencana ini menggabungkan **branding** dari `referensi/ramenKagi-Branding.md` dengan **standar estetika** dari `.cursor/rules/frontend-aesthetics.mdc`. Untuk **tipografi**, mengikuti rules (font distinctive); untuk warna, copy, dan trust mengikuti branding.

---

## 1. Tipografi (Rules only)

**Saat ini:** Outfit (cukup generic per rules).

**Tindakan:**
- Ganti ke font yang **distinctive**, hangat/editorial/Jepang sesuai konteks ramen.
- Opsi yang disarankan (sesuai rules):
  - **Display/heading:** Noto Serif JP atau Zen Kaku Gothic (nuansa Jepang, premium).
  - **Body:** Tetap satu font yang readable — bisa Zen Kaku Gothic New (Latin + JP) atau Fraunces (warm editorial).
- Definisi di `layout.tsx` pakai `next/font/google`, ekspos via CSS variable:
  - `--font-display` (heading, logo, CTA)
  - `--font-body` (paragraf, menu, form)
- Di `globals.css`:
  - `@theme inline` set `--font-sans` / `--font-serif` dari variabel di atas.
  - Pastikan Tailwind `font-sans` / `font-display` pakai variabel tersebut.

**Deliverable:** `layout.tsx` + `globals.css` pakai 1–2 font baru; zero Inter/Roboto/Arial/Space Grotesk.

---

## 2. Warna & Tema (Branding + Rules)

**Branding (tetap dipakai):**

| Token          | Hex       | Pemakaian UI |
|----------------|-----------|--------------|
| Bright Pearl   | `#FFF9EC` | Foreground, teks utama, nav |
| Creamy Yellow  | `#FAFAD0` | Card bg (secondary) |
| Warm Dark Brown| `#47240F` | Teks di atas cream/kuning, primary-foreground |
| Chinese Yellow | `#FFAF03` | CTA, primary, accent |
| Crimson Red    | `#CC3939` | Spicy, diskon, sold out, destructive |
| Freeway Green  | `#335005` | Halal, NO PORK & LARD, indikator segar |

**Rules:** Semua warna lewat CSS variables; dominant colors + sharp accents.

**Tindakan:**
- Pastikan `globals.css` sudah mendefinisikan semua token di atas (sudah ada; bisa tambah `--cream-card: #FAFAD0`, `--halal: #335005` jika belum).
- **Refactor komponen:** ganti hardcoded hex (`#0f0f0f`, `#FFF9EC`, `#FFAF03`, `#1a1410`, dll.) dengan class Tailwind yang mengacu ke theme: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, `bg-destructive`, dll.
- File yang perlu disentuh: `Navbar`, `HeroBanner`, `WelcomePage`, `MenuCard`, `CategoryFilter`, `CartDrawer`, `CartItem`, `CheckoutForm`, `UpsellBanner`, dan komponen UI shared (button, drawer, card).

**Deliverable:** Satu sumber warna di `globals.css`; komponen bebas hex (kecuali inline pattern SVG jika perlu).

---

## 3. Background & Kedalaman (Rules + Branding)

**Rules:** Atmosphere & depth; layered gradients, geometric patterns; hindari flat solid.

**Branding:** Hangat, wabi-sabi, minimalis.

**Tindakan:**
- **WelcomePage (tanpa media):** Ganti fallback `#0a1520` ke palet branding: `var(--background)` + gradient cokelat gelap (sama dengan hero), agar konsisten dengan sisa app.
- **Hero / Section:** Pertahankan pola Seigaiha; boleh tambah lapisan halus (mis. radial gradient sangat subtle dari `--primary` / cream) untuk warmth.
- **Card menu:** Sudah ada gradient halus; pastikan pakai `--card` / `--secondary` dari theme.
- **Umum:** Hindari background flat; tetap satu lapis pattern + satu lapis gradient di mana relevan.

**Deliverable:** Welcome fallback selaras dengan dark brown theme; section pakai token + pattern/gradient konsisten.

---

## 4. Motion (Rules)

**Rules:** CSS dulu untuk hover/focus; Framer Motion untuk page load, stagger, satu momen “impact”.

**Tindakan:**
- **Page load:** Pertahankan alur Welcome → Main dengan fade; untuk Main, pertimbangkan **stagger** pada Hero + MenuGrid (mis. `staggerChildren` + `delayChildren` pada container, tiap child `opacity` + `y`) supaya satu orchestrated reveal.
- **Micro-interactions:** Tetap pakai `whileTap` / `whileHover` yang ada (navbar, cart, category, menu card, cart item); tidak perlu tambah banyak; prioritaskan satu sequence page load yang rapi.
- **Transisi:** Sedapat mungkin pakai CSS `transition-*` untuk hover/focus (border, background, shadow); Framer hanya untuk enter/exit dan layout animation.

**Deliverable:** Satu page-load sequence dengan stagger yang jelas; sisanya CSS + sedikit Framer yang sudah ada.

---

## 5. Branding Khusus (dari dokumen)

**5.1 NO PORK & LARD (trust, aksesibilitas diet)**  
- **Tindakan:** Tambah indikator kecil di **header/navbar** (ikon + teks “NO PORK & LARD” atau “Halal-friendly”) dengan warna **Freeway Green** (`#335005` / `--halal`). Tetap minimalis agar tidak ramai.

**5.2 Copywriting empatik**  
- **Tindakan:** Cek semua string yang terlihat user (empty cart, toast, placeholder form, error, CTA). Pastikan nada “Teman Kagi”, hangat, dan manusiawi (contoh: “Keranjang masih kosong nih…” sudah baik; pertahankan pola serupa di form & error).

**5.3 Trust di checkout**  
- **Tindakan:** Di bawah ringkasan pesanan / tombol Bayar, pastikan ada: teks/logo “Pembayaran aman” atau pemroses (Midtrans); opsional: ikon gembok/keamanan. Sesuai branding: trust indicators terang tanpa mendominasi.

**5.4 Hierarki menu**  
- **Tindakan:** Sudah ada kategori (Signature, Spicy, dll.) dan badge (Popular, Pedas). Pastikan Signature/Spicy Series tetap paling visible (urutan + styling) sesuai branding.

**Deliverable:** Satu elemen NO PORK & LARD di navbar; copy dan trust indicators konsisten dengan branding.

---

## 6. Aksesibilitas & Polish

- **Focus visible:** Semua input dan button punya `focus-visible:ring-2` (atau setara) dengan warna `--ring` / primary; konsisten di form checkout dan filter kategori.
- **Kontras:** Palet branding sudah kontras (cream on dark, brown on cream); pastikan badge dan placeholder memenuhi kontras minimum.
- **Radius:** Standarkan (mis. card `rounded-2xl`, button `rounded-xl`, chip `rounded-full`) dan dokumentasikan singkat di rule atau komentar di `globals.css` jika perlu.

---

## 7. Urutan Implementasi yang Disarankan

| # | Blok | Deskripsi singkat |
|---|------|-------------------|
| 1 | Token & theme | Pastikan `globals.css` punya semua token branding + `--halal`; tidak ubah nilai hex branding. |
| 2 | Typography | Ganti font di `layout.tsx` + `globals.css` (--font-display, --font-body). |
| 3 | Refactor warna komponen | Ganti hex ke class theme di Navbar, HeroBanner, WelcomePage, MenuGrid, MenuCard, CategoryFilter, CartDrawer, CartItem, CheckoutForm, UpsellBanner, UI primitives. |
| 4 | Welcome fallback | Fallback background WelcomePage pakai var(--background) + gradient cokelat. |
| 5 | NO PORK & LARD | Tambah di navbar (Freeway Green). |
| 6 | Page-load motion | Stagger Hero + daftar menu (satu parent motion, staggerChildren). |
| 7 | Focus & trust | Focus-visible di form/button; trust copy + logo di checkout. |
| 8 | Copy & polish | Review copy empatik; radius konsisten. |

---

## 8. Checklist Akhir

- [ ] Font: distinctive (Noto Serif JP / Zen Kaku Gothic / Fraunces), tidak pakai Inter/Roboto/Arial/Space Grotesk.
- [ ] Warna: 100% dari CSS variables; palet branding (Bright Pearl, Creamy Yellow, Warm Dark Brown, Chinese Yellow, Crimson Red, Freeway Green) dipakai konsisten.
- [ ] Background: ada depth/pattern/gradient; Welcome fallback selaras dengan dark theme.
- [ ] Motion: satu orchestrated page load dengan stagger; micro-interactions tetap terjaga.
- [ ] NO PORK & LARD terlihat di header; trust indicators di checkout.
- [ ] Copy empatik “Teman Kagi”; focus visible dan kontras OK.

Setelah plan ini dijalankan, UI akan selaras dengan branding Ramen Kagi dan standar frontend-aesthetics (khususnya tipografi dan konsistensi token).
