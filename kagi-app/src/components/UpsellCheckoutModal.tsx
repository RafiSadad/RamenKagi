"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getEffectivePrice } from "@/types/menu";
import type { MenuItem } from "@/types/menu";

function getMenuItemImageUrl(item: MenuItem): string | null {
    if (item.mediaUrl && item.mediaType === "image") return item.mediaUrl;
    if (item.image) return item.image;
    return null;
}

interface UpsellCheckoutModalProps {
    open: boolean;
    suggestedItem: MenuItem;
    copy: string;
    onAddAndPay: () => void;
    onSkipAndPay: () => void;
    onClose: () => void;
}

export default function UpsellCheckoutModal({
    open,
    suggestedItem,
    copy,
    onAddAndPay,
    onSkipAndPay,
    onClose,
}: UpsellCheckoutModalProps) {
    const imageUrl = getMenuItemImageUrl(suggestedItem);
    const price = getEffectivePrice(suggestedItem);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "tween", duration: 0.2 }}
                            className="pointer-events-auto w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="upsell-modal-title"
                        >
                            <div className="p-4">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        aria-label="Tutup"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p
                                    id="upsell-modal-title"
                                    className="text-card-foreground text-sm leading-relaxed mb-4"
                                >
                                    {copy}
                                </p>
                                <div className="flex gap-3 items-center rounded-xl bg-muted/50 border border-border p-3 mb-4">
                                    {imageUrl ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                            <img
                                                src={imageUrl}
                                                alt=""
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                                            🍜
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-card-foreground font-semibold text-sm truncate">
                                            {suggestedItem.name}
                                        </p>
                                        <p className="text-primary font-bold text-sm">
                                            +{formatRupiah(price)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={onAddAndPay}
                                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onSkipAndPay}
                                        className="w-full py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        Tidak, Lanjut Bayar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
