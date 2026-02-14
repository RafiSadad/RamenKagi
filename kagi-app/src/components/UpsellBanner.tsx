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
            <p className="text-[#FFF9EC]/60 text-xs font-semibold uppercase tracking-wider mb-2">
                🔥 Tambah ini juga, Teman Kagi?
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {upsellItems.slice(0, 5).map((item) => (
                    <motion.button
                        key={item._id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            addItem(item);
                            toast.success(`${item.name} ditambahkan!`, {
                                duration: 1500,
                                style: {
                                    background: "#1a1410",
                                    color: "#FFF9EC",
                                    border: "1px solid rgba(255,249,236,0.1)",
                                },
                            });
                        }}
                        className="flex-shrink-0 flex items-center gap-2 bg-[#FFF9EC]/[0.04] border border-[#FFF9EC]/10 rounded-xl px-3 py-2 hover:border-[#FFAF03]/30 transition-all"
                    >
                        <span className="text-lg">
                            {getIcon(item.category)}
                        </span>
                        <div className="text-left">
                            <p className="text-[#FFF9EC] text-xs font-semibold whitespace-nowrap">
                                {item.name}
                            </p>
                            <p className="text-[#FFAF03] text-xs font-bold">
                                +{formatRupiah(getEffectivePrice(item))}
                            </p>
                        </div>
                        <Plus className="w-4 h-4 text-[#FFAF03] ml-1" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
