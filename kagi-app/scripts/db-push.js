/**
 * Jalankan Supabase migration dengan CLI: db push --db-url (pakai DATABASE_URL dari .env.local).
 * Dari folder kagi-app: npm run db:push
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

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

console.log("📤 Menjalankan supabase db push --db-url ...\n");
const r = spawnSync(
  "npx",
  ["supabase", "db", "push", "--db-url", databaseUrl, "--linked", "false"],
  { stdio: "inherit", shell: true, cwd: process.cwd() }
);
process.exit(r.status ?? 1);
