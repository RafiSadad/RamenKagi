"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#1a1410] to-[#231810] px-4 pt-6 pb-8">
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
                {/* NO PORK & LARD Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 mb-4"
                >
                    <span className="inline-flex items-center gap-1.5 bg-[#335005]/20 border border-[#335005]/30 text-[#7ab33a] text-xs font-bold px-3 py-1 rounded-full">
                        ✅ NO PORK & LARD
                    </span>
                    <span className="text-[#FFF9EC]/40 text-xs">Halal & Aman</span>
                </motion.div>

                {/* Promo Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative rounded-2xl bg-gradient-to-r from-[#FFAF03] to-[#CC3939] p-4 mb-6 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                    <div className="relative">
                        <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1.5">
                            🎉 PROMO TEMAN KAGI
                        </span>
                        <h2 className="text-[#47240F] font-bold text-lg leading-tight">
                            Gratis Ocha untuk setiap pesanan ramen!
                        </h2>
                        <p className="text-[#47240F]/70 text-sm mt-1">
                            Kaldu 8 jam, rasa yang jujur. ☕
                        </p>
                    </div>
                </motion.div>

                {/* Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <h2 className="text-3xl font-bold text-[#FFF9EC] leading-tight">
                        Selamat Datang,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFAF03] to-[#CC3939]">
                            Teman Kagi!
                        </span>{" "}
                        🍜
                    </h2>
                    <p className="text-[#FFF9EC]/50 text-sm mt-2 leading-relaxed">
                        Semangkuk ramen hangat untuk meredakan lelahmu hari ini.
                        <br />
                        Pilih menu favoritmu dan pesan langsung dari mejamu.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
