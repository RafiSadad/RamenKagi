"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatRupiah } from "@/lib/utils";
import { CartItem as CartItemType, getEffectivePrice } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";

/** URL gambar menu: mediaUrl (image) > legacy image. */
function getMenuItemImageUrl(item: CartItemType["menuItem"]): string | null {
    if (item.mediaUrl && item.mediaType === "image") return item.mediaUrl;
    if (item.image) return item.image;
    return null;
}

interface CartItemProps {
    item: CartItemType;
}

const CATEGORY_EMOJI: Record<string, string> = {
    "kagi-signature": "🍜",
    "kagi-spicy-series": "🌶️",
    "kagi-donburi": "🍚",
    "kids-menu": "👶",
    "small-dishes": "🥟",
    "additional": "➕",
};

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();

    const itemTotal = getEffectivePrice(item.menuItem) * item.quantity;

    const emoji = CATEGORY_EMOJI[item.menuItem.category] || "🍜";
    const imageUrl = getMenuItemImageUrl(item.menuItem);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 py-3 border-b border-border"
        >
            {/* Gambar menu atau fallback emoji */}
            <div className="relative w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    <span className="text-2xl">{emoji}</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-card-foreground text-sm font-semibold truncate">
                    {item.menuItem.name}
                </h4>
                <p className="text-primary text-sm font-bold mt-0.5">
                    {formatRupiah(itemTotal)}
                </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-1.5">
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                        item.quantity <= 1
                            ? removeItem(item.menuItem._id)
                            : updateQuantity(item.menuItem._id, item.quantity - 1)
                    }
                    className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center hover:bg-destructive/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {item.quantity <= 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                        <Minus className="w-3.5 h-3.5 text-foreground/70" />
                    )}
                </motion.button>
                <span className="text-card-foreground font-semibold text-sm w-6 text-center">
                    {item.quantity}
                </span>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                        updateQuantity(item.menuItem._id, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                </motion.button>
            </div>
        </motion.div>
    );
}
