/**
 * Seed Sanity dari file JSON referensi.
 * Jalankan dari folder kagi-app: npx tsx scripts/seed-sanity.ts
 *
 * Env: SANITY_API_WRITE_TOKEN (atau SANITY_API_TOKEN), NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

// Load .env.local (cwd = kagi-app, atau repo root)
const candidates = [
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), "kagi-app", ".env.local"),
];
for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const eq = line.indexOf("=");
      if (eq > 0 && line[0] !== "#") {
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) process.env[key] = val;
      }
    }
    break;
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "j2xbsoqh";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!token) {
  console.error(
    "❌ Set SANITY_API_WRITE_TOKEN atau SANITY_API_TOKEN di .env.local (dari sanity.io/manage → API → Tokens)"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

type JsonMenuItem = {
  _type: string;
  title: string;
  category: string;
  price: number;
  description: string;
  hasPhoto?: boolean;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const CATEGORY_ORDER: Record<string, number> = {
  "Kagi Signature": 1,
  "Kagi Spicy Series": 2,
  "Kagi Donburi": 3,
  "Kids Menu": 4,
  "Small Dishes": 5,
  Additional: 6,
};

const CATEGORY_ICON: Record<string, string> = {
  "Kagi Signature": "🍜",
  "Kagi Spicy Series": "🌶️",
  "Kagi Donburi": "🍚",
  "Kids Menu": "👶",
  "Small Dishes": "🥟",
  Additional: "➕",
};

async function seed() {
  const jsonPath = path.join(
    process.cwd(),
    "..",
    "referensi",
    "menu-ramen-kagi.json"
  );
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ File tidak ditemukan:", jsonPath);
    console.error("   Jalankan dari folder kagi-app: npx tsx scripts/seed-sanity.ts");
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const items: JsonMenuItem[] = JSON.parse(raw);
  if (!Array.isArray(items) || items.length === 0) {
    console.error("❌ JSON harus array berisi menu.");
    process.exit(1);
  }

  const categoryNames = [...new Set(items.map((i) => i.category))];
  const categoriesWithOrder = categoryNames
    .map((name) => ({
      name,
      slug: slugify(name),
      order: CATEGORY_ORDER[name] ?? 99,
      icon: CATEGORY_ICON[name] ?? "🍽️",
    }))
    .sort((a, b) => a.order - b.order);

  console.log("🌱 Seeding categories...");
  for (const cat of categoriesWithOrder) {
    const doc = {
      _id: `category-${cat.slug}`,
      _type: "category",
      title: cat.name,
      slug: { _type: "slug", current: cat.slug },
      icon: cat.icon,
      order: cat.order,
    };
    await client.createOrReplace(doc);
    console.log("  ✓", cat.name);
  }

  console.log("\n🌱 Seeding menu items (isi Media URL Cloudinary di Sanity Studio jika perlu)...");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = slugify(item.title);
    const categorySlug = slugify(item.category);
    const doc = {
      _id: `menu-${slug}-${i}`,
      _type: "menuItem",
      name: item.title,
      slug: { _type: "slug", current: slug },
      price: item.price,
      description: item.description ?? "",
      category: { _type: "reference", _ref: `category-${categorySlug}` },
      isPopular: false,
      isUpsell: false,
    };
    await client.createOrReplace(doc);
    console.log("  ✓", item.title);
  }

  const banners = [
    {
      _id: "banner-promo-ocha",
      _type: "banner" as const,
      title: "PROMO TEMAN KAGI",
      headline: "Gratis Ocha untuk setiap pesanan ramen!",
      subtitle: "Kaldu 8 jam, rasa yang jujur. ☕",
      order: 0,
    },
    {
      _id: "banner-selamat-datang",
      _type: "banner" as const,
      title: "Selamat Datang",
      headline: "Semangkuk ramen hangat untuk meredakan lelahmu hari ini.",
      subtitle: "Pilih menu favoritmu dan pesan langsung dari mejamu.",
      order: 1,
    },
    {
      _id: "banner-no-pork",
      _type: "banner" as const,
      title: "NO PORK & LARD",
      headline: "Halal & Aman untuk Teman Kagi.",
      subtitle: "Nikmati ramen dengan tenang.",
      order: 2,
    },
  ];

  console.log("\n🌱 Seeding banners (maks. 3, tampil di carousel hero)...");
  for (const doc of banners) {
    await client.createOrReplace(doc);
    console.log("  ✓", doc.headline.slice(0, 40) + (doc.headline.length > 40 ? "…" : ""));
  }

  console.log("\n✅ Seed selesai. Buka Sanity Studio untuk isi Media URL (Cloudinary) jika perlu.");
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
