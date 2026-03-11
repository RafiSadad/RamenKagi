"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface ChefSpecialProps {
    menuItems: MenuItem[];
}

export default function ChefSpecial({ menuItems }: ChefSpecialProps) {
    const popularItems = menuItems.filter((item) => item.isPopular);
    const addItem = useCartStore((s) => s.addItem);

    if (popularItems.length === 0) return null;

    const handleAdd = (item: MenuItem) => {
        const isSoldOut = item.stock !== undefined && item.stock <= 0;
        if (isSoldOut) return;
        addItem(item);
        toast.success(`${item.name} ditambahkan ke keranjang!`, { duration: 2000 });
    };

    return (
        <section className="max-w-md mx-auto px-4 pt-6 pb-2">
            <p className="text-secondary text-[11px] font-semibold uppercase tracking-[0.15em]">
                Selected for you
            </p>
            <h2 className="text-foreground font-display text-2xl font-bold mt-0.5">
                Popular Dishes
            </h2>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide mt-4 pb-2 -mx-4 px-4">
                {popularItems.map((item, i) => {
                    const isSoldOut = item.stock !== undefined && item.stock <= 0;
                    const imageUrl = item.mediaUrl && item.mediaType === "image"
                        ? item.mediaUrl
                        : item.image || null;

                    return (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="relative flex-shrink-0 w-[70vw] max-w-[280px] rounded-2xl overflow-hidden shadow-lg"
                        >
                            {/* Full-bleed image */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary text-5xl opacity-40">
                                        🍜
                                    </div>
                                )}

                                {/* Dark gradient overlay at bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Sold out overlay */}
                                {isSoldOut && (
                                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
                                        <span className="text-white font-bold text-sm tracking-widest uppercase">Habis</span>
                                    </div>
                                )}

                                {/* Content overlay on image */}
                                <div className="absolute inset-x-0 bottom-0 p-4 z-10">
                                    {/* Badge */}
                                    <span className="inline-block bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                                        TRENDING NOW
                                    </span>

                                    {/* Name + Add button row */}
                                    <div className="flex items-end justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-lg leading-tight">
                                                {item.name}
                                            </h3>
                                            <p className="text-white/70 text-xs mt-1 line-clamp-1">
                                                {item.description || "—"}
                                            </p>
                                        </div>

                                        <motion.button
                                            whileTap={isSoldOut ? undefined : { scale: 0.85 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAdd(item);
                                            }}
                                            disabled={isSoldOut}
                                            className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label={`Tambah ${item.name}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
