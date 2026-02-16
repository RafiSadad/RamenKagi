"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { MenuItem, Category, getEffectivePrice, isDiscountActive } from "@/types/menu";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { getSuggestedUpsell } from "@/lib/upsell-scoring";
import { useEffect, useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";

interface MenuDetailModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
    categories: Category[];
}

const CATEGORY_EMOJI: Record<string, string> = {
    "kagi-signature": "🍜",
    "kagi-spicy-series": "🌶️",
    "kagi-donburi": "🍚",
    "kids-menu": "👶",
    "small-dishes": "🥟",
    "additional": "➕",
};

function getMenuItemImageUrl(item: MenuItem): string | null {
    // For detail modal, prefer detailMediaUrl, fallback to mediaUrl
    if (item.detailMediaUrl && item.detailMediaType === "image") return item.detailMediaUrl;
    if (item.mediaUrl && item.mediaType === "image") return item.mediaUrl;
    if (item.image) return item.image;
    return null;
}

function getMenuItemMediaForDetail(item: MenuItem): {
    url: string | null;
    type: "image" | "video" | null;
} {
    // Prefer detailMediaUrl for detail modal, fallback to mediaUrl
    if (item.detailMediaUrl && item.detailMediaType) {
        return { url: item.detailMediaUrl, type: item.detailMediaType };
    }
    if (item.mediaUrl && item.mediaType) {
        return { url: item.mediaUrl, type: item.mediaType };
    }
    // Legacy fallback
    if (item.videoUrl) return { url: item.videoUrl, type: "video" };
    if (item.image) return { url: item.image, type: "image" };
    return { url: null, type: null };
}

