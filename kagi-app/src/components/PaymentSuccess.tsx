"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, CheckCircle2, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getEffectivePrice } from "@/types/menu";
import type { Order } from "@/types/menu";
import { toast } from "sonner";

interface PaymentSuccessProps {
    order: Order;
    onClose: () => void;
}

// Receipt content component for visible receipt (uses CSS classes)
function ReceiptContent({ order, totalItems, currentDate }: { order: Order; totalItems: number; currentDate: string }) {
    return (
        <>
            {/* Paper texture effect */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{
                     backgroundImage: `repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 10px,
                         rgba(0,0,0,0.1) 10px,
                         rgba(0,0,0,0.1) 20px
                     )`
                 }}
            />
            {/* Receipt Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">🍜 KAGI RAMEN</h3>
                <p className="text-xs text-gray-600">
                    Jl. Ramen No. 123, Surabaya
                </p>
                <p className="text-xs text-gray-600 mt-1">
                    Telp: (031) 1234-5678
                </p>
            </div>

            {/* Order Info */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No. Pesanan:</span>
                    <span className="font-semibold text-gray-900">
                        {order.orderId || "KAGI-" + Date.now()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="text-gray-900">{currentDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nama:</span>
                    <span className="text-gray-900 font-semibold">
                        {order.customerName}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        {order.isTakeaway ? "Tipe:" : "Meja:"}
                    </span>
                    <span className="text-gray-900">
                        {order.isTakeaway ? "Takeaway" : order.tableNumber}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                    DAFTAR PESANAN ({totalItems} item)
                </h4>
                <div className="space-y-2">
                    {order.items.map((item, idx) => {
                        const price = getEffectivePrice(item.menuItem);
                        return (
                            <div key={idx} className="flex justify-between text-sm">
                                <div className="flex-1">
                                    <div className="text-gray-900 font-medium">
                                        {item.menuItem.name}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {item.quantity}x @ {formatRupiah(price)}
                                    </div>
                                </div>
                                <div className="text-gray-900 font-semibold ml-4">
                                    {formatRupiah(price * item.quantity)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                    <span className="text-xl font-bold text-gray-900">
                        {formatRupiah(order.totalPrice)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
                <p className="text-xs text-gray-600">
                    Terima kasih telah memesan di Kagi Ramen!
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Pesanan Anda sedang diproses
                </p>
            </div>
        </>
    );
}

// Receipt content for hidden receipt (uses inline styles with hex colors only)
function ReceiptContentForCapture({ order, totalItems, currentDate }: { order: Order; totalItems: number; currentDate: string }) {
    return (
        <>
            {/* Paper texture effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(0,0,0,0.1) 10px,
                    rgba(0,0,0,0.1) 20px
                )`
            }} />
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px dashed #d1d5db' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>🍜 KAGI RAMEN</h3>
                <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                    Jl. Ramen No. 123, Surabaya
                </p>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.25rem' }}>
                    Telp: (031) 1234-5678
                </p>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>No. Pesanan:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>
                        {order.orderId || "KAGI-" + Date.now()}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>Tanggal:</span>
                    <span style={{ color: '#111827' }}>{currentDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>Nama:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>
                        {order.customerName}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#4b5563' }}>
                        {order.isTakeaway ? "Tipe:" : "Meja:"}
                    </span>
                    <span style={{ color: '#111827' }}>
                        {order.isTakeaway ? "Takeaway" : order.tableNumber}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    DAFTAR PESANAN ({totalItems} item)
                </h4>
                <div>
                    {order.items.map((item, idx) => {
                        const price = getEffectivePrice(item.menuItem);
                        return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#111827', fontWeight: '500' }}>
                                        {item.menuItem.name}
                                    </div>
                                    <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>
                                        {item.quantity}x @ {formatRupiah(price)}
                                    </div>
                                </div>
                                <div style={{ color: '#111827', fontWeight: '600', marginLeft: '1rem' }}>
                                    {formatRupiah(price * item.quantity)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px dashed #d1d5db' }}>
                    <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.25rem' }}>Catatan:</p>
                    <p style={{ fontSize: '0.875rem', color: '#111827' }}>{order.notes}</p>
                </div>
            )}

            {/* Total */}
            <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>TOTAL</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                        {formatRupiah(order.totalPrice)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px dashed #d1d5db', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                    Terima kasih telah memesan di Kagi Ramen!
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Pesanan Anda sedang diproses
                </p>
            </div>
        </>
    );
}

export default function PaymentSuccess({ order, onClose }: PaymentSuccessProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveImage = async () => {
        if (!receiptRef.current) return;

        setIsSaving(true);
        try {
            // Reset any transforms before capturing
            const element = receiptRef.current;
            const originalTransform = element.style.transform;
            const originalTransformStyle = element.style.transformStyle;
            
            // Reset transforms for capture
            element.style.transform = 'none';
            element.style.transformStyle = 'flat';
            
            // Small delay to ensure transform is applied
            await new Promise(resolve => setTimeout(resolve, 100));

            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(element, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            // Restore original transforms
            element.style.transform = originalTransform;
            element.style.transformStyle = originalTransformStyle;

            canvas.toBlob((blob) => {
                if (!blob) {
                    toast.error("Gagal menyimpan gambar");
                    setIsSaving(false);
                    return;
                }

                const url = URL.createObjectURL(blob);
                const filename = `nota-kagi-${order.orderId || Date.now()}.png`;
                const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);

                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (isMobile) {
                    // On mobile, programmatic download often doesn't trigger; open in new tab so user can long-press → Save
                    const newTab = window.open(url, "_blank", "noopener");
                    if (newTab) {
                        toast.success("Nota dibuka di tab baru. Tekan lama pada gambar → Simpan gambar.");
                        setTimeout(() => URL.revokeObjectURL(url), 30000);
                    } else {
                        toast.success("Nota siap. Jika unduhan tidak mulai, gunakan tombol Bagikan Nota.");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                    }
                } else {
                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                    toast.success("Nota berhasil disimpan!");
                }
                setIsSaving(false);
            }, "image/png");
        } catch (error) {
            console.error("Error saving image:", error);
            toast.error(`Gagal menyimpan gambar: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (!receiptRef.current) return;

        setIsSaving(true);
        try {
            // Reset any transforms before capturing
            const element = receiptRef.current;
            const originalTransform = element.style.transform;
            const originalTransformStyle = element.style.transformStyle;
            
            // Reset transforms for capture
            element.style.transform = 'none';
            element.style.transformStyle = 'flat';
            
            // Small delay to ensure transform is applied
            await new Promise(resolve => setTimeout(resolve, 100));

            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(element, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            // Restore original transforms
            element.style.transform = originalTransform;
            element.style.transformStyle = originalTransformStyle;

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Gagal membagikan nota");
                    setIsSaving(false);
                    return;
                }

                const file = new File([blob], `nota-kagi-${order.orderId || Date.now()}.png`, {
                    type: "image/png",
                });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `Nota Kagi Ramen - ${order.orderId}`,
                            text: "Pesanan saya di Kagi Ramen",
                            files: [file],
                        });
                        toast.success("Nota berhasil dibagikan!");
                    } catch (error) {
                        if ((error as Error).name !== "AbortError") {
                            toast.error("Gagal membagikan nota");
                        }
                    }
                } else {
                    // Fallback: copy to clipboard
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob }),
                        ]);
                        toast.success("Nota disalin ke clipboard!");
                    } catch {
                        toast.info("Fitur share tidak tersedia. Gunakan tombol simpan.");
                    }
                }
                setIsSaving(false);
            }, "image/png");
        } catch (error) {
            console.error("Error sharing:", error);
            toast.error(`Gagal membagikan nota: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsSaving(false);
        }
    };

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const currentDate = new Date().toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-background rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-destructive text-primary-foreground p-6 text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-2" />
                        </motion.div>
                        <h2 className="text-2xl font-bold">Pembayaran Berhasil!</h2>
                        <p className="text-sm mt-1 opacity-90">
                            Kami sedang meracik kaldu spesial untuk Anda~
                        </p>
                    </div>

                    {/* Receipt */}
                    <div className="flex-1 overflow-y-auto p-6 relative">
                        {/* Hidden receipt for capture (no animations, uses inline styles only) */}
                        <div
                            ref={receiptRef}
                            style={{ 
                                position: 'absolute',
                                left: '-9999px',
                                top: '-9999px',
                                width: '384px',
                                visibility: 'hidden',
                                transform: 'none',
                                backgroundColor: '#ffffff',
                                borderRadius: '0.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                padding: '1.5rem',
                                border: '2px dashed #e5e7eb',
                                overflow: 'hidden',
                            }}
                        >
                            <ReceiptContentForCapture order={order} totalItems={totalItems} currentDate={currentDate} />
                        </div>

                        {/* Visible receipt with animation */}
                        <motion.div
                            initial={{ 
                                rotateX: -90, 
                                opacity: 0, 
                                y: 100,
                                scale: 0.8,
                            }}
                            animate={{ 
                                rotateX: 0, 
                                opacity: 1, 
                                y: 0,
                                scale: 1,
                            }}
                            transition={{
                                delay: 0.3,
                                duration: 0.8,
                                type: "spring",
                                stiffness: 150,
                                damping: 15,
                            }}
                            style={{ 
                                transformStyle: "preserve-3d",
                                perspective: "1000px",
                            }}
                            className="bg-white rounded-lg shadow-2xl p-6 border-2 border-dashed border-gray-200 relative overflow-hidden"
                        >
                            <ReceiptContent order={order} totalItems={totalItems} currentDate={currentDate} />
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-border bg-card space-y-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSaveImage}
                            disabled={isSaving}
                            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-5 h-5" />
                            {isSaving ? "Menyimpan..." : "Simpan Nota"}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleShare}
                            disabled={isSaving}
                            className="w-full bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            <Share2 className="w-5 h-5" />
                            {isSaving ? "Mempersiapkan..." : "Bagikan Nota"}
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
