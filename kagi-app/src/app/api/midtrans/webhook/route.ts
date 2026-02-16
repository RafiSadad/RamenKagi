import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
        } = body;

        // Validate signature
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (serverKey && !serverKey.includes("your_")) {
            const expectedSignature = crypto
                .createHash("sha512")
                .update(order_id + status_code + gross_amount + serverKey)
                .digest("hex");

            if (signature_key !== expectedSignature) {
                console.error("Invalid Midtrans signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 403 }
                );
            }
        }

        // Determine payment status
        let paymentStatus = "unknown";
        if (transaction_status === "capture" || transaction_status === "settlement") {
            if (fraud_status === "accept" || !fraud_status) {
                paymentStatus = "paid";
            } else {
                paymentStatus = "fraud";
            }
        } else if (transaction_status === "pending") {
            paymentStatus = "pending";
        } else if (
            transaction_status === "deny" ||
            transaction_status === "cancel" ||
            transaction_status === "expire"
        ) {
            paymentStatus = "failed";
        } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
            paymentStatus = "refunded";
        }

        console.log(`💳 Midtrans webhook: order=${order_id}, status=${paymentStatus}`);

        // Update order in Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Update order payment status
            await supabase
                .from("orders")
                .update({
                    payment_status: paymentStatus,
                    midtrans_transaction_status: transaction_status,
                    updated_at: new Date().toISOString(),
                })
                .eq("order_id", order_id);

            // Insert payment record
            await supabase.from("payments").insert({
                order_id,
                transaction_status,
                status_code,
                gross_amount: parseFloat(gross_amount),
                payment_status: paymentStatus,
                raw_notification: body,
            });
        }

        // Send Telegram notification on successful payment
        if (paymentStatus === "paid") {
            const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
            const telegramChatId = process.env.TELEGRAM_CHAT_ID;

            if (telegramToken && telegramChatId && !telegramToken.includes("your_bot")) {
                const message = `💰 *PEMBAYARAN BERHASIL!*

📋 *Order ID / No. Pesanan:* \`${order_id}\`

💵 Total: Rp ${parseFloat(gross_amount).toLocaleString("id-ID")}
✅ Status: ${transaction_status}

⏰ ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;

                await fetch(
                    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: telegramChatId,
                            text: message,
                            parse_mode: "Markdown",
                        }),
                    }
                );
            }
        }

        // Midtrans expects 200 OK response
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Midtrans webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
