/**
 * Jalankan migration SQL ke Supabase (pakai DATABASE_URL dari .env.local).
 * Dari folder kagi-app: node scripts/run-migrations.js
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const i = line.indexOf("=");
    if (i > 0 && !line.startsWith("#")) {
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) process.env[key] = val;
    }
  });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ Set DATABASE_URL di .env.local");
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

async function run() {
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log("✅ Terhubung ke database Supabase\n");
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`📄 Menjalankan ${file}...`);
      await client.query(sql);
      console.log(`   Selesai.\n`);
    }
    console.log("✅ Semua migration berhasil.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
