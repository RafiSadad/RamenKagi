"use server";

import {
    updateMenuStock as updateStock,
    resetAllStockToDefault as resetStock,
    upsertMenuStock,
} from "@/lib/menu-stock";

export async function updateMenuStock(
    menuId: string,
    quantity: number,
    defaultQuantity?: number | null
) {
    return await updateStock(menuId, quantity, defaultQuantity);
}

export async function resetAllStockToDefault() {
    return await resetStock();
}

/** Sync menu_stock from Sanity: insert rows for menu IDs that don't exist yet. */
export async function syncMenuStockFromSanity(menuIds: string[]) {
    const defaultQty = 99;
    for (const id of menuIds) {
        await upsertMenuStock(id, defaultQty, defaultQty);
    }
    return true;
}
