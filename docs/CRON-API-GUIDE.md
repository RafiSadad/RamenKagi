# Cara Bikin API Cron (Next.js + Vercel)

Cron = job yang jalan otomatis di jadwal tertentu. Di Vercel, cron memanggil **API route** (GET) di project kamu.

---

## 1. Buat API route untuk cron

Buat file di **`kagi-app/src/app/api/cron/[nama-cron]/route.ts`**.

Contoh struktur:

```ts
// src/app/api/cron/job-saya/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // detik (sesuaikan kebutuhan)

export async function GET(req: NextRequest) {
    // 1. Auth: hanya Vercel Cron yang boleh panggil
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Logika cron (bersihkan data, kirim report, dll.)
    try {
        // ... pekerjaan kamu ...
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Cron error:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
```

- **GET** — Vercel Cron memanggil dengan method GET.
- **CRON_SECRET** — Set di Vercel Environment Variables; Vercel mengirim header `Authorization: Bearer <CRON_SECRET>` saat memanggil cron. Kalau tidak set, endpoint bisa return 401.

---

## 2. Daftarkan di `vercel.json`

Di **`kagi-app/vercel.json`**, tambah entry di array **`crons`**:

```json
{
  "crons": [
    {
      "path": "/api/cron/clean-receipts",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/job-saya",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

- **path** — URL route (harus dimulai `/`).
- **schedule** — Cron expression (format: menit jam tanggal bulan hari-minggu).

### Contoh jadwal

| Schedule       | Arti                          |
|----------------|-------------------------------|
| `* * * * *`    | Setiap menit                  |
| `0 * * * *`    | Setiap jam (menit 0)          |
| `0 0 * * *`    | Setiap hari tengah malam UTC  |
| `0 9 * * 1-5`  | Senin–Jumat jam 09:00 UTC     |
| `0 0 1 * *`    | Tiap tanggal 1 tengah malam   |

Waktu selalu **UTC**. Untuk WIB (UTC+7): `0 0 * * *` = 07:00 WIB.

---

## 3. Set CRON_SECRET di Vercel

1. Vercel → Project → **Settings** → **Environment Variables**.
2. **Add** → Name: `CRON_SECRET`, Value: (string rahasia, mis. hasil `openssl rand -hex 32`).
3. Centang **Production** (dan Preview kalau mau).

Tanpa ini, request ke endpoint cron bisa ditolak (401) kalau kode kamu mengecek auth.

---

## 4. Contoh yang sudah ada di project

- **Path:** `/api/cron/clean-receipts`
- **File:** `kagi-app/src/app/api/cron/clean-receipts/route.ts`
- **Jadwal:** `0 0 * * *` (sekali sehari tengah malam UTC)
- **Fungsi:** Hapus file di bucket Supabase `nota` yang umurnya > 3 hari.

Bisa dipakai sebagai referensi struktur dan auth.

---

## Ringkasan

1. Buat **GET** route di `src/app/api/cron/[nama]/route.ts`.
2. Cek **Authorization: Bearer CRON_SECRET** (optional tapi disarankan).
3. Tambah **path** dan **schedule** di `vercel.json`.
4. Set **CRON_SECRET** di Vercel.
5. Deploy; cron hanya jalan di **production**.
