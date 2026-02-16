"use client";

import { useState } from "react";
import { Category, MenuItem } from "@/types/menu";
import MenuCard from "./MenuCard";
import CategoryFilter from "./CategoryFilter";
import { AnimatePresence, motion } from "framer-motion";

interface MenuGridProps {
    categories: Category[];
    menuItems: MenuItem[];
}

export default function MenuGrid({ categories, menuItems }: MenuGridProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredItems: MenuItem[] = activeCategory
        ? menuItems.filter((item) => item.category === activeCategory)
        : menuItems;

    return (
        <>
            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />

            <section className="max-w-md mx-auto px-4 py-6">
                <motion.div layout className="grid grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, i) => (
                            <MenuCard 
                                key={item._id} 
                                item={item} 
                                index={i}
                                menuItems={menuItems}
                                categories={categories}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-white/40">
                        <span className="text-4xl block mb-2">🍜</span>
                        Belum ada menu di kategori ini
                    </div>
                )}
            </section>
        </>
    );
}
