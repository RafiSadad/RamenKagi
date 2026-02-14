import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, grossAmount, customerName, email, phone, items } = body;

        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        if (!serverKey || serverKey.includes("your_")) {
            // Dev mode — return mock token
            console.log("💳 [DEV] Payment request received:", { orderId, grossAmount });
            return NextResponse.json({
                token: "DEV_MODE_TOKEN",
                redirect_url: "#",
                dev_mode: true,
            });
        }

        // Encode server key to Base64 for Basic Auth
        const authString = Buffer.from(serverKey + ":").toString("base64");

        // Determine API URL based on environment
        const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
        const apiUrl = isProduction
            ? "https://app.midtrans.com/snap/v1/transactions"
            : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        // Build item details for Midtrans
        const itemDetails = items?.map((item: { name: string; price: number; quantity: number }) => ({
            id: item.name.toLowerCase().replace(/\s+/g, "-").slice(0, 50),
            price: item.price,
            quantity: item.quantity,
            name: item.name.slice(0, 50), // Midtrans max 50 chars
        })) || [];

        const payload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            customer_details: {
                first_name: customerName || "Teman Kagi",
                email: email || "",
                phone: phone || "",
            },
            item_details: itemDetails.length > 0 ? itemDetails : undefined,
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Midtrans API error:", data);
            return NextResponse.json(
                { error: "Failed to create payment token", details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            token: data.token,
            redirect_url: data.redirect_url,
        });
    } catch (error) {
        console.error("Payment API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
