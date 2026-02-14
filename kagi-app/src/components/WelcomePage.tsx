"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { WelcomePage as WelcomePageType } from "@/types/menu";

interface WelcomePageProps {
    welcome: WelcomePageType | null;
    onEnter: () => void;
}

const DEFAULT_CTA = "Lihat Menu";

export default function WelcomePage({ welcome, onEnter }: WelcomePageProps) {
    const title = welcome?.title?.trim() ?? "";
    const subtitle = welcome?.subtitle?.trim() ?? "";
    const ctaText = welcome?.ctaText?.trim() || DEFAULT_CTA;
    const bgUrl = welcome?.backgroundMediaUrl?.trim();
    const bgType = welcome?.backgroundMediaType || "image";
    const hasTitle = title.length > 0;
    const hasSubtitle = subtitle.length > 0;

    return (
        <AnimatePresence>
            <motion.div
                key="welcome"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-end bg-background overflow-hidden"
            >
                {/* Background: Cloudinary media or default ambient (brand brown gradient) */}
                <div className="absolute inset-0">
                    {bgUrl ? (
                        <>
                            {bgType === "video" ? (
                                <video
                                    src={bgUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={bgUrl}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/15 z-10" />
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-card/80 to-background z-10" />
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.15, 0.25, 0.15],
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.2, 1, 1.2],
                                    opacity: [0.1, 0.2, 0.1],
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-destructive/15 blur-[100px]"
                            />
                        </>
                    )}

                    {/* Subtle pattern overlay — hanya saat ada background media */}
                    {bgUrl && (
                    <div className="absolute inset-0 opacity-[0.02] z-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF9EC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                    )}
                </div>

                {/* Content — tanpa logo; teks hanya tampil kalau diisi di Sanity */}
                <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-6 max-w-md mx-auto">
                    {(hasTitle || hasSubtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-center mb-4"
                    >
                        {hasTitle && (
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight font-display">
                                {title.includes("Kagi Ramen") ? (
                                    <>
                                        {title.replace("Kagi Ramen", "").trim()}{" "}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                                            Kagi Ramen
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-orange-600">
                                        {title}
                                    </span>
                                )}
                            </h1>
                        )}
                        {hasSubtitle && (
                            <p className="text-foreground/50 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                    )}
                </div>

                {/* CTA Button — pinned to bottom */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="relative z-20 w-full max-w-md mx-auto px-6 pb-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onEnter}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 active:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {ctaText} 🍜
                    </motion.button>
                </motion.div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </motion.div>
        </AnimatePresence>
    );
}
