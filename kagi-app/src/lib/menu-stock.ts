import { createClient } from "@supabase/supabase-js";

function getSupabase(useServiceRole = false) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("your-project")) {
        if (process.env.NODE_ENV === "development") {
            console.warn("Supabase URL not configured or invalid");
        }
        return null;
    }
    
    // For read operations, prefer Anon Key; for write operations, use Service Role Key
    const key = useServiceRole
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    
    if (!key || key.includes("your") || key.includes("placeholder")) {
        if (process.env.NODE_ENV === "development") {
            console.warn(`Supabase ${useServiceRole ? "Service Role" : "Anon"} Key not configured`);
        }
        return null;
    }
    return createClient(url, key);
}

/** Returns map of menu_id -> quantity. Menus not in table are treated as unlimited (omit from map). */
export async function getMenuStock(
    menuIds: string[]
): Promise<Record<string, number>> {
    const supabase = getSupabase();
    if (!supabase || menuIds.length === 0) return {};

    const { data, error } = await supabase
        .from("menu_stock")
        .select("menu_id, quantity")
        .in("menu_id", menuIds);

    if (error) {
        console.error("getMenuStock error:", error.message || "Unknown error", error.code || "N/A", error.details || "No details");
        return {};
    }

    const map: Record<string, number> = {};
    for (const row of data || []) {
        map[row.menu_id] = row.quantity ?? 0;
    }
    return map;
}

/** Fetch all rows from menu_stock. */
export async function getAllMenuStock(): Promise<
    { menu_id: string; quantity: number; default_quantity: number | null }[]
> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("menu_stock")
        .select("menu_id, quantity, default_quantity")
        .order("menu_id");

    if (error) {
        console.error("getAllMenuStock error:", error.message, error.code, error.details);
        return [];
    }
    return (data || []).map((r) => ({
        menu_id: r.menu_id,
        quantity: r.quantity ?? 0,
        default_quantity: r.default_quantity ?? null,
    }));
}

/** Upsert one row. Used by admin and by sync-from-Sanity. */
export async function upsertMenuStock(
    menuId: string,
    quantity: number,
    defaultQuantity?: number | null
): Promise<boolean> {
    const supabase = getSupabase(true); // Use Service Role Key for writes
    if (!supabase) return false;

    const payload: { menu_id: string; quantity: number; default_quantity?: number | null } = {
        menu_id: menuId,
        quantity,
    };
    if (defaultQuantity !== undefined) payload.default_quantity = defaultQuantity;

    const { error } = await supabase.from("menu_stock").upsert(payload, {
        onConflict: "menu_id",
    });
    if (error) {
        console.error("upsertMenuStock error:", error.message, error.code, error.details);
        return false;
    }
    return true;
}

/** Cek koneksi Supabase (untuk debug: edit stok tidak nyimpan). */
export function isMenuStockConfigured(): boolean {
    return getSupabase() != null;
}

/** Decrement quantity by amount (e.g. after order). Prevents going below 0. */
export async function decrementMenuStock(
    menuId: string,
    amount: number
): Promise<void> {
    const supabase = getSupabase(true); // Use Service Role Key for writes
    if (!supabase || amount <= 0) return;

    const { data: row } = await supabase
        .from("menu_stock")
        .select("quantity")
        .eq("menu_id", menuId)
        .single();

    if (!row) return;
    const newQty = Math.max(0, (row.quantity ?? 0) - amount);
    await supabase
        .from("menu_stock")
        .update({ quantity: newQty })
        .eq("menu_id", menuId);
}

/** Set quantity for one menu (admin). */
export async function updateMenuStock(
    menuId: string,
    quantity: number,
    defaultQuantity?: number | null
): Promise<boolean> {
    return upsertMenuStock(menuId, quantity, defaultQuantity);
}

/** Set every row's quantity to its default_quantity (admin "reset stok"). */
export async function resetAllStockToDefault(): Promise<boolean> {
    const supabase = getSupabase(true); // Use Service Role Key for writes
    if (!supabase) return false;

    const { data: rows, error: fetchError } = await supabase
        .from("menu_stock")
        .select("menu_id, default_quantity");
    if (fetchError || !rows?.length) return true;

    for (const row of rows) {
        const qty = row.default_quantity ?? 0;
        await supabase
            .from("menu_stock")
            .update({ quantity: qty })
            .eq("menu_id", row.menu_id);
    }
    return true;
}
