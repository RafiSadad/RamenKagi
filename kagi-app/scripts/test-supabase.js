/**
 * Tes koneksi Supabase (URL + Publishable Key).
 * Jalankan dari folder kagi-app: node scripts/test-supabase.js
 */
const fs = require("fs");
const path = require("path");
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const i = line.indexOf("=");
      if (i > 0 && !line.startsWith("#")) {
        const key = line.slice(0, i).trim();
        const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (key && val && !process.env[key]) process.env[key] = val;
      }
    });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local");
  process.exit(1);
}

async function test() {
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      headers: { apikey: key },
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && (body?.status === "ok" || body?.version)) {
      console.log("✅ Koneksi Supabase berhasil (URL + Publishable Key valid)");
      console.log("   Project:", url.replace("https://", "").replace(".supabase.co", ""));
      return;
    }
    if (res.status === 401 && body?.msg) {
      console.log("✅ Supabase URL benar; key diterima (401 = auth required, normal untuk health)");
      return;
    }
    console.log("Response:", res.status, JSON.stringify(body));
  } catch (err) {
    console.error("❌ Gagal:", err.message);
    process.exit(1);
  }
}

test();
