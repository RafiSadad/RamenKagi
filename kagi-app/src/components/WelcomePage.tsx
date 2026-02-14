"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface WelcomePageProps {
    onEnter: () => void;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
    return (
        <AnimatePresence>
            <motion.div
                key="welcome"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-end bg-[#0a1520] overflow-hidden"
            >
                {/* Ambient background */}
                <div className="absolute inset-0">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1520]/40 via-[#0a1520]/60 to-[#0a1520]/95 z-10" />

                    {/* Animated ambient circles */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FFAF03]/20 blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#CC3939]/15 blur-[100px]"
                    />

                    {/* Japanese pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] z-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFF9EC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-6 max-w-md mx-auto">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <Image
                            src="/images/logo-kagi.webp"
                            alt="Kagi Ramen"
                            width={200}
                            height={200}
                            className="w-44 h-auto drop-shadow-2xl"
                            priority
                        />
                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="text-center mb-4"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-[#FFF9EC] leading-tight tracking-tight">
                            Welcome to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFAF03] to-[#e08a03]">
                                Kagi Ramen
                            </span>
                        </h1>
                        <p className="text-[#FFF9EC]/50 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                            Nikmati menu kami yang dibuat dengan penuh cinta dan cita rasa autentik Jepang.
                        </p>
                    </motion.div>
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
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFAF03] to-[#e08a03] text-[#47240F] font-bold text-lg shadow-xl shadow-[#FFAF03]/25 transition-all hover:shadow-2xl hover:shadow-[#FFAF03]/30 active:shadow-lg"
                    >
                        Lihat Menu 🍜
                    </motion.button>
                </motion.div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFAF03]/30 to-transparent" />
            </motion.div>
        </AnimatePresence>
    );
}
