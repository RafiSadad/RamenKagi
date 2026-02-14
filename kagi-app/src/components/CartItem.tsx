"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatRupiah } from "@/lib/utils";
import { CartItem as CartItemType, getEffectivePrice } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";

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

    const itemTotal =
        (getEffectivePrice(item.menuItem) +
            (item.selectedToppings?.reduce((t, top) => t + top.price, 0) || 0)) *
        item.quantity;

    const emoji = CATEGORY_EMOJI[item.menuItem.category] || "🍜";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3 py-3 border-b border-[#FFF9EC]/10"
        >
            {/* Emoji icon */}
            <div className="w-12 h-12 rounded-xl bg-[#FFF9EC]/10 flex items-center justify-center text-2xl flex-shrink-0">
                {emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-[#FFF9EC] text-sm font-semibold truncate">
                    {item.menuItem.name}
                </h4>
                {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <p className="text-[#FFF9EC]/40 text-xs truncate">
                        +{item.selectedToppings.map((t) => t.name).join(", ")}
                    </p>
                )}
                <p className="text-[#FFAF03] text-sm font-bold mt-0.5">
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
                    className="w-7 h-7 rounded-lg bg-[#FFF9EC]/10 flex items-center justify-center hover:bg-[#CC3939]/20 transition-colors"
                >
                    {item.quantity <= 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-[#CC3939]" />
                    ) : (
                        <Minus className="w-3.5 h-3.5 text-[#FFF9EC]/70" />
                    )}
                </motion.button>
                <span className="text-[#FFF9EC] font-semibold text-sm w-6 text-center">
                    {item.quantity}
                </span>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                        updateQuantity(item.menuItem._id, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-lg bg-[#FFAF03]/20 flex items-center justify-center hover:bg-[#FFAF03]/30 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5 text-[#FFAF03]" />
                </motion.button>
            </div>
        </motion.div>
    );
}
