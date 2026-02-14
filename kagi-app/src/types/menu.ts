/** Data halaman welcome (sebelum home). Dari Sanity, singleton. */
export interface WelcomePage {
  _id: string
  /** URL Cloudinary untuk background (image atau video). */
  backgroundMediaUrl?: string | null
  backgroundMediaType?: 'image' | 'video' | null
  title?: string | null
  subtitle?: string | null
  ctaText?: string | null
}

export interface Banner {
  _id: string;
  title?: string | null;
  headline: string;
  subtitle?: string | null;
  /** Cloudinary URL (image or video). Prefer over image. */
  mediaUrl?: string | null;
  /** "image" | "video" */
  mediaType?: "image" | "video" | null;
  /** @deprecated Use mediaUrl + mediaType. Kept for backward compat. */
  image?: string | null;
  link?: string | null;
  order?: number | null;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  /** Cloudinary URL (image or video). Prefer over image/videoUrl. */
  mediaUrl?: string | null;
  /** "image" | "video" */
  mediaType?: "image" | "video" | null;
  /** @deprecated Use mediaUrl + mediaType. Kept for backward compat. */
  image?: string | null;
  /** @deprecated Use mediaUrl + mediaType. Kept for backward compat. */
  videoUrl?: string | null;
  price: number;
  description: string;
  category: string; // category slug
  /** Untuk Smart Checkout Upsell (scoring keranjang). */
  flavor_category?: "spicy" | "savory" | "sweet" | "neutral" | null;
  product_type?: "main_dish" | "side_dish" | "beverage" | "dessert" | null;
  flavor_weight?: number | null; // 1–3, default 1
  isPopular: boolean;
  isUpsell: boolean;
  /** From Supabase menu_stock; undefined = no row (unlimited) */
  stock?: number;
  /** Diskon persen (0–100). Opsional. */
  discountPercent?: number | null;
  /** Diskon nominal (Rp). Opsional. */
  discountAmount?: number | null;
  /** Teks tampilan diskon (mis. "Promo 20%"). */
  discountLabel?: string | null;
  /** Waktu mulai berlaku diskon (ISO datetime). */
  discountStart?: string | null;
  /** Waktu selesai berlaku diskon (ISO datetime). */
  discountEnd?: string | null;
}

/** Returns true if item has a discount that is currently within its validity period. */
export function isDiscountActive(item: MenuItem): boolean {
  const hasDiscount =
    (item.discountAmount != null && item.discountAmount > 0) ||
    (item.discountPercent != null && item.discountPercent > 0);
  if (!hasDiscount) return false;
  const now = new Date();
  if (item.discountStart && now < new Date(item.discountStart)) return false;
  if (item.discountEnd && now > new Date(item.discountEnd)) return false;
  return true;
}

/** Returns the effective price (after discount) if discount is active and in period; otherwise item.price. */
export function getEffectivePrice(item: MenuItem): number {
  if (!isDiscountActive(item)) return item.price;
  const base = item.price;
  if (item.discountAmount != null && item.discountAmount > 0) {
    return Math.max(0, base - item.discountAmount);
  }
  if (item.discountPercent != null && item.discountPercent > 0) {
    return Math.max(0, base * (1 - item.discountPercent / 100));
  }
  return base;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  customerName: string;
  tableNumber: string;
  isTakeaway: boolean;
  items: CartItem[];
  totalPrice: number;
  notes: string;
  orderId?: string;
  paymentStatus?: string;
}
