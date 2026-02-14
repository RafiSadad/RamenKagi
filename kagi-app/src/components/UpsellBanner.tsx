"use client";

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
};

interface UpsellBannerProps {
    menuItems: MenuItem[];
    categories: Category[];
}

export default function UpsellBanner({
    menuItems,
    categories,
}: UpsellBannerProps) {
    const addItem = useCartStore((s) => s.addItem);
    const cartItems = useCartStore((s) => s.items);

    const getIcon = (categorySlug: string) =>
        categories.find((c) => c.slug === categorySlug)?.icon ||
        CATEGORY_EMOJI_FALLBACK[categorySlug] ||
        "🍜";

    const cartIds = new Set(cartItems.map((i) => i.menuItem._id));
    const upsellItems: MenuItem[] = menuItems.filter(
        (item) => item.isUpsell && !cartIds.has(item._id)
    );

    if (upsellItems.length === 0) return null;

    return (
        <div className="mt-4 mb-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                🔥 Tambah ini juga, Teman Kagi?
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {upsellItems.slice(0, 5).map((item) => (
                    <motion.button
                        key={item._id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            addItem(item);
                            toast.success(`${item.name} ditambahkan!`, { duration: 1500 });
                        }}
                        className="flex-shrink-0 flex items-center gap-2 bg-foreground/[0.04] border border-border rounded-xl px-3 py-2 hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="text-lg">
                            {getIcon(item.category)}
                        </span>
                        <div className="text-left">
                            <p className="text-card-foreground text-xs font-semibold whitespace-nowrap">
                                {item.name}
                            </p>
                            <p className="text-primary text-xs font-bold">
                                +{formatRupiah(getEffectivePrice(item))}
                            </p>
                        </div>
                        <Plus className="w-4 h-4 text-primary ml-1" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
