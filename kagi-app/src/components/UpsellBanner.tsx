"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Category, MenuItem, getEffectivePrice } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

const CATEGORY_EMOJI_FALLBACK: Record<string, string> = {
    "kagi-signature": "🍜",
    "kagi-spicy-series": "🌶️",
    "kagi-donburi": "🍚",
    "kids-menu": "👶",
    "small-dishes": "🥟",
    "additional": "➕",
    "beverages": "🥤",
};

// Category slug → product type fallback (saat product_type tidak di-set di Sanity)
const CATEGORY_TO_TYPE: Record<string, "main_dish" | "side_dish" | "beverage"> = {
    "kagi-signature": "main_dish",
    "kagi-spicy-series": "main_dish",
    "kagi-donburi": "main_dish",
    "kids-menu": "main_dish",
    "small-dishes": "side_dish",
    "beverages": "beverage",
    "additional": "beverage",
};

function getItemType(item: MenuItem): "main_dish" | "side_dish" | "beverage" | "other" {
    if (
        item.product_type === "main_dish" ||
        item.product_type === "side_dish" ||
        item.product_type === "beverage"
    ) {
        return item.product_type;
    }
    return CATEGORY_TO_TYPE[item.category] ?? "other";
}

function getMenuItemImageUrl(item: MenuItem): string | null {
    if (item.mediaUrl && item.mediaType === "image") return item.mediaUrl;
    if (item.image) return item.image;
    return null;
}

interface UpsellSection {
    title: string;
    emoji: string;
    items: MenuItem[];
}

const TYPE_CONFIG: Record<"main_dish" | "side_dish" | "beverage", { title: string; emoji: string }> = {
    main_dish: { title: "Makanan Utama", emoji: "🍜" },
    side_dish: { title: "Side Dish", emoji: "🥟" },
    beverage: { title: "Minuman", emoji: "🥤" },
};

interface UpsellBannerProps {
    menuItems: MenuItem[];
    categories: Category[];
}

export default function UpsellBanner({ menuItems, categories }: UpsellBannerProps) {
    const addItem = useCartStore((s) => s.addItem);
    const cartItems = useCartStore((s) => s.items);

    const getIcon = (categorySlug: string) =>
        categories.find((c) => c.slug === categorySlug)?.icon ||
        CATEGORY_EMOJI_FALLBACK[categorySlug] ||
        "🍜";

    const sections = useMemo<UpsellSection[]>(() => {
        const cartIds = new Set(cartItems.map((i) => i.menuItem._id));

        // Tentukan tipe apa saja yang sudah ada di keranjang
        const inCartTypes = new Set<"main_dish" | "side_dish" | "beverage" | "other">();
        for (const { menuItem } of cartItems) {
            inCartTypes.add(getItemType(menuItem));
        }

        const hasMain = inCartTypes.has("main_dish");
        const hasSide = inCartTypes.has("side_dish");
        const hasBev = inCartTypes.has("beverage");

        // Item yang belum di-order dan masih tersedia
        const available = menuItems.filter(
            (m) => !cartIds.has(m._id) && (m.stock === undefined || m.stock > 0)
        );

        // Tentukan tipe apa yang perlu disarankan (yang belum ada di cart)
        const wantTypes: Array<"main_dish" | "side_dish" | "beverage"> = [];

        if (!hasMain && (hasSide || hasBev)) wantTypes.push("main_dish");
        if (!hasSide && (hasMain || hasBev)) wantTypes.push("side_dish");
        if (!hasBev) wantTypes.push("beverage");

        // Bangun sections
        const result: UpsellSection[] = [];

        for (const type of wantTypes) {
            const items = available
                .filter((m) => getItemType(m) === type)
                .slice(0, 4);
            if (items.length > 0) {
                result.push({
                    title: TYPE_CONFIG[type].title,
                    emoji: TYPE_CONFIG[type].emoji,
                    items,
                });
            }
        }

        // Fallback: semua tipe sudah ada di cart → tampilkan item populer/upsell
        if (result.length === 0) {
            const fallback = available.filter((m) => m.isPopular || m.isUpsell).slice(0, 5);
            if (fallback.length > 0) {
                result.push({ title: "Sering Dipesan Barengan", emoji: "⭐", items: fallback });
            }
        }

        return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems.map((i) => i.menuItem._id).sort().join(","), menuItems]);

    if (sections.length === 0) return null;

    return (
        <div className="mt-4 mb-2 space-y-4">
            {sections.map((section) => (
                <div key={section.title}>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span>{section.emoji}</span>
                        <span>{section.title}</span>
                    </p>
                    <div className="relative">
                        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                            {section.items.map((item) => {
                                const imageUrl = getMenuItemImageUrl(item);
                                const icon = getIcon(item.category);
                                return (
                                    <motion.button
                                        key={item._id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            addItem(item);
                                            toast.success(`${item.name} ditambahkan!`, { duration: 1500 });
                                        }}
                                        className="flex-shrink-0 w-[110px] flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                                    >
                                        {/* Gambar */}
                                        <div className="relative w-full aspect-square overflow-hidden bg-muted">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-[1.05] transition-transform duration-300"
                                                    sizes="110px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                                                    {icon}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-2 flex flex-col gap-1 text-left">
                                            <p className="text-card-foreground text-[11px] font-semibold leading-tight line-clamp-2">
                                                {item.name}
                                            </p>
                                            <p className="text-primary text-[11px] font-bold">
                                                {formatRupiah(getEffectivePrice(item))}
                                            </p>
                                            <div className="mt-0.5 w-full flex items-center justify-center gap-1 bg-primary/15 hover:bg-primary/25 rounded-lg py-1 transition-colors">
                                                <Plus className="w-3 h-3 text-primary" />
                                                <span className="text-primary text-[10px] font-bold">Tambah</span>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                        {/* Gradient fade kanan — hint ada lebih banyak */}
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-card to-transparent" />
                    </div>
                </div>
            ))}
        </div>
    );
}
