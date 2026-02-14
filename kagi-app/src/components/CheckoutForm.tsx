"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils";
import { submitOrder } from "@/app/actions";
import { toast } from "sonner";

interface CheckoutFormProps {
    onSuccess: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [form, setForm] = useState({
        customerName: "",
        tableNumber: "",
        isTakeaway: false,
        notes: "",
    });
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!form.customerName.trim()) {
            toast.error("Masukkan nama kamu ya, Teman Kagi!");
            return;
        }
        if (!form.isTakeaway && !form.tableNumber.trim()) {
            toast.error("Masukkan nomor meja!");
            return;
        }

        setLoading(true);
        try {
            // Generate order ID
            const orderId = `KAGI-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const totalPrice = getTotalPrice();

            // Prepare items for Midtrans
            const orderItems = items.map((item) => {
                const toppingsPrice =
                    item.selectedToppings?.reduce((t, top) => t + top.price, 0) || 0;
                return {
                    name: item.menuItem.name,
                    price: item.menuItem.price + toppingsPrice,
                    quantity: item.quantity,
                };
            });

            // Request payment token from backend
            const paymentRes = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    grossAmount: totalPrice,
                    customerName: form.customerName,
                    items: orderItems,
                }),
            });

            const paymentData = await paymentRes.json();

            if (!paymentRes.ok) {
                throw new Error(paymentData.error || "Payment failed");
            }

            // Dev mode fallback
            if (paymentData.dev_mode) {
                toast.info(
                    "💳 Mode development — Midtrans belum dikonfigurasi. Pesanan akan dikirim langsung.",
                    { duration: 3000 }
                );
                await submitDirectOrder(orderId);
                return;
            }

            // Check if Snap is available
            if (typeof window !== "undefined" && window.snap) {
                window.snap.pay(paymentData.token, {
                    onSuccess: async () => {
                        toast.success(
                            "🎉 Pembayaran berhasil! Kami sedang meracik kaldu spesial untuk Anda~",
                            {
                                duration: 4000,
                                style: {
                                    background: "#1a1410",
                                    color: "#FFF9EC",
                                    border: "1px solid rgba(255,175,3,0.3)",
                                },
                            }
                        );
                        await submitDirectOrder(orderId, "paid");
                    },
                    onPending: () => {
                        toast.info(
                            "⏳ Menunggu pembayaran... Silakan selesaikan pembayaran.",
                            { duration: 5000 }
                        );
                    },
                    onError: () => {
                        toast.error("❌ Pembayaran gagal. Coba lagi ya!");
                    },
                    onClose: () => {
                        toast.info("Popup pembayaran ditutup. Silakan coba lagi jika ingin melanjutkan.", {
                            duration: 3000,
                        });
                    },
                });
            } else {
                // Snap.js not loaded — fallback to redirect
                if (paymentData.redirect_url && paymentData.redirect_url !== "#") {
                    window.location.href = paymentData.redirect_url;
                } else {
                    toast.error("Payment service not available. Please refresh and try again.");
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Terjadi kesalahan. Coba lagi!");
        } finally {
            setLoading(false);
        }
    };

    const submitDirectOrder = async (orderId: string, paymentStatus?: string) => {
        try {
            const result = await submitOrder({
                customerName: form.customerName,
                tableNumber: form.isTakeaway ? "Takeaway" : form.tableNumber,
                isTakeaway: form.isTakeaway,
                items,
                totalPrice: getTotalPrice(),
                notes: form.notes,
                orderId,
                paymentStatus: paymentStatus || "pending",
            });

            if (result.success) {
                clearCart();
                onSuccess();
            } else {
                toast.error("Gagal mengirim pesanan. Coba lagi ya!");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan pesanan.");
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handlePayment();
            }}
            className="mt-4 space-y-3"
        >
            <div className="h-px bg-[#FFF9EC]/10" />
            <h3 className="text-[#FFF9EC] font-bold text-sm">📝 Detail Pesanan</h3>

            {/* Name */}
            <input
                type="text"
                placeholder="Nama kamu, Teman Kagi"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-[#FFF9EC]/[0.06] border border-[#FFF9EC]/10 rounded-xl px-4 py-2.5 text-[#FFF9EC] text-sm placeholder:text-[#FFF9EC]/30 focus:outline-none focus:border-[#FFAF03]/50 transition-colors"
            />

            {/* Takeaway toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setForm({ ...form, isTakeaway: false })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!form.isTakeaway
                        ? "bg-[#FFAF03] text-[#47240F]"
                        : "bg-[#FFF9EC]/[0.06] text-[#FFF9EC]/50 border border-[#FFF9EC]/10"
                        }`}
                >
                    🪑 Dine In
                </button>
                <button
                    type="button"
                    onClick={() => setForm({ ...form, isTakeaway: true, tableNumber: "" })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${form.isTakeaway
                        ? "bg-[#FFAF03] text-[#47240F]"
                        : "bg-[#FFF9EC]/[0.06] text-[#FFF9EC]/50 border border-[#FFF9EC]/10"
                        }`}
                >
                    🥡 Takeaway
                </button>
            </div>

            {/* Table number */}
            {!form.isTakeaway && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <input
                        type="text"
                        placeholder="Nomor meja (contoh: 5)"
                        value={form.tableNumber}
                        onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                        className="w-full bg-[#FFF9EC]/[0.06] border border-[#FFF9EC]/10 rounded-xl px-4 py-2.5 text-[#FFF9EC] text-sm placeholder:text-[#FFF9EC]/30 focus:outline-none focus:border-[#FFAF03]/50 transition-colors"
                    />
                </motion.div>
            )}

            {/* Notes */}
            <textarea
                placeholder="Catatan untuk dapur (opsional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-[#FFF9EC]/[0.06] border border-[#FFF9EC]/10 rounded-xl px-4 py-2.5 text-[#FFF9EC] text-sm placeholder:text-[#FFF9EC]/30 focus:outline-none focus:border-[#FFAF03]/50 transition-colors resize-none"
            />

            {/* Pay Button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-gradient-to-r from-[#FFAF03] to-[#CC3939] hover:from-[#e09e03] hover:to-[#b33131] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FFAF03]/20"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-4 h-4" />
                        Bayar — {formatRupiah(getTotalPrice())}
                    </>
                )}
            </motion.button>

            {/* Midtrans badge */}
            <p className="text-center text-[#FFF9EC]/20 text-[10px]">
                <Send className="w-3 h-3 inline mr-1" />
                Pembayaran diproses oleh Midtrans
            </p>
        </form>
    );
}
