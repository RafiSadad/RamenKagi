import type { CartItem, MenuItem } from "@/types/menu";

const DEFAULT_FLAVOR_WEIGHT = 1;

export type UpsellCopyKey =
  | "spicy_beverage"
  | "savory_sweet"
  | "main_side"
  | "fallback";

export interface UpsellSuggestion {
  suggestedItem: MenuItem | null;
  copy: string;
  copyKey: UpsellCopyKey;
}

function weight(item: MenuItem): number {
  const w = item.flavor_weight ?? DEFAULT_FLAVOR_WEIGHT;
  return Math.min(3, Math.max(1, w));
}

type ProductType = NonNullable<MenuItem["product_type"]>;

function findBeverage(notInCart: MenuItem[]): MenuItem | undefined {
  return (
    notInCart.find((m) => m.product_type === "beverage") ||
    notInCart.find((m) => m.category === "beverages")
  );
}

function getFallbackCopy(item: MenuItem, productType: ProductType | null): string {
  switch (productType) {
    case "beverage":
      return `Makan enak belum lengkap tanpa yang seger-seger. Basahin tenggorokan pakai ${item.name} yuk!`;
    case "side_dish":
      return `Biar meja makin rame dan perut makin happy, selipin ${item.name} buat temen ngunyahmu.`;
    case "dessert":
      return `Selalu ada ruang buat yang manis-manis, kan? ${item.name} ini best-seller buat cuci mulut lho.`;
    case "main_dish":
      return `Lagi laper berat atau mau sharing bareng? ${item.name} ini pas banget buat nambah porsi bahagiamu.`;
    default:
      return `Pilihan favorit Teman Kagi nih! ${item.name} selalu sukses bikin pelanggan nambah lagi.`;
  }
}

/** Pure function: compute cart flavor/product scores and pick at most one upsell suggestion. */
export function getSuggestedUpsell(
  items: CartItem[],
  allMenuItems: MenuItem[]
): UpsellSuggestion {
  const cartIds = new Set(items.map((i) => i.menuItem._id));
  const notInCart = allMenuItems.filter((m) => !cartIds.has(m._id));
  if (notInCart.length === 0) {
    return { suggestedItem: null, copy: "", copyKey: "fallback" };
  }

  let totalSpicyScore = 0;
  let totalSavoryScore = 0;
  let totalBeverageQty = 0;
  let totalSweetQty = 0;
  let hasMainDish = false;
  let hasSideDish = false;
  let firstMainDishName: string | null = null;

  for (const { menuItem, quantity } of items) {
    const w = weight(menuItem);
    const q = quantity;
    if (menuItem.flavor_category === "spicy") totalSpicyScore += w * q;
    if (menuItem.flavor_category === "savory") totalSavoryScore += w * q;
    if (menuItem.product_type === "beverage" || menuItem.category === "beverages") totalBeverageQty += q;
    if (
      menuItem.product_type === "dessert" ||
      menuItem.flavor_category === "sweet"
    )
      totalSweetQty += q;
    if (menuItem.product_type === "main_dish") {
      hasMainDish = true;
      if (!firstMainDishName) firstMainDishName = menuItem.name;
    }
    if (menuItem.product_type === "side_dish") hasSideDish = true;
  }

  // Rule 1: Mitigasi pedas — validasi keberanian, tawarkan "penyelamat" yang menyegarkan
  if (totalSpicyScore > totalBeverageQty) {
    const beverage = findBeverage(notInCart);
    if (beverage) {
      return {
        suggestedItem: beverage,
        copy: `Wah, pesananmu pedas nendang nih! 🌶️ Biar lidah tetap enjoy, segerin pakai ${beverage.name} yuk?`,
        copyKey: "spicy_beverage",
      };
    }
  }

  // Rule 2: Mitigasi gurih — palate cleanser, sensory words (lumer, manis legit)
  if (
    totalSavoryScore >= 1 &&
    (totalBeverageQty === 0 || totalSweetQty === 0)
  ) {
    const sweet = notInCart.find((m) => m.flavor_category === "sweet");
    if (sweet) {
      return {
        suggestedItem: sweet,
        copy: `Habis nikmatin yang gurih-gurih, emang paling bener ditutup sama lumer-nya ${sweet.name}. Cobain deh!`,
        copyKey: "savory_sweet",
      };
    }
  }

  // Rule 3: Pairing main + side — efek "kurang lengkap", FOMO (bites renyah)
  const beverageSatisfied = totalBeverageQty >= totalSpicyScore;
  if (beverageSatisfied && hasMainDish && !hasSideDish) {
    const sideSavory = notInCart.find(
      (m) =>
        m.product_type === "side_dish" && m.flavor_category === "savory"
    );
    if (sideSavory) {
      const mainName = firstMainDishName ?? "makanan utama";
      return {
        suggestedItem: sideSavory,
        copy: `Makan ${mainName} rasanya ada yang kurang kalau belum ditemenin bites renyah dari ${sideSavory.name}.`,
        copyKey: "main_side",
      };
    }
  }

  // Rule 1b: Keranjang belum ada minuman sama sekali — rekomendasikan minuman (biar selalu keluar)
  if (totalBeverageQty === 0) {
    const beverage = findBeverage(notInCart);
    if (beverage) {
      return {
        suggestedItem: beverage,
        copy: getFallbackCopy(beverage, "beverage"),
        copyKey: "fallback",
      };
    }
  }

  // Fallback: personalized copy by product type (bukan generic "Sempurnakan... kami")
  const typesInCart = new Set(
    items
      .map((i) => i.menuItem.product_type)
      .filter((t): t is ProductType => t != null)
  );
  const typesInCartOrBeverages = new Set(typesInCart);
  if (totalBeverageQty > 0) typesInCartOrBeverages.add("beverage");
  const missingTypes = (
    ["beverage", "side_dish", "dessert", "main_dish"] as const
  ).filter((t) => !typesInCartOrBeverages.has(t));

  for (const t of missingTypes) {
    const candidate =
      t === "beverage"
        ? findBeverage(notInCart)
        : notInCart.find((m) => m.product_type === t);
    if (candidate) {
      return {
        suggestedItem: candidate,
        copy: getFallbackCopy(candidate, t),
        copyKey: "fallback",
      };
    }
  }

  // Default fallback: best seller / upsell — pakai copy sesuai tipe item
  const bestSeller = notInCart.find((m) => m.isPopular || m.isUpsell);
  if (bestSeller) {
    const productType =
      bestSeller.product_type ??
      (bestSeller.category === "beverages" ? ("beverage" as const) : null);
    return {
      suggestedItem: bestSeller,
      copy: getFallbackCopy(bestSeller, productType),
      copyKey: "fallback",
    };
  }

  // First available not in cart
  const first = notInCart[0];
  const firstType =
    first.product_type ??
    (first.category === "beverages" ? ("beverage" as const) : null);
  return {
    suggestedItem: first,
    copy: getFallbackCopy(first, firstType),
    copyKey: "fallback",
  };
}
