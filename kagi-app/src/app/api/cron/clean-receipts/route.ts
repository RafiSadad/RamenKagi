import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "nota";
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari — file lebih tua dari ini akan dihapus

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Missing Supabase config" }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = Date.now();

    try {
        const { data: files, error: listErr } = await supabase.storage.from(BUCKET).list("", { limit: 500 });
        if (listErr) {
            console.error("clean-receipts list error:", listErr);
            return NextResponse.json({ error: "List failed" }, { status: 502 });
        }

        const toDelete: string[] = [];
        for (const f of files || []) {
            if (f.name == null) continue;
            const match = /^(\d+)-/.exec(f.name);
            if (match) {
                const created = parseInt(match[1], 10);
                if (now - created > MAX_AGE_MS) toDelete.push(f.name);
            }
        }

        if (toDelete.length === 0) {
            return NextResponse.json({ deleted: 0 });
        }

        const { error: delErr } = await supabase.storage.from(BUCKET).remove(toDelete);
        if (delErr) {
            console.error("clean-receipts delete error:", delErr);
            return NextResponse.json({ error: "Delete failed" }, { status: 502 });
        }
        return NextResponse.json({ deleted: toDelete.length });
    } catch (e) {
        console.error("clean-receipts exception:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