export default function MenuDetailModal({
    item,
    isOpen,
    onClose,
    menuItems,
    categories,
}: MenuDetailModalProps) {
    const addItem = useCartStore((s) => s.addItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const cartItems = useCartStore((s) => s.items);
    const [showUpsell, setShowUpsell] = useState(false);

    if (!item) return null;

    const isSoldOut = item.stock !== undefined && item.stock <= 0;
    const cartItem = cartItems.find((ci) => ci.menuItem._id === item._id);
    const quantity = cartItem?.quantity || 0;
    const isInCart = quantity > 0;

    // Get upsell suggestion
    const upsellSuggestion = getSuggestedUpsell(cartItems, menuItems);
    // Show upsell if item is in cart OR if user just added it
    const shouldShowUpsell = (isInCart || showUpsell) && upsellSuggestion.suggestedItem;

    const handleAdd = () => {
        if (isSoldOut) return;
        addItem(item);
        toast.success(`${item.name} ditambahkan ke keranjang!`, {
            duration: 2000,
        });
        setShowUpsell(true);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            updateQuantity(item._id, quantity - 1);
        } else {
            updateQuantity(item._id, 0);
            setShowUpsell(false);
        }
    };

    const handleIncrease = () => {
        if (isSoldOut) return;
        if (isInCart) {
            updateQuantity(item._id, quantity + 1);
        } else {
            addItem(item);
            setShowUpsell(true);
        }
    };

    const handleAddUpsell = (upsellItem: MenuItem) => {
        addItem(upsellItem);
        toast.success(`${upsellItem.name} ditambahkan!`, { duration: 1500 });
    };

    const emoji = CATEGORY_EMOJI[item.category] || "🍜";
    const imageUrl = getMenuItemImageUrl(item);
    const category = categories.find((c) => c.slug === item.category);

    // Show upsell when modal opens if item is already in cart
    useEffect(() => {
        if (isOpen && isInCart) {
            setShowUpsell(true);
        } else if (!isOpen) {
            setShowUpsell(false);
        }
    }, [isOpen, isInCart]);


    if (!item) return null;

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="bg-card border-t border-border max-h-[95vh] sm:max-h-[90vh] sm:max-w-md sm:mx-auto sm:rounded-2xl p-0 overflow-hidden">
                <DrawerTitle className="sr-only">{item.name}</DrawerTitle>
                <div className="mx-auto w-full max-w-md overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                    {/* Media Section - lebar tetap, tinggi mengikuti gambar asli agar tidak terpotong */}
                    <div className="relative w-full bg-gradient-to-br from-primary-foreground/30 to-transparent overflow-hidden -mt-4 sm:mt-0">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {/* Use detailMediaUrl if available, fallback to mediaUrl */}
                        {(() => {
                            const media = getMenuItemMediaForDetail(item);
                            if (media.type === "video" && media.url) {
                                return (
                                    <video
                                        src={media.url}
                                        muted
                                        loop
                                        playsInline
                                        autoPlay
                                        className="w-full aspect-video object-cover block"
                                        aria-label={item.name}
                                    />
                                );
                            }
                            if (media.type === "image" && media.url) {
                                return (
                                    <div className="relative w-full min-h-[200px]">
                                        <img
                                            src={media.url}
                                            alt={item.name}
                                            className="w-full h-auto block object-contain"
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div className="min-h-64 flex items-center justify-center text-7xl opacity-40">
                                    {emoji}
                                </div>
                            );
                        })()}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {item.stock !== undefined && item.stock <= 0 ? (
                                    <div className="bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Habis
                                    </div>
                                ) : item.isPopular ? (
                                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                        ⭐ Popular
                                    </div>
                                ) : null}
                                {item.category === "kagi-spicy-series" && (
                                    <div className="bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full">
                                        🌶️ Pedas
                                    </div>
                                )}
                            </div>

                            {/* Price tag */}
                            <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 bg-black/70 backdrop-blur-sm text-foreground text-lg font-bold px-4 py-2 rounded-full">
                                {isDiscountActive(item) ? (
                                    <>
                                        <span className="line-through text-foreground/60 text-base">
                                            {formatRupiah(item.price)}
                                        </span>
                                        <span>{formatRupiah(getEffectivePrice(item))}</span>
                                        {item.discountLabel ? (
                                            <span className="text-xs font-semibold text-primary">
                                                {item.discountLabel}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-primary">
                                                Promo
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    formatRupiah(getEffectivePrice(item))
                                )}
                            </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                            {/* Title and Category */}
                            <div>
                                <h2
                                    id="menu-detail-title"
                                    className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                                >
                                    {item.name}
                                </h2>
                                {category && (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <span className="text-lg">{category.icon}</span>
                                        <span>{category.title}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description - full text, preserve newlines from Sanity */}
                            <div className="text-foreground/70 text-base leading-relaxed whitespace-pre-line">
                                {item.description || ""}
                            </div>

                            {/* Add to Cart Section */}
                            <div className="pt-4 border-t border-border">
                                {isInCart ? (
                                    <div className="flex items-center gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleDecrease}
                                            className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            aria-label="Kurangi jumlah"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </motion.button>
                                        <span className="flex-1 text-center text-xl font-bold text-foreground">
                                            {quantity}
                                        </span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleIncrease}
                                            disabled={isSoldOut}
                                            className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            aria-label="Tambah jumlah"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAdd}
                                        disabled={isSoldOut}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Plus className="w-5 h-5" />
                                        {isSoldOut ? "Habis" : "Tambah ke Keranjang"}
                                    </motion.button>
                                )}
                            </div>

                            {/* Upsell Recommendation */}
                            <AnimatePresence>
                                {shouldShowUpsell && upsellSuggestion.suggestedItem && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="pt-4 border-t border-border"
                                    >
                                        <p className="text-sm font-semibold text-foreground mb-3">
                                            💡 Biar makin mantap:
                                        </p>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleAddUpsell(upsellSuggestion.suggestedItem!)}
                                            className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted border border-border rounded-xl p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {getMenuItemImageUrl(upsellSuggestion.suggestedItem) ? (
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={getMenuItemImageUrl(upsellSuggestion.suggestedItem)!}
                                                        alt={upsellSuggestion.suggestedItem.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                                                    {CATEGORY_EMOJI[upsellSuggestion.suggestedItem.category] || "🍜"}
                                                </div>
                                            )}
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {upsellSuggestion.suggestedItem.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {upsellSuggestion.copy}
                                                </p>
                                                <p className="text-sm font-bold text-primary mt-1">
                                                    +{formatRupiah(getEffectivePrice(upsellSuggestion.suggestedItem))}
                                                </p>
                                            </div>
                                            <Plus className="w-5 h-5 text-primary flex-shrink-0" />
                                        </motion.button>
                                    </motion.div>
                                )}
                    </AnimatePresence>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
