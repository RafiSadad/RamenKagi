"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Category, MenuItem, getEffectivePrice } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

function shuffleSlice<T>(arr: T[], max: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, max);
}

const CATEGORY_EMOJI_FALLBACK: Record<string, string> = {
    "kagi-signature": "🍜",
    "kagi-spicy-series": "🌶️",
    "kagi-donburi": "🍚",
    "kids-menu": "👶",
    "small-dishes": "🥟",
    "additional": "➕",
};

function getMenuItemImageUrl(item: MenuItem): string | null {
    if (item.mediaUrl && item.mediaType === "image") return item.mediaUrl;
    if (item.image) return item.image;
    return null;
}

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

    const displayedItems = useMemo(
        () => shuffleSlice(upsellItems, 5),
        [upsellItems.map((i) => i._id).sort().join(",")]
    );

    if (displayedItems.length === 0) return null;

    return (
        <div className="mt-4 mb-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                Sering dipesan barengan 👇
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {displayedItems.map((item) => {
                    const imageUrl = getMenuItemImageUrl(item);
                    return (
                        <motion.button
                            key={item._id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                addItem(item);
                                toast.success(`${item.name} ditambahkan!`, { duration: 1500 });
                            }}
                            className="flex-shrink-0 flex items-center gap-2 bg-foreground/[0.04] border border-border rounded-xl px-3 py-2 hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {imageUrl ? (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                            ) : (
                                <span className="text-lg flex-shrink-0">
                                    {getIcon(item.category)}
                                </span>
                            )}
                            <div className="text-left">
                                <p className="text-card-foreground text-xs font-semibold whitespace-nowrap">
                                    {item.name}
                                </p>
                                <p className="text-primary text-xs font-bold">
                                    +{formatRupiah(getEffectivePrice(item))}
                                </p>
                            </div>
                            <Plus className="w-4 h-4 text-primary ml-1 flex-shrink-0" />
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
