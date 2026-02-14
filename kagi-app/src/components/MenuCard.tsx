"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { MenuItem, getEffectivePrice, isDiscountActive } from "@/types/menu";
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
        });
    };

    const emoji = CATEGORY_EMOJI[item.category] || "🍜";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="group relative bg-foreground/[0.04] backdrop-blur-sm rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all"
        >
            {/* Media: Cloudinary (mediaUrl+mediaType) > legacy videoUrl/image > placeholder */}
            <div className="relative h-36 bg-gradient-to-br from-primary-foreground/30 to-transparent overflow-hidden">
                {item.mediaUrl && item.mediaType === "video" ? (
                    <video
                        src={item.mediaUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        aria-label={item.name}
                    />
                ) : item.mediaUrl && item.mediaType === "image" ? (
                    <Image
                        src={item.mediaUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 200px"
                    />
                ) : item.videoUrl ? (
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
                    <div className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Habis
                    </div>
                ) : item.isPopular ? (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ⭐ Popular
                    </div>
                ) : null}

                {/* Spicy indicator */}
                {item.category === "kagi-spicy-series" && (
                    <div className="absolute top-2 right-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🌶️ Pedas
                    </div>
                )}

                {/* Price tag */}
                <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5 bg-black/60 backdrop-blur-sm text-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {isDiscountActive(item) ? (
                        <>
                            <span className="line-through text-foreground/60">
                                {formatRupiah(item.price)}
                            </span>
                            <span>{formatRupiah(getEffectivePrice(item))}</span>
                            {item.discountLabel ? (
                                <span className="text-[10px] font-semibold text-primary">
                                    {item.discountLabel}
                                </span>
                            ) : (
                                <span className="text-[10px] font-semibold text-primary">
                                    Promo
                                </span>
                            )}
                        </>
                    ) : (
                        formatRupiah(getEffectivePrice(item))
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="text-foreground font-semibold text-sm leading-tight">
                    {item.name}
                </h3>
                <p className="text-foreground/40 text-xs mt-1 line-clamp-2">
                    {item.description}
                </p>

                {/* Add button */}
                <motion.button
                    whileTap={isSoldOut ? undefined : { scale: 0.9 }}
                    onClick={handleAdd}
                    disabled={isSoldOut}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Plus className="w-4 h-4" />
                    {isSoldOut ? "Habis" : "Tambah"}
                </motion.button>
            </div>
        </motion.div>
    );
}
