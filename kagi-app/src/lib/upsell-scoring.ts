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
    if (menuItem.product_type === "beverage") totalBeverageQty += q;
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

  // Rule 1: Mitigasi pedas — keranjang terlalu pedas, minum kurang
  if (totalSpicyScore > totalBeverageQty) {
    const beverage = notInCart.find((m) => m.product_type === "beverage");
    if (beverage) {
      return {
        suggestedItem: beverage,
        copy: `Keranjang kamu lumayan pedas nih! Tambah ${beverage.name} biar lidah adem dan perut aman?`,
        copyKey: "spicy_beverage",
      };
    }
  }

  // Rule 2: Mitigasi gurih — savory tinggi, minuman rendah atau tanpa manis
  if (
    totalSavoryScore >= 1 &&
    (totalBeverageQty === 0 || totalSweetQty === 0)
  ) {
    const sweet = notInCart.find((m) => m.flavor_category === "sweet");
    if (sweet) {
      return {
        suggestedItem: sweet,
        copy: `Biar gurihnya ramen makin balance, tambah manisnya ${sweet.name} yuk!`,
        copyKey: "savory_sweet",
      };
    }
  }

  // Rule 3: Pairing makanan utama — minuman cukup, ada main tanpa side
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
        copy: `Makan ${mainName} rasanya kurang pas kalau ga ditemenin ${sideSavory.name} yang juicy!`,
        copyKey: "main_side",
      };
    }
  }

  // Fallback: kategori yang belum ada di keranjang
  type ProductType = NonNullable<MenuItem["product_type"]>;
  const typesInCart = new Set(
    items
      .map((i) => i.menuItem.product_type)
      .filter((t): t is ProductType => t != null)
  );
  const missingTypes = (
    ["beverage", "side_dish", "dessert", "main_dish"] as const
  ).filter((t) => !typesInCart.has(t));
  for (const t of missingTypes) {
    const candidate = notInCart.find((m) => m.product_type === t);
    if (candidate) {
      return {
        suggestedItem: candidate,
        copy: `Sempurnakan pesananmu dengan tambahan ${candidate.name} favorit pelanggan kami!`,
        copyKey: "fallback",
      };
    }
  }

  // Default fallback: best seller / upsell belum di keranjang
  const bestSeller = notInCart.find((m) => m.isPopular || m.isUpsell);
  if (bestSeller) {
    return {
      suggestedItem: bestSeller,
      copy: `Sempurnakan pesananmu dengan tambahan ${bestSeller.name} favorit pelanggan kami!`,
      copyKey: "fallback",
    };
  }

  // First available not in cart
  const first = notInCart[0];
  return {
    suggestedItem: first,
    copy: `Sempurnakan pesananmu dengan tambahan ${first.name} favorit pelanggan kami!`,
    copyKey: "fallback",
  };
}
