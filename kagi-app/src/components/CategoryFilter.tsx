"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Category } from "@/types/menu";

interface CategoryFilterProps {
    categories: Category[];
    activeCategory: string | null;
    onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({
    categories,
    activeCategory,
    onSelect,
}: CategoryFilterProps) {
    return (
        <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-md mx-auto px-4 py-3">
                <div className="relative">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {/* All */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(null)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                activeCategory === null
                                    ? "bg-secondary text-secondary-foreground shadow-md"
                                    : "bg-white text-foreground/70 border border-border hover:bg-white/80"
                            )}
                        >
                            <span>🔥</span>
                            <span>All</span>
                        </motion.button>

                        {categories.map((cat) => (
                            <motion.button
                                key={cat._id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(cat.slug)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    activeCategory === cat.slug
                                        ? "bg-secondary text-secondary-foreground shadow-md"
                                        : "bg-white text-foreground/70 border border-border hover:bg-white/80"
                                )}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.title}</span>
                            </motion.button>
                        ))}
                    </div>
                    {/* Gradient fade hint */}
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background/95 to-transparent" />
                </div>
            </div>
        </div>
    );
}
