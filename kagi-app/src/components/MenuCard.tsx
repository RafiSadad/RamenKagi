"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface MenuCardProps {
    item: MenuItem;
    index: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
    "kagi-signature": "🍜",
    "kagi-spicy-series": "🌶️",
    "kagi-donburi": "🍚",
    "kids-menu": "👶",
    "small-dishes": "🥟",
    "additional": "➕",
};

export default function MenuCard({ item, index }: MenuCardProps) {
    const addItem = useCartStore((s) => s.addItem);

    const isSoldOut = item.stock !== undefined && item.stock <= 0;

    const handleAdd = () => {
        if (isSoldOut) return;
        addItem(item);
        toast.success(`${item.name} ditambahkan ke keranjang!`, {
            duration: 2000,
            style: {
                background: "#1a1410",
                color: "#FFF9EC",
                border: "1px solid rgba(255,249,236,0.1)",
            },
        });
    };

    const emoji = CATEGORY_EMOJI[item.category] || "🍜";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#FFF9EC]/[0.04] backdrop-blur-sm rounded-2xl overflow-hidden border border-[#FFF9EC]/[0.06] hover:border-[#FFAF03]/30 transition-all"
        >
            {/* Media Area: video (Cloudinary) > image > placeholder */}
            <div className="relative h-36 bg-gradient-to-br from-[#47240F]/30 to-transparent overflow-hidden">
                {item.videoUrl ? (
                    <video
                        src={item.videoUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        aria-label={item.name}
                    />
                ) : item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 200px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                        {emoji}
                    </div>
                )}

                {/* Sold out badge (priority over Popular) */}
                {item.stock !== undefined && item.stock <= 0 ? (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Habis
                    </div>
                ) : item.isPopular ? (
                    <div className="absolute top-2 left-2 bg-[#FFAF03] text-[#47240F] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ⭐ Popular
                    </div>
                ) : null}

                {/* Spicy indicator */}
                {item.category === "kagi-spicy-series" && (
                    <div className="absolute top-2 right-2 bg-[#CC3939] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🌶️ Pedas
                    </div>
                )}

                {/* Price tag */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[#FFF9EC] text-sm font-bold px-3 py-1 rounded-full">
                    {formatRupiah(item.price)}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="text-[#FFF9EC] font-semibold text-sm leading-tight">
                    {item.name}
                </h3>
                <p className="text-[#FFF9EC]/40 text-xs mt-1 line-clamp-2">
                    {item.description}
                </p>

                {/* Add button */}
                <motion.button
                    whileTap={isSoldOut ? undefined : { scale: 0.9 }}
                    onClick={handleAdd}
                    disabled={isSoldOut}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#FFAF03] hover:bg-[#e09e03] text-[#47240F] text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FFAF03]"
                >
                    <Plus className="w-4 h-4" />
                    {isSoldOut ? "Habis" : "Tambah"}
                </motion.button>
            </div>
        </motion.div>
    );
}
