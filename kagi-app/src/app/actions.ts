"use server";

import { Order, getEffectivePrice } from "@/types/menu";
import { decrementMenuStock } from "@/lib/menu-stock";

// Submit order (saves to Supabase + sends Telegram notification)
export async function submitOrder(order: Order) {
    try {
        // === 1. Save to Supabase ===
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, supabaseKey);

            await supabase.from("orders").insert({
                order_id: order.orderId || `KAGI-${Date.now()}`,
                customer_name: order.customerName,
                table_number: order.tableNumber,
                is_takeaway: order.isTakeaway,
                items: order.items.map((item) => ({
                    name: item.menuItem.name,
                    price: getEffectivePrice(item.menuItem),
                    quantity: item.quantity,
                    toppings: item.selectedToppings || [],
                })),
                total_price: order.totalPrice,
                notes: order.notes,
                status: "pending",
                payment_status: order.paymentStatus || "pending",
            });

            // Decrement stock for each ordered item
            for (const item of order.items) {
                await decrementMenuStock(item.menuItem._id, item.quantity);
            }
        } else {
            // Dev mode — log to console 
            console.log("📦 [DEV] Order received:", JSON.stringify(order, null, 2));
        }

        // === 2. Send Telegram Notification ===
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (
            telegramToken &&
            telegramChatId &&
            !telegramToken.includes("your_bot")
        ) {
            const itemsList = order.items
                .map((item) => {
                    const toppings =
                        item.selectedToppings && item.selectedToppings.length > 0
                            ? ` (+${item.selectedToppings.map((t) => t.name).join(", ")})`
                            : "";
                    return `• ${item.menuItem.name} x${item.quantity}${toppings}`;
                })
                .join("\n");

            const message = `🍜 *PESANAN BARU!*

👤 *Nama:* ${order.customerName}
🪑 *${order.isTakeaway ? "Takeaway" : `Meja: ${order.tableNumber}`}*

📋 *Pesanan:*
${itemsList}

💰 *Total: Rp ${order.totalPrice.toLocaleString("id-ID")}*
${order.notes ? `\n📝 *Catatan:* ${order.notes}` : ""}

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
        } else {
            console.log("📱 [DEV] Telegram notification would be sent");
        }

        return { success: true };
    } catch (error) {
        console.error("Error submitting order:", error);
        return { success: false, error: String(error) };
    }
}
