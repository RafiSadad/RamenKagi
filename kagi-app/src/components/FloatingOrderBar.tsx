"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface FloatingOrderBarProps {
    onCartClick: () => void;
}

export default function FloatingOrderBar({ onCartClick }: FloatingOrderBarProps) {
    const totalItems = useCartStore((s) => s.getTotalItems());
    const totalPrice = useCartStore((s) => s.getTotalPrice());

    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
                >
                    <div className="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
                        <button
                            onClick={onCartClick}
                            className="w-full bg-primary text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl hover:bg-primary/90 transition-colors active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                                    {totalItems}
                                </span>
                                <span className="font-semibold text-sm">View Order</span>
                            </div>
                            <span className="font-bold text-sm">{formatRupiah(totalPrice)}</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
