"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, MenuItem, getEffectivePrice } from "@/types/menu";

interface CartStore {
    items: CartItem[];
    addItem: (menuItem: MenuItem, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (menuItem, quantity = 1) => {
                const { items } = get();
                const existingIndex = items.findIndex(
                    (item) => item.menuItem._id === menuItem._id
                );

                if (existingIndex >= 0) {
                    const updated = [...items];
                    updated[existingIndex].quantity += quantity;
                    set({ items: updated });
                } else {
                    set({
                        items: [...items, { menuItem, quantity }],
                    });
                }
            },

            removeItem: (itemId) => {
                set({ items: get().items.filter((item) => item.menuItem._id !== itemId) });
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                const updated = get().items.map((item) =>
                    item.menuItem._id === itemId ? { ...item, quantity } : item
                );
                set({ items: updated });
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) =>
                        total + getEffectivePrice(item.menuItem) * item.quantity,
                    0
                );
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: "kagi-cart",
        }
    )
);
