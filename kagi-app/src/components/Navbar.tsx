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
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
            <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo + NO PORK & NO LARD */}
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/images/logo-kagi.webp"
                        alt="Kagi Ramen"
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                    />
                    <div className="flex flex-col gap-0.5 leading-tight">
                        <h1 className="text-lg font-bold text-foreground tracking-tight font-display">
                            Ramen KAGI
                        </h1>
                        <p className="text-[10px] text-primary" lang="ja">
                            ラーメンハウス
                        </p>
                        <span className="text-[9px] font-medium text-primary tracking-[0.12em] uppercase">
                            NO PORK & NO LARD
                        </span>
                    </div>
                </div>

                {/* Cart Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onCartClick}
                    className="relative p-2.5 rounded-full bg-foreground/10 hover:bg-foreground/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ShoppingCart className="w-5 h-5 text-foreground" />
                    <AnimatePresence>
                        {totalItems > 0 && (
                            <motion.span
                                key="badge"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
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
