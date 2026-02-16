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
  /** URL gambar (Cloudinary). Di-seed ke Sanity sebagai mediaUrl + mediaType "image". */
  photoUrl?: string;
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
  Beverages: 5.5,
  Additional: 6,
};

const CATEGORY_ICON: Record<string, string> = {
  "Kagi Signature": "🍜",
  "Kagi Spicy Series": "🌶️",
  "Kagi Donburi": "🍚",
  "Kids Menu": "👶",
  "Small Dishes": "🥟",
  Beverages: "🥤",
  Additional: "➕",
};

/** Profil rasa & tipe produk untuk Smart Checkout Upsell (Rule 1–3). Berdasarkan referensi ramen/don/side Jepang. */
type FlavorCategory = "spicy" | "savory" | "sweet" | "neutral";
type ProductType = "main_dish" | "side_dish" | "beverage" | "dessert";
const UPSELL_FIELDS: Record<
  string,
  { flavor_category: FlavorCategory; product_type: ProductType; flavor_weight: number }
> = {
  "Kuro Garikku": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Kagi Shoyu Saikoro": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Beef Miruku": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Saikoro Miruku": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Kagi Toripaitan": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Kagi Shoyu Beef": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Chizu Beef": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Truffle Dry Ramen": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Chizu Saikoro": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Tori Gekikara": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 2 },
  "Saikoro Gekikara": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 2 },
  "Beef Teriyaki Don": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Chicken Teriyaki Don": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Nanban Chicken Donburi": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 2 },
  "Spicy Toripaitan": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 3 },
  "Saikoro Miruku Spicy": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 3 },
  "Chizu Beef Spicy": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 3 },
  "Chizu Saikoro Spicy": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 3 },
  "Beef Miruku Spicy": { flavor_category: "spicy", product_type: "main_dish", flavor_weight: 3 },
  "Chicken Karaage": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Karaage Mentai": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Gyoza": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Kimchi Gyoza": { flavor_category: "spicy", product_type: "side_dish", flavor_weight: 2 },
  "Yakitori": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Tamagoyaki": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Kentang Sosis": { flavor_category: "neutral", product_type: "side_dish", flavor_weight: 1 },
  "Tomoro Koshi": { flavor_category: "sweet", product_type: "side_dish", flavor_weight: 1 },
  "Topping Paha Ayam": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Beef Slice": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Noodles Kagi": { flavor_category: "neutral", product_type: "side_dish", flavor_weight: 1 },
  "Saikoro": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Mini Katsu": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Ajitama": { flavor_category: "savory", product_type: "side_dish", flavor_weight: 1 },
  "Yakiniku Bento": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Katsu Bento": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Toripop Bento": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Kochizu Ramen": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
  "Minitori Ramen": { flavor_category: "savory", product_type: "main_dish", flavor_weight: 1 },
};

function getUpsellFields(title: string) {
  const f = UPSELL_FIELDS[title];
  if (f) return f;
  const category = title.toLowerCase();
  if (category.includes("spicy") || category.includes("gekikara") || category.includes("nanban"))
    return { flavor_category: "spicy" as const, product_type: "main_dish" as const, flavor_weight: 2 };
  if (category.includes("ramen") || category.includes("don") || category.includes("bento"))
    return { flavor_category: "savory" as const, product_type: "main_dish" as const, flavor_weight: 1 };
  return { flavor_category: "savory" as const, product_type: "side_dish" as const, flavor_weight: 1 };
}

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
  if (!categoryNames.includes("Beverages")) categoryNames.push("Beverages");
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

  console.log("\n🌱 Seeding menu items + profil rasa/tipe (Upsell Rule 1–3)...");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = slugify(item.title);
    const categorySlug = slugify(item.category);
    const upsell = getUpsellFields(item.title);
    const doc = {
      _id: `menu-${slug}-${i}`,
      _type: "menuItem",
      name: item.title,
      slug: { _type: "slug", current: slug },
      price: item.price,
      description: item.description ?? "",
      category: { _type: "reference", _ref: `category-${categorySlug}` },
      ...(item.photoUrl && { mediaUrl: item.photoUrl, mediaType: "image" as const }),
      flavor_category: upsell.flavor_category,
      product_type: upsell.product_type,
      flavor_weight: upsell.flavor_weight,
      isPopular: false,
      isUpsell: item.category === "Small Dishes" || item.category === "Additional",
    };
    await client.createOrReplace(doc);
    console.log("  ✓", item.title, `[${upsell.flavor_category}/${upsell.product_type}]${item.category === "Small Dishes" || item.category === "Additional" ? " upsell" : ""}`);
  }

  // Minuman untuk Rule 1 upsell (mitigasi pedas). Referensi: ocha/ramune/mugicha biasa dipasangkan dengan ramen.
  const beverages = [
    { name: "Ocha", price: 0, description: "Teh hijau hangat. Gratis untuk setiap pesanan ramen.", flavor_category: "neutral" as const, flavor_weight: 1 },
    { name: "Ramune", price: 15000, description: "Soda Jepang segar dengan rasa original.", flavor_category: "sweet" as const, flavor_weight: 1 },
    { name: "Mugicha", price: 12000, description: "Teh barley dingin, toasty & nutty.", flavor_category: "neutral" as const, flavor_weight: 1 },
  ];
  console.log("\n🌱 Seeding minuman (beverage) untuk upsell Rule 1...");
  for (const b of beverages) {
    const slug = slugify(b.name);
    const doc = {
      _id: `menu-${slug}`,
      _type: "menuItem",
      name: b.name,
      slug: { _type: "slug", current: slug },
      price: b.price,
      description: b.description,
      category: { _type: "reference", _ref: "category-beverages" },
      flavor_category: b.flavor_category,
      product_type: "beverage" as const,
      flavor_weight: b.flavor_weight,
      isPopular: b.name === "Ocha",
      isUpsell: true,
    };
    await client.createOrReplace(doc);
    console.log("  ✓", b.name, "[beverage]");
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
      title: "NO PORK & NO LARD",
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

  console.log("\n✅ Seed selesai. Profil rasa & tipe produk sudah diisi → Rule 1–3 upsell siap.");
  console.log("   (Jika dataset sudah ada & hanya ingin update flavor: npx tsx scripts/patch-upsell-fields.ts)");
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
