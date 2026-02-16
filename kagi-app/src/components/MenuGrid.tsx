"use client";

import { useState, useRef, useEffect } from "react";
import { Category, MenuItem } from "@/types/menu";
import MenuCard from "./MenuCard";
import CategoryFilter from "./CategoryFilter";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface MenuGridProps {
    categories: Category[];
    menuItems: MenuItem[];
}

/** CTA navigasi ke kategori berikutnya: copy + slug tujuan berdasarkan urutan kategori. */
function getNextCategoryCta(
    activeCategory: string | null,
    categories: Category[]
): { nextSlug: string | null; copy: string } | null {
    if (categories.length === 0) return null;
    const currentIndex = activeCategory
        ? categories.findIndex((c) => c.slug === activeCategory)
        : -1;
    // Index 0 = makanan, 1 = minuman, 2 = side dish, dst
    if (currentIndex === -1) {
        return {
            nextSlug: categories[0].slug,
            copy: `Lanjut pilih ${categories[0].title.toLowerCase()} yuk!`,
        };
    }
    if (currentIndex === 0) {
        const next = categories[1];
        return next
            ? { nextSlug: next.slug, copy: "Udah pesen makanan, sekarang pilih minumannya yuk!" }
            : { nextSlug: null, copy: "Gas tambah lagi biar makin seru!" };
    }
    if (currentIndex === 1) {
        const next = categories[2];
        return next
            ? { nextSlug: next.slug, copy: "Tambah side dish biar happy!" }
            : { nextSlug: null, copy: "Gas tambah lagi biar makin seru!" };
    }
    return { nextSlug: null, copy: "Gas tambah lagi biar makin seru!" };
}

export default function MenuGrid({ categories, menuItems }: MenuGridProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const masonryRef = useRef<HTMLDivElement>(null);
    const ctaWrapperRef = useRef<HTMLDivElement>(null);

    const filteredItems: MenuItem[] = activeCategory
        ? menuItems.filter((item) => item.category === activeCategory)
        : menuItems;

    const nextCta = getNextCategoryCta(activeCategory, categories);

    const handleSelectCategory = (slug: string | null) => {
        setActiveCategory(slug);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Sesuaikan tinggi CTA card dengan kartu di sampingnya (end card di baris yang sama)
    useEffect(() => {
        if (!nextCta || filteredItems.length === 0) return;
        const masonry = masonryRef.current;
        const ctaWrapper = ctaWrapperRef.current;
        if (!masonry || !ctaWrapper) return;

        const syncCtaHeight = () => {
            const children = masonry.children;
            if (children.length < 2 || !ctaWrapperRef.current) return;
            const lastCard = children[children.length - 2] as HTMLElement;
            if (lastCard) {
                const h = lastCard.offsetHeight;
                ctaWrapperRef.current.style.minHeight = `${h}px`;
            }
        };

        syncCtaHeight();

        const ro = new ResizeObserver(syncCtaHeight);
        ro.observe(masonry);

        return () => ro.disconnect();
    }, [filteredItems.length, nextCta]);

    return (
        <>
            <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onSelect={handleSelectCategory}
            />

            <section className="max-w-md mx-auto px-4 py-6">
                {/* Masonry ala Pinterest: 2 kolom, jarak vertikal tetap, card pendek membuat card bawah naik */}
                <motion.div
                    ref={masonryRef}
                    layout
                    className="columns-2 gap-x-3"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, i) => (
                            <div
                                key={item._id}
                                className="mb-3 break-inside-avoid"
                            >
                                <MenuCard
                                    item={item}
                                    index={i}
                                    menuItems={menuItems}
                                    categories={categories}
                                />
                            </div>
                        ))}
                        {/* Kartu CTA: tinggi mengikuti end card di sampingnya */}
                        {filteredItems.length > 0 && nextCta && (
                            <div ref={ctaWrapperRef} className="mb-3 break-inside-avoid flex flex-col">
                                <motion.button
                                    type="button"
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleSelectCategory(nextCta.nextSlug)}
                                    className="w-full flex-1 min-h-0 text-left rounded-2xl border border-border bg-foreground/[0.04] hover:bg-foreground/[0.08] hover:border-primary/30 transition-all p-4 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <span className="text-2xl flex-shrink-0">🍜</span>
                                    <span className="text-sm font-medium text-foreground leading-snug flex-1">
                                        {nextCta.copy}
                                    </span>
                                    <ChevronRight className="w-5 h-5 flex-shrink-0 text-primary" />
                                </motion.button>
                            </div>
                        )}
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
