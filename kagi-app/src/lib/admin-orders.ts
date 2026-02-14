import { createClient } from "@supabase/supabase-js";

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || url.includes("your-project")) return null;
    return createClient(url, key);
}

export type AdminOrder = {
    order_id: string;
    customer_name: string | null;
    table_number: string | null;
    is_takeaway: boolean | null;
    total_price: number | null;
    status: string | null;
    payment_status: string | null;
    created_at: string | null;
};

export async function getOrdersForAdmin(options?: {
    limit?: number;
    fromDate?: Date;
    toDate?: Date;
}): Promise<AdminOrder[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    let query = supabase
        .from("orders")
        .select("order_id, customer_name, table_number, is_takeaway, total_price, status, payment_status, created_at")
        .order("created_at", { ascending: false });

    if (options?.fromDate) {
        query = query.gte("created_at", options.fromDate.toISOString());
    }
    if (options?.toDate) {
        query = query.lte("created_at", options.toDate.toISOString());
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error("getOrdersForAdmin error:", error);
        return [];
    }
    return (data ?? []) as AdminOrder[];
}

export async function getSalesStats(options?: {
    fromDate?: Date;
    toDate?: Date;
}): Promise<{ count: number; revenue: number }> {
    const supabase = getSupabase();
    if (!supabase) return { count: 0, revenue: 0 };

    let query = supabase
        .from("orders")
        .select("total_price, payment_status", { count: "exact" });

    if (options?.fromDate) {
        query = query.gte("created_at", options.fromDate.toISOString());
    }
    if (options?.toDate) {
        query = query.lte("created_at", options.toDate.toISOString());
    }

    const { data, count, error } = await query;
    if (error) return { count: 0, revenue: 0 };

    const orders = (data ?? []) as { total_price: number | null; payment_status: string | null }[];
    const revenue = orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
    return { count: count ?? 0, revenue };
}
