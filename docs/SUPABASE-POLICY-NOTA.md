# Panduan Policy Supabase Storage – Bucket `nota`

Bucket `nota` dipakai untuk menyimpan gambar nota (receipt) yang di-upload dari app. Supaya **link gambar bisa dibuka** (public read), kamu bisa pakai **Public bucket** saja, atau atur lewat **Policy**.

---

## Opsi A: Public bucket (paling simpel)

1. Supabase Dashboard → **Storage** → **Buckets**.
2. Klik bucket **nota**.
3. **Settings** (atau ikon gear) → nyalakan **Public bucket** → **Save**.

Selesai. Tidak perlu isi policy. Upload dari app (Service Role) tetap jalan.

---

## Opsi B: Atur lewat Policy (bucket tetap private)

Kalau kamu **tidak** menyalakan Public bucket dan mau mengatur akses lewat policy, buat **satu policy untuk baca (read)** supaya URL gambar bisa dibuka.

### Policy 1: Baca (read) – agar link nota bisa dibuka

| Field | Isian |
|-------|--------|
| **Policy name** | `nota public read` (atau nama lain, max 50 karakter) |
| **Allowed operation** | Centang **SELECT**. (Opsional: bisa juga pilih tombol **download** atau **getPublicUrl** kalau UI menampilkan itu.) |
| **Target roles** | Biarkan **Defaults to all (public) roles** atau pilih **anon** / **public** supaya siapa saja yang punya link bisa baca. |
| **Policy definition** | `bucket_id = 'nota'` |

Lalu klik **Save** / **Create policy**.

- Artinya: siapa saja (termasuk tanpa login) boleh **baca/unduh** file di bucket `nota` selama punya URL. Cocok untuk link nota yang kita beri ke user.

### Policy 2: Upload (opsional)

Upload dari app pakai **Service Role Key**, yang **tidak terpengaruh RLS**. Jadi policy upload **tidak wajib** agar simpan nota jalan.

Kalau tetap mau buat policy upload (misalnya untuk dokumentasi atau anon key di tempat lain):

| Field | Isian |
|-------|--------|
| **Policy name** | `nota allow upload` |
| **Allowed operation** | Centang **INSERT** (atau pilih **upload** kalau ada). |
| **Target roles** | Pilih **service_role** saja (hanya backend yang boleh upload), atau **authenticated** kalau nanti ada upload dari user login. |
| **Policy definition** | `bucket_id = 'nota'` |

---

## Ringkasan untuk kasus kamu

- **Cukup untuk app Ramen Kagi:**  
  - **Opsi A:** Nyalakan **Public bucket** untuk `nota`, **atau**  
  - **Opsi B:** Satu policy **SELECT** (read) dengan target **public/anon** dan `bucket_id = 'nota'`.

- **Upload** tidak perlu policy khusus karena backend pakai Service Role (bypass RLS).

- Setelah salah satu (Public bucket atau policy read) aktif, link gambar nota dari `getPublicUrl` bisa dibuka di browser.

---

## Kalau file tidak masuk ke bucket (upload gagal)

1. **Cek `SUPABASE_SERVICE_ROLE_KEY`**  
   Harus pakai **Service Role** (JWT) dari Supabase Dashboard → **Settings** → **API** → **Project API keys** → **service_role** (klik Reveal). Bentuknya panjang dan **dimulai dengan `eyJ`**.  
   Jangan pakai anon key atau key lain (mis. `sb_secret_...`) — itu bukan key untuk Storage admin.

2. **Bucket `nota` harus ada**  
   Di Dashboard → **Storage** → **Buckets**: kalau belum ada, klik **New bucket** → nama **nota** → centang **Public bucket** → Create. Kode bisa coba buat bucket otomatis, tapi kalau gagal (izin/project), buat manual.

3. **Cek error di app**  
   Setelah simpan nota, kalau upload gagal sekarang akan muncul toast error. Di **Network** tab (F12) → request ke `/api/receipt/upload` → Response bisa berisi `detail` berisi pesan error dari Supabase.
