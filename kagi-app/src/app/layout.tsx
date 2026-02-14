import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import SmoothScroll from "@/components/SmoothScroll";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Kagi Ramen — Menu & Pemesanan",
  description:
    "Pesan ramen favoritmu langsung dari meja. Kagi Ramen House — authentic Japanese ramen experience.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍜</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="id">
      <body
        className={`${outfit.variable} font-sans antialiased bg-[#111111] text-white`}
      >
        <SmoothScroll>
          <main className="min-h-screen">{children}</main>
        </SmoothScroll>
        <Toaster position="top-center" />

        {/* Midtrans Snap.js */}
        {midtransClientKey && !midtransClientKey.includes("your_") && (
          <Script
            src={snapUrl}
            data-client-key={midtransClientKey}
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
