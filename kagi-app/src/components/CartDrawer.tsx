"use client";

import { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils";
import CartItemComponent from "./CartItem";
import UpsellBanner from "./UpsellBanner";
import CheckoutForm from "./CheckoutForm";
import PaymentSuccess from "./PaymentSuccess";
import { AnimatePresence } from "framer-motion";
import type { Category, MenuItem, Order } from "@/types/menu";

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    menuItems: MenuItem[];
}

export default function CartDrawer({
    open,
    onOpenChange,
    categories,
    menuItems,
}: CartDrawerProps) {
    const items = useCartStore((s) => s.items);
    const getTotalPrice = useCartStore((s) => s.getTotalPrice);
    const getTotalItems = useCartStore((s) => s.getTotalItems);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

    const handleOrderSuccess = (order: Order) => {
        setCompletedOrder(order);
        onOpenChange(false); // Close cart drawer
    };

    const handleCloseSuccess = () => {
        setCompletedOrder(null);
    };

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="bg-card border-t border-border max-h-[90vh]">
                    <div className="mx-auto w-full max-w-md">
                        <DrawerHeader className="px-4 pb-2">
                            <div className="flex items-center justify-between">
                                <DrawerTitle className="text-card-foreground flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    Keranjang
                                    {totalItems > 0 && (
                                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                            {totalItems}
                                        </span>
                                    )}
                                </DrawerTitle>
                            </div>
                        </DrawerHeader>

                        <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
                            {items.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-5xl block mb-3">🍜</span>
                                    <p className="text-muted-foreground text-sm">
                                        Keranjang masih kosong nih...
                                    </p>
                                    <p className="text-muted-foreground/80 text-xs mt-1">
                                        Yuk pilih ramen favoritmu, Teman Kagi!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <CartItemComponent key={item.menuItem._id} item={item} />
                                        ))}
                                    </AnimatePresence>

                                    {/* Subtotal */}
                                    <div className="flex items-center justify-between mt-4 py-3 border-t border-border">
                                        <span className="text-muted-foreground text-sm">Subtotal</span>
                                        <span className="text-card-foreground font-bold text-lg">
                                            {formatRupiah(getTotalPrice())}
                                        </span>
                                    </div>

                                    {/* Upsell */}
                                    <UpsellBanner
                                        menuItems={menuItems}
                                        categories={categories}
                                    />

                                    {/* Checkout Form */}
                                    <CheckoutForm
                                        menuItems={menuItems}
                                        onSuccess={handleOrderSuccess}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Payment Success Modal */}
            {completedOrder && (
                <PaymentSuccess order={completedOrder} onClose={handleCloseSuccess} />
            )}
        </>
    );
}
