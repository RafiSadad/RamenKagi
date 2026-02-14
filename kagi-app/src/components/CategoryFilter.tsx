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
        <div className="sticky top-[57px] z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#FFF9EC]/5">
            <div className="max-w-md mx-auto px-4 py-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {/* All */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(null)}
                        className={cn(
                            "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeCategory === null
                                ? "bg-[#FFAF03] text-[#47240F] shadow-lg shadow-[#FFAF03]/25"
                                : "bg-[#FFF9EC]/10 text-[#FFF9EC]/70 hover:bg-[#FFF9EC]/15"
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
                                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                activeCategory === cat.slug
                                    ? "bg-[#FFAF03] text-[#47240F] shadow-lg shadow-[#FFAF03]/25"
                                    : "bg-[#FFF9EC]/10 text-[#FFF9EC]/70 hover:bg-[#FFF9EC]/15"
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
