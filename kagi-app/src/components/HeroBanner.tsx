"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Banner } from "@/types/menu";

const AUTO_SLIDE_MS = 5000;
const SLIDE_VARIANTS = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function HeroBanner({ banners }: { banners: Banner[] }) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const count = banners.length;

    const goTo = useCallback(
        (next: number) => {
            if (count <= 0) return;
            const nextIndex = ((next % count) + count) % count;
            setDirection(nextIndex > index ? 1 : -1);
            setIndex(nextIndex);
        },
        [count, index]
    );

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(() => goTo(index + 1), AUTO_SLIDE_MS);
        return () => clearInterval(t);
    }, [count, index, goTo]);

    if (!banners?.length) {
        return (
            <section className="relative overflow-hidden bg-gradient-to-b from-background via-card to-secondary px-4 pt-6 pb-8">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF9EC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                <div className="relative max-w-md mx-auto rounded-2xl min-h-[140px] flex items-center justify-center text-foreground/50 text-sm">
                    Tambah banner di Sanity Studio (tipe &quot;banner&quot;, maks. 3).
                </div>
            </section>
        );
    }

    const current = banners[index];
    const href = current?.link || undefined;

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-card to-secondary px-4 pt-6 pb-8">
            {/* Japanese Seigaiha Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF9EC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative max-w-md mx-auto">
                <div className="relative rounded-2xl overflow-hidden h-[160px]">
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={SLIDE_VARIANTS}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-2xl"
                        >
                            {href ? (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                                    <BannerCard banner={current} />
                                </a>
                            ) : (
                                <BannerCard banner={current} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {count > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Banner ${i + 1}`}
                                onClick={() => goTo(i)}
                                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    i === index
                                        ? "w-6 bg-primary"
                                        : "w-2 bg-foreground/30 hover:bg-foreground/50"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function BannerCard({ banner }: { banner: Banner }) {
    return (
        <div className="relative rounded-2xl bg-gradient-to-r from-primary to-destructive p-4 overflow-hidden h-full min-h-[160px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative">
                {banner.title && (
                    <span className="inline-block bg-white/20 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full mb-1.5">
                        {banner.title}
                    </span>
                )}
                <h2 className="text-primary-foreground font-bold text-lg leading-tight">
                    {banner.headline}
                </h2>
                {banner.subtitle && (
                    <p className="text-primary-foreground/70 text-sm mt-1">{banner.subtitle}</p>
                )}
                {(banner.mediaUrl && banner.mediaType === "video") && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-lg overflow-hidden">
                        <video
                            src={banner.mediaUrl}
                            muted
                            loop
                            playsInline
                            autoPlay
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
                {((banner.mediaUrl && banner.mediaType === "image") || banner.image) && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                            src={(banner.mediaUrl && banner.mediaType === "image") ? banner.mediaUrl : banner.image!}
                            alt=""
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
