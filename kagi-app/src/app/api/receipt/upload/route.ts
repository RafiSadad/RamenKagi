import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "nota";

async function sendPhotoToTelegram(buffer: Buffer, filename: string, caption: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId || token.includes("your_bot")) {
        if (!token || token.includes("your_bot")) {
            console.warn("Telegram: TELEGRAM_BOT_TOKEN tidak set atau masih placeholder. Gambar nota tidak dikirim ke Telegram.");
        } else if (!chatId) {
            console.warn("Telegram: TELEGRAM_CHAT_ID tidak set. Gambar nota tidak dikirim ke Telegram.");
        }
        return false;
    }
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("caption", caption);
    form.append("photo", new Blob([buffer], { type: "image/png" }), filename);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: form,
    });
    if (!res.ok) {
        const text = await res.text();
        console.error("Telegram sendPhoto failed:", res.status, text);
        return false;
    }
    return true;
}

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
        // Service Role harus JWT dari Dashboard → Settings → API (service_role). Bukan anon / sb_secret.
        if (!supabaseKey.startsWith("eyJ")) {
            console.error("SUPABASE_SERVICE_ROLE_KEY should be the JWT service_role key from Supabase Dashboard → Settings → API");
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
            const msg = error.message ?? "";
            const isBucketMissing =
                /bucket not found/i.test(msg) ||
                /not found/i.test(msg) ||
                /resource was not found/i.test(msg) ||
                /does not exist/i.test(msg);
            if (isBucketMissing) {
                const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
                    public: true,
                    fileSizeLimit: 2 * 1024 * 1024, // 2MB
                    allowedMimeTypes: ["image/png"],
                });
                if (createErr) {
                    console.error("Receipt bucket create failed:", createErr);
                    return NextResponse.json(
                        {
                            error: "Bucket 'nota' tidak ada dan gagal dibuat. Buat manual: Storage → New bucket → nama 'nota', Public.",
                            detail: createErr.message,
                        },
                        { status: 502 }
                    );
                }
                const { data: retryData, error: retryErr } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, buffer, { contentType: "image/png", upsert: false });
                if (retryErr) {
                    console.error("Receipt upload retry failed:", retryErr);
                    return NextResponse.json(
                        { error: "Upload gagal setelah buat bucket", detail: retryErr.message },
                        { status: 502 }
                    );
                }
                const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(retryData.path);
                const publicUrl = urlData.publicUrl;
                const caption = orderId
                    ? `📷 Nota pesanan\n📋 No. Pesanan: ${orderId}`
                    : "📷 Nota pesanan";
                await sendPhotoToTelegram(buffer, safeName, caption);
                return NextResponse.json({ url: publicUrl });
            }
            console.error("Receipt upload error:", error);
            return NextResponse.json(
                { error: "Upload gagal", detail: msg },
                { status: 502 }
            );
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        const publicUrl = urlData.publicUrl;

        const caption = orderId
            ? `📷 Nota pesanan\n📋 No. Pesanan: ${orderId}`
            : "📷 Nota pesanan";
        await sendPhotoToTelegram(buffer, safeName, caption);
        return NextResponse.json({ url: publicUrl });
    } catch (e) {
        console.error("Receipt upload exception:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
