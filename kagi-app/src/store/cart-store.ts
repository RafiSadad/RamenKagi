"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, MenuItem, Topping, getEffectivePrice } from "@/types/menu";

interface CartStore {
    items: CartItem[];
    addItem: (menuItem: MenuItem, quantity?: number, toppings?: Topping[]) => void;
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

            addItem: (menuItem, quantity = 1, toppings = []) => {
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
                        items: [
                            ...items,
                            { menuItem, quantity, selectedToppings: toppings },
                        ],
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
                return get().items.reduce((total, item) => {
                    const toppingsPrice =
                        item.selectedToppings?.reduce((t, top) => t + top.price, 0) || 0;
                    return total + (getEffectivePrice(item.menuItem) + toppingsPrice) * item.quantity;
                }, 0);
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
