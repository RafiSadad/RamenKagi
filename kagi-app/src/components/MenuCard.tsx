"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { MenuItem, getEffectivePrice, isDiscountActive } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useState } from "react";
import MenuDetailModal from "./MenuDetailModal";
import type { Category } from "@/types/menu";

interface MenuCardProps {
    item: MenuItem;
    index: number;
    menuItems: MenuItem[];
    categories: Category[];
}

export default function MenuCard({ item, index, menuItems, categories }: MenuCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const cartItems = useCartStore((s) => s.items);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSoldOut = item.stock !== undefined && item.stock <= 0;

    const cartItem = cartItems.find((ci) => ci.menuItem._id === item._id);
    const quantity = cartItem?.quantity || 0;
    const isInCart = quantity > 0;

    const handleAdd = () => {
        if (isSoldOut) return;
        addItem(item);
        toast.success(`${item.name} ditambahkan ke keranjang!`, {
            duration: 2000,
        });
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            updateQuantity(item._id, quantity - 1);
        } else {
            updateQuantity(item._id, 0);
        }
    };

    const handleIncrease = () => {
        if (isSoldOut) return;
        if (isInCart) {
            updateQuantity(item._id, quantity + 1);
        } else {
            addItem(item);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-border/50 transition-all"
        >
            {/* Media */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="relative w-full block overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-2xl"
                aria-label={`Lihat detail ${item.name}`}
            >
                {item.mediaUrl && item.mediaType === "video" ? (
                    <video
                        src={item.mediaUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500 block"
                        aria-label={item.name}
                    />
                ) : item.mediaUrl && item.mediaType === "image" ? (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <img
                            src={item.mediaUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ) : item.videoUrl ? (
                    <video
                        src={item.videoUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500 block"
                        aria-label={item.name}
                    />
                ) : item.image ? (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ) : (
                    <div className="min-h-36 flex items-center justify-center text-5xl opacity-40 bg-muted group-hover:scale-110 transition-transform duration-500">
                        🍜
                    </div>
                )}

                {/* Sold-out overlay */}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-white font-bold text-sm tracking-widest uppercase opacity-90">Habis</span>
                    </div>
                )}

                {/* Badges on image */}
                <div className="absolute inset-x-0 top-0 pointer-events-none flex items-start justify-between p-2 z-20">
                    <div className="flex flex-col gap-1">
                        {item.stock !== undefined && item.stock <= 0 ? (
                            <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Habis
                            </span>
                        ) : item.isPopular ? (
                            <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                BEST SELLER
                            </span>
                        ) : null}
                    </div>
                    {item.category === "kagi-spicy-series" && (
                        <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🌶️ SPICY LV.{item.flavor_weight || 1}
                        </span>
                    )}
                </div>
            </button>

            {/* Content */}
            <div className="p-3">
                <h3 className="text-foreground font-bold text-[15px] leading-tight">
                    {item.name}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2 leading-relaxed" title={item.description ?? undefined}>
                    {item.description || "—"}
                </p>

                {/* Price + Add button row */}
                <div className="flex items-end justify-between mt-3">
                    {/* Price */}
                    <div className="flex flex-col">
                        {isDiscountActive(item) ? (
                            <>
                                <span className="line-through text-muted-foreground text-[11px]">
                                    {formatRupiah(item.price)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-primary font-bold text-sm">
                                        {formatRupiah(getEffectivePrice(item))}
                                    </span>
                                    {item.discountLabel && (
                                        <span className="text-[9px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                                            {item.discountLabel}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="text-primary font-bold text-sm">
                                {formatRupiah(getEffectivePrice(item))}
                            </span>
                        )}
                    </div>

                    {/* Add / Quantity */}
                    {isInCart ? (
                        <div className="flex items-center gap-1 bg-primary rounded-full overflow-hidden">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDecrease}
                                className="flex items-center justify-center w-8 h-8 text-white hover:bg-primary/80 transition-colors"
                                aria-label="Kurangi jumlah"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </motion.button>
                            <span className="text-white text-xs font-bold min-w-[16px] text-center">
                                {quantity}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleIncrease}
                                disabled={isSoldOut}
                                className="flex items-center justify-center w-8 h-8 text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                                aria-label="Tambah jumlah"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            whileTap={isSoldOut ? undefined : { scale: 0.85 }}
                            onClick={handleAdd}
                            disabled={isSoldOut}
                            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Tambah ${item.name}`}
                        >
                            <Plus className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Menu Detail Modal */}
            <MenuDetailModal
                item={item}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                menuItems={menuItems}
                categories={categories}
            />
        </motion.div>
    );
}
