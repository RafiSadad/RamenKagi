import type { Metadata } from "next";
import { Literata, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import SmoothScroll from "@/components/SmoothScroll";
import Script from "next/script";
import "./globals.css";

/* Buku menu: serif editorial untuk judul/nama hidangan, sans bersih untuk body */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Kagi Ramen — Menu & Pemesanan",
  description:
    "Pesan ramen favoritmu langsung dari meja. Kagi Ramen House — authentic Japanese ramen experience.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23CC3939' d='M50 18c-12 0-22 8-28 20h8c5-9 13-14 22-14s17 5 22 14h8c-6-12-16-20-28-20z'/%3E%3Cellipse fill='%23FFAF03' cx='50' cy='62' rx='28' ry='12'/%3E%3Cpath fill='%2347220F' d='M30 58h40v6H30z'/%3E%3C/svg%3E",
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
        className={`${literata.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
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
