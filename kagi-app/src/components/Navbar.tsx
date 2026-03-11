"use client";

import Image from "next/image";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

interface NavbarProps {
    onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
    const items = useCartStore((s) => s.items);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
            <div className="max-w-md mx-auto grid grid-cols-3 items-center px-4 py-3">
                {/* Back button */}
                <div className="flex items-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                {/* Centered Logo */}
                <div className="flex justify-center">
                    <Image
                        src="/images/logokagi.png"
                        alt="Kagi Ramen"
                        width={80}
                        height={48}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </div>

                {/* Cart Button */}
                <div className="flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onCartClick}
                        className="relative p-2.5 rounded-full bg-accent hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            </div>
        </nav>
    );
}
