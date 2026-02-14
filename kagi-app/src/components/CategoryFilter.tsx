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
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {/* All */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(null)}
                        className={cn(
                            "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            activeCategory === null
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                        )}
                    >
                        <span>🔥</span>
                        <span>Semua</span>
                    </motion.button>

                    {categories.map((cat) => (
                        <motion.button
                            key={cat._id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(cat.slug)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                activeCategory === cat.slug
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                            )}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.title}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
