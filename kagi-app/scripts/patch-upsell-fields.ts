/**
 * Patch hanya flavor_category, product_type, flavor_weight pada menuItem yang sudah ada.
 * Tidak mengubah field lain (mediaUrl, dll). Aman dijalankan setelah data ada di Sanity.
 * Jalankan dari folder kagi-app: npx tsx scripts/patch-upsell-fields.ts
 *
 * Env: SANITY_API_WRITE_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

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
  console.error("❌ Set SANITY_API_WRITE_TOKEN di .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

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
  "Ocha": { flavor_category: "neutral", product_type: "beverage", flavor_weight: 1 },
  "Ramune": { flavor_category: "sweet", product_type: "beverage", flavor_weight: 1 },
  "Mugicha": { flavor_category: "neutral", product_type: "beverage", flavor_weight: 1 },
};

function getUpsellFields(name: string) {
  const f = UPSELL_FIELDS[name];
  if (f) return f;
  const lower = name.toLowerCase();
  if (lower.includes("ocha") || lower.includes("ramune") || lower.includes("mugicha") || lower.includes("tea") || lower.includes("teh") || lower.includes("soda") || lower.includes("minuman"))
    return { flavor_category: "neutral" as const, product_type: "beverage" as const, flavor_weight: 1 };
  if (lower.includes("spicy") || lower.includes("gekikara") || lower.includes("nanban"))
    return { flavor_category: "spicy" as const, product_type: "main_dish" as const, flavor_weight: 2 };
  if (lower.includes("ramen") || lower.includes("don") || lower.includes("bento"))
    return { flavor_category: "savory" as const, product_type: "main_dish" as const, flavor_weight: 1 };
  return { flavor_category: "savory" as const, product_type: "side_dish" as const, flavor_weight: 1 };
}

async function patch() {
  const ids = await client.fetch<string[]>(
    `*[_type == "menuItem"]._id`
  );
  if (ids.length === 0) {
    console.log("Tidak ada menuItem di dataset. Jalankan seed-sanity.ts dulu.");
    return;
  }
  const items = await client.fetch<{ _id: string; name: string }[]>(
    `*[_type == "menuItem"]{ _id, name }`
  );
  console.log("🌱 Patching flavor_category, product_type, flavor_weight untuk", items.length, "menu...");
  for (const item of items) {
    const upsell = getUpsellFields(item.name);
    await client.patch(item._id).set({
      flavor_category: upsell.flavor_category,
      product_type: upsell.product_type,
      flavor_weight: upsell.flavor_weight,
    }).commit();
    console.log("  ✓", item.name, `[${upsell.flavor_category}/${upsell.product_type}]`);
  }
  console.log("\n✅ Patch selesai. Rule 1–3 upsell siap.");
}

patch().catch((err) => {
  console.error("❌ Patch gagal:", err);
  process.exit(1);
});
