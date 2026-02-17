"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils";
import { getEffectivePrice } from "@/types/menu";
import { submitOrder } from "@/app/actions";
import { toast } from "sonner";
import { getSuggestedUpsell } from "@/lib/upsell-scoring";
import UpsellCheckoutModal from "./UpsellCheckoutModal";
import type { MenuItem, Order } from "@/types/menu";

interface CheckoutFormProps {
    onSuccess: (order: Order) => void;
    menuItems: MenuItem[];
}

export default function CheckoutForm({ onSuccess, menuItems }: CheckoutFormProps) {
    const { items, getTotalPrice, clearCart, addItem } = useCartStore();
    const [form, setForm] = useState({
        customerName: "",
        tableNumber: "",
        isTakeaway: false,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [tableNumberError, setTableNumberError] = useState("");
    const [upsellModal, setUpsellModal] = useState<{
        item: MenuItem;
        copy: string;
    } | null>(null);

    const handlePayment = async () => {
        if (!form.customerName.trim()) {
            toast.error("Masukkan nama kamu ya, Teman Kagi!");
            return;
        }
        if (!form.isTakeaway && !form.tableNumber.trim()) {
            toast.error("Masukkan nomor meja!");
            return;
        }
        if (!form.isTakeaway && form.tableNumber.trim() && !/^\d+$/.test(form.tableNumber.trim())) {
            setTableNumberError("Nomor meja ya, bukan yang lain");
            return;
        }
        setTableNumberError("");

        setLoading(true);
        try {
            // Generate order ID
            const orderId = `KAGI-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const totalPrice = getTotalPrice();

            // Prepare order object
            const order: Order = {
                customerName: form.customerName,
                tableNumber: form.isTakeaway ? "Takeaway" : form.tableNumber,
                isTakeaway: form.isTakeaway,
                items,
                totalPrice,
                notes: form.notes,
                orderId,
                paymentStatus: "paid", // Skip payment, mark as paid
            };

            // Submit order directly (skip payment)
            const result = await submitOrder(order);

            if (result.success) {
                clearCart();
                onSuccess(order);
            } else {
                toast.error("Gagal mengirim pesanan. Coba lagi ya!");
            }
        } catch (error) {
            console.error("Order error:", error);
            toast.error("Terjadi kesalahan. Coba lagi!");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerName.trim()) {
            toast.error("Masukkan nama kamu ya, Teman Kagi!");
            return;
        }
        if (!form.isTakeaway && !form.tableNumber.trim()) {
            toast.error("Masukkan nomor meja!");
            return;
        }
        if (!form.isTakeaway && form.tableNumber.trim() && !/^\d+$/.test(form.tableNumber.trim())) {
            setTableNumberError("Nomor meja ya, bukan yang lain");
            return;
        }
        setTableNumberError("");
        const suggestion = getSuggestedUpsell(items, menuItems);
        if (suggestion.suggestedItem && suggestion.copy) {
            setUpsellModal({ item: suggestion.suggestedItem, copy: suggestion.copy });
            return;
        }
        handlePayment();
    };

    const handleAddAndPay = () => {
        if (upsellModal) {
            addItem(upsellModal.item);
            toast.success(`${upsellModal.item.name} ditambahkan!`, { duration: 1500 });
            setUpsellModal(null);
            handlePayment();
        }
    };

    const handleSkipAndPay = () => {
        setUpsellModal(null);
        handlePayment();
    };

    return (
        <>
            {upsellModal && (
                <UpsellCheckoutModal
                    open
                    suggestedItem={upsellModal.item}
                    copy={upsellModal.copy}
                    onAddAndPay={handleAddAndPay}
                    onSkipAndPay={handleSkipAndPay}
                    onClose={() => setUpsellModal(null)}
                />
            )}
            <form
                onSubmit={handleSubmit}
                className="mt-3 space-y-2"
            >
            <h3 className="text-card-foreground font-semibold text-xs">📝 Detail Pesanan</h3>

            {/* Dine In / Takeaway dulu */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setForm({ ...form, isTakeaway: false })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!form.isTakeaway
                        ? "bg-primary text-primary-foreground"
                        : "bg-input text-muted-foreground border border-border"
                        }`}
                >
                    🪑 Dine In
                </button>
                <button
                    type="button"
                    onClick={() => { setForm({ ...form, isTakeaway: true, tableNumber: "" }); setTableNumberError(""); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${form.isTakeaway
                        ? "bg-primary text-primary-foreground"
                        : "bg-input text-muted-foreground border border-border"
                        }`}
                >
                    🥡 Takeaway
                </button>
            </div>

            {/* Nama + No. meja satu baris (dine-in) / Nama saja (takeaway) */}
            <div className="flex gap-2 flex-wrap">
                <input
                    type="text"
                    placeholder="Nama"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="flex-1 min-w-[120px] bg-input border border-border rounded-lg px-3 py-2 text-card-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                />
                {!form.isTakeaway && (
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="No. meja"
                        value={form.tableNumber}
                        onChange={(e) => {
                            setForm({ ...form, tableNumber: e.target.value });
                            setTableNumberError("");
                        }}
                        className={`w-20 bg-input border rounded-lg px-3 py-2 text-card-foreground text-base placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors shrink-0 ${tableNumberError ? "border-destructive" : "border-border focus:border-primary/50"}`}
                    />
                )}
            </div>
            {!form.isTakeaway && tableNumberError && (
                <p className="text-destructive text-xs -mt-0.5">{tableNumberError}</p>
            )}

            {/* Catatan — satu baris */}
            <input
                type="text"
                placeholder="Catatan (opsional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-card-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            />

            {/* Pay Button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-gradient-to-r from-primary to-destructive hover:from-primary/90 hover:to-destructive/90 disabled:opacity-40 text-primary-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

            {/* Trust message */}
            <p className="text-center text-muted-foreground text-[10px] flex items-center justify-center gap-1.5 flex-wrap">
                <Send className="w-3 h-3 shrink-0" />
                Pesanan akan langsung diproses setelah konfirmasi
            </p>
        </form>
        </>
    );
}
