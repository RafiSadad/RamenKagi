import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "receipts";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, filename, orderId } = body as { image?: string; filename?: string; orderId?: string };
        if (!image || typeof image !== "string" || !filename) {
            return NextResponse.json(
                { error: "Missing image (base64) or filename" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project")) {
            return NextResponse.json(
                { error: "Server not configured for uploads" },
                { status: 503 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${Date.now()}-${safeName}`;

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .upload(path, buffer, {
                contentType: "image/png",
                upsert: false,
            });

        if (error) {
            if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
                const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
                    public: true,
                    fileSizeLimit: 2 * 1024 * 1024, // 2MB
                    allowedMimeTypes: ["image/png"],
                });
                if (createErr) {
                    console.error("Receipt bucket create failed:", createErr);
                    return NextResponse.json(
                        { error: "Upload failed. Create a public bucket named 'receipts' in Supabase Storage." },
                        { status: 502 }
                    );
                }
                const { data: retryData, error: retryErr } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, buffer, { contentType: "image/png", upsert: false });
                if (retryErr) {
                    console.error("Receipt upload retry failed:", retryErr);
                    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
                }
                const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(retryData.path);
                const publicUrl = urlData.publicUrl;
                const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
                const telegramChatId = process.env.TELEGRAM_CHAT_ID;
                if (telegramToken && telegramChatId && !telegramToken.includes("your_bot")) {
                    try {
                        const caption = orderId
                            ? `📷 Nota pesanan\n📋 No. Pesanan: ${orderId}`
                            : "📷 Nota pesanan";
                        await fetch(`https://api.telegram.org/bot${telegramToken}/sendPhoto`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ chat_id: telegramChatId, photo: publicUrl, caption }),
                        });
                    } catch (err) {
                        console.error("Telegram sendPhoto error:", err);
                    }
                }
                return NextResponse.json({ url: publicUrl });
            }
            console.error("Receipt upload error:", error);
            return NextResponse.json({ error: "Upload failed" }, { status: 502 });
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        const publicUrl = urlData.publicUrl;

        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;
        if (telegramToken && telegramChatId && !telegramToken.includes("your_bot")) {
            try {
                const caption = orderId
                    ? `📷 Nota pesanan\n📋 No. Pesanan: ${orderId}`
                    : "📷 Nota pesanan";
                await fetch(`https://api.telegram.org/bot${telegramToken}/sendPhoto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        photo: publicUrl,
                        caption,
                    }),
                });
            } catch (err) {
                console.error("Telegram sendPhoto error:", err);
            }
        }

        return NextResponse.json({ url: publicUrl });
    } catch (e) {
        console.error("Receipt upload exception:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
