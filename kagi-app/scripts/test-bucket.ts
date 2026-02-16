/**
 * Test Supabase Storage bucket "nota": upload test.txt dan list isi bucket.
 * Jalankan dari kagi-app: npx tsx scripts/test-bucket.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const BUCKET = "nota";

function loadEnvLocal() {
  let envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    envPath = path.join(process.cwd(), "kagi-app", ".env.local");
  }
  if (!fs.existsSync(envPath)) {
    console.error(".env.local tidak ditemukan. Jalankan dari folder kagi-app (atau repo root).");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  });
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ada di .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const testPath = path.join(process.cwd(), "test.txt");
  if (!fs.existsSync(testPath)) {
    fs.writeFileSync(testPath, "Test upload bucket nota – " + new Date().toISOString(), "utf8");
    console.log("Created test.txt");
  }
  const body = fs.readFileSync(testPath);
  const filePath = `test-${Date.now()}.txt`;

  console.log("\n1. Upload test.txt ke bucket '" + BUCKET + "'...");
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, body, { contentType: "text/plain", upsert: true });

  if (uploadErr) {
    console.error("Upload gagal:", uploadErr.message);
    process.exit(1);
  }
  console.log("   OK → path:", uploadData.path);

  console.log("\n2. List file di bucket...");
  const { data: listData, error: listErr } = await supabase.storage.from(BUCKET).list("", { limit: 20 });
  if (listErr) {
    console.error("List gagal:", listErr.message);
    process.exit(1);
  }
  console.log("   File count:", listData.length);
  listData.forEach((f) => console.log("   -", f.name));

  console.log("\n3. Download / baca file yang baru di-upload...");
  const { data: downData, error: downErr } = await supabase.storage.from(BUCKET).download(filePath);
  if (downErr) {
    console.error("Download gagal:", downErr.message);
    process.exit(1);
  }
  const text = Buffer.from(await downData.arrayBuffer()).toString("utf8");
  console.log("   Isi:", text.slice(0, 80) + (text.length > 80 ? "..." : ""));

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  console.log("\n   Public URL:", urlData.publicUrl);
  console.log("\n✅ Bucket bisa ditulis dan dibaca.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
