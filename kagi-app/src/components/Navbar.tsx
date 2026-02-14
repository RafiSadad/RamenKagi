"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

interface NavbarProps {
    onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
    const totalItems = useCartStore((s) => s.getTotalItems());

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0f0f]/90 border-b border-[#FFF9EC]/5">
            <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/images/logo-kagi.webp"
                        alt="Kagi Ramen"
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                    />
                    <div>
                        <h1 className="text-lg font-bold text-[#FFF9EC] tracking-tight leading-none">
                            KAGI
                        </h1>
                        <p className="text-[10px] text-[#FFAF03] tracking-[0.25em] uppercase leading-none">
                            Ramen House
                        </p>
                    </div>
                </div>

                {/* Cart Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onCartClick}
                    className="relative p-2.5 rounded-full bg-[#FFF9EC]/10 hover:bg-[#FFF9EC]/15 transition-colors"
                >
                    <ShoppingCart className="w-5 h-5 text-[#FFF9EC]" />
                    <AnimatePresence>
                        {totalItems > 0 && (
                            <motion.span
                                key="badge"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFAF03] text-[#47240F] text-xs font-bold rounded-full flex items-center justify-center"
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </nav>
    );
}
