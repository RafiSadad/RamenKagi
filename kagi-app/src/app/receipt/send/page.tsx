"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReceiptSendPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") ?? "";
    const [status, setStatus] = useState<"waiting" | "sending" | "ok" | "error">("waiting");
    const [message, setMessage] = useState("Mengirim nota ke dapur...");

    useEffect(() => {
        if (!orderId) {
            setStatus("error");
            setMessage("Order ID tidak ada.");
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type !== "receipt-data" || event.data?.orderId !== orderId) return;
            const { dataUrl, orderId: oid } = event.data;
            if (!dataUrl || !oid) return;
            setStatus("sending");
            const filename = `nota-kagi-${oid}.png`;
            fetch("/api/receipt/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: dataUrl, filename, orderId: oid }),
            })
                .then((res) => {
                    if (res.ok) {
                        setStatus("ok");
                        setMessage("Nota terkirim ke dapur.");
                        window.opener?.postMessage({ type: "receipt-upload-done", ok: true }, window.location.origin);
                    } else {
                        return res.json().then((d) => Promise.reject(d));
                    }
                })
                .catch((err) => {
                    setStatus("error");
                    setMessage(err?.error ?? err?.detail ?? "Gagal mengirim.");
                    window.opener?.postMessage({ type: "receipt-upload-done", ok: false }, window.location.origin);
                });
        };

        window.addEventListener("message", handleMessage);
        window.opener?.postMessage({ type: "receipt-send-ready", orderId }, window.location.origin);

        return () => window.removeEventListener("message", handleMessage);
    }, [orderId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm">
                {status === "waiting" && (
                    <>
                        <p className="text-gray-700 mb-2">{message}</p>
                        <p className="text-sm text-gray-500">Menunggu data dari halaman utama...</p>
                    </>
                )}
                {status === "sending" && (
                    <p className="text-gray-700">{message}</p>
                )}
                {status === "ok" && (
                    <>
                        <p className="text-green-600 font-medium text-lg">✓ {message}</p>
                        <p className="text-sm text-gray-500 mt-2">Tab ini bisa ditutup.</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <p className="text-red-600 font-medium">✕ {message}</p>
                        <p className="text-sm text-gray-500 mt-2">Tab ini bisa ditutup.</p>
                    </>
                )}
            </div>
        </div>
    );
}
