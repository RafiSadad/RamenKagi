"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
    updateMenuStock as updateStock,
    resetAllStockToDefault as resetStock,
    upsertMenuStock,
} from "@/lib/menu-stock";

const STOCK_PAGE = "/admin/stock";

function invalidateStockCache() {
    revalidateTag("menu-stock", "max");
    revalidatePath("/");
}

export async function updateMenuStock(
    menuId: string,
    quantity: number,
    defaultQuantity?: number | null
) {
    const ok = await updateStock(menuId, quantity, defaultQuantity);
    if (ok) {
        revalidatePath(STOCK_PAGE);
        invalidateStockCache();
    }
    return ok;
}

export async function resetAllStockToDefault() {
    const ok = await resetStock();
    if (ok) {
        revalidatePath(STOCK_PAGE);
        invalidateStockCache();
    }
    return ok;
}

/** Sync menu_stock from Sanity: insert rows for menu IDs that don't exist yet. */
export async function syncMenuStockFromSanity(menuIds: string[]) {
    const defaultQty = 99;
    for (const id of menuIds) {
        await upsertMenuStock(id, defaultQty, defaultQty);
    }
    invalidateStockCache();
    return true;
}
