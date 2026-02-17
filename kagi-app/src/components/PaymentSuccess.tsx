"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getEffectivePrice } from "@/types/menu";
import type { Order } from "@/types/menu";

interface PaymentSuccessProps {
    order: Order;
    onClose: () => void;
}

// Receipt content component for visible receipt (uses CSS classes) - optimized untuk screenshot
function ReceiptContent({ order, totalItems, currentDate }: { order: Order; totalItems: number; currentDate: string }) {
    return (
        <>
            {/* Receipt Header - lebih compact untuk screenshot */}
            <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-1">🍜 KAGI RAMEN</h3>
                <p className="text-xs text-gray-600">
                    Jl. Ramen No. 123, Surabaya • Telp: (031) 1234-5678
                </p>
            </div>

            {/* Order Info - lebih compact */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">No. Pesanan:</span>
                    <span className="font-semibold text-gray-900">
                        {order.orderId || "KAGI-" + Date.now()}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="text-gray-900">{currentDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Nama:</span>
                    <span className="text-gray-900 font-semibold">
                        {order.customerName}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                        {order.isTakeaway ? "Tipe:" : "Meja:"}
                    </span>
                    <span className="text-gray-900">
                        {order.isTakeaway ? "Takeaway" : order.tableNumber}
                    </span>
                </div>
            </div>

            {/* Items - lebih compact */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">
                    DAFTAR PESANAN ({totalItems} item)
                </h4>
                <div className="space-y-1.5">
                    {order.items.map((item, idx) => {
                        const price = getEffectivePrice(item.menuItem);
                        return (
                            <div key={idx} className="flex justify-between text-xs">
                                <div className="flex-1">
                                    <div className="text-gray-900 font-medium">
                                        {item.menuItem.name}
                                    </div>
                                    <div className="text-gray-600 text-[10px]">
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

            {/* Notes - lebih compact */}
            {order.notes && (
                <div className="mb-3 pb-3 border-b-2 border-dashed border-gray-300">
                    <p className="text-[10px] text-gray-600 mb-0.5">Catatan:</p>
                    <p className="text-xs text-gray-900">{order.notes}</p>
                </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">TOTAL</span>
                    <span className="text-lg font-bold text-gray-900">
                        {formatRupiah(order.totalPrice)}
                    </span>
                </div>
            </div>

            {/* Footer - lebih compact */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 text-center">
                <p className="text-[10px] text-gray-600">
                    Terima kasih telah memesan di Kagi Ramen!
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                    Pesanan Anda sedang diproses
                </p>
            </div>
        </>
    );
}


export default function PaymentSuccess({ order, onClose }: PaymentSuccessProps) {

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

                    {/* Receipt - simplified untuk screenshot */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="bg-white rounded-lg shadow-lg p-5 border-2 border-dashed border-gray-200">
                            <ReceiptContent order={order} totalItems={totalItems} currentDate={currentDate} />
                        </div>
                    </div>

                    {/* Action Buttons - Simplified untuk screenshot */}
                    <div className="p-4 border-t border-border bg-card">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-xs text-blue-800 font-medium mb-1">📸 Simpan Nota</p>
                            <p className="text-xs text-blue-700">
                                Tekan <strong>Power + Volume Up</strong> untuk screenshot (Android & iPhone)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
