"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, CheckCircle2, X, Maximize2, Minimize2, Camera } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getEffectivePrice } from "@/types/menu";
import type { Order } from "@/types/menu";
import { toast } from "sonner";

interface PaymentSuccessProps {
    order: Order;
    onClose: () => void;
}

// Receipt content component for visible receipt (uses CSS classes)
function ReceiptContent({ order, totalItems, currentDate }: { order: Order; totalItems: number; currentDate: string }) {
    return (
        <>
            {/* Paper texture effect */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{
                     backgroundImage: `repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 10px,
                         rgba(0,0,0,0.1) 10px,
                         rgba(0,0,0,0.1) 20px
                     )`
                 }}
            />
            {/* Receipt Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">🍜 KAGI RAMEN</h3>
                <p className="text-xs text-gray-600">
                    Jl. Ramen No. 123, Surabaya
                </p>
                <p className="text-xs text-gray-600 mt-1">
                    Telp: (031) 1234-5678
                </p>
            </div>

            {/* Order Info */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No. Pesanan:</span>
                    <span className="font-semibold text-gray-900">
                        {order.orderId || "KAGI-" + Date.now()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="text-gray-900">{currentDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nama:</span>
                    <span className="text-gray-900 font-semibold">
                        {order.customerName}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        {order.isTakeaway ? "Tipe:" : "Meja:"}
                    </span>
                    <span className="text-gray-900">
                        {order.isTakeaway ? "Takeaway" : order.tableNumber}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                    DAFTAR PESANAN ({totalItems} item)
                </h4>
                <div className="space-y-2">
                    {order.items.map((item, idx) => {
                        const price = getEffectivePrice(item.menuItem);
                        return (
                            <div key={idx} className="flex justify-between text-sm">
                                <div className="flex-1">
                                    <div className="text-gray-900 font-medium">
                                        {item.menuItem.name}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {item.quantity}x @ {formatRupiah(price)}
                                    </div>
                                </div>
                                <div className="text-gray-900 font-semibold ml-4">
                                    {formatRupiah(price * item.quantity)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                    <span className="text-xl font-bold text-gray-900">
                        {formatRupiah(order.totalPrice)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
                <p className="text-xs text-gray-600">
                    Terima kasih telah memesan di Kagi Ramen!
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Pesanan Anda sedang diproses
                </p>
            </div>
        </>
    );
}

// Receipt content for hidden receipt (uses inline styles with hex colors only)
function ReceiptContentForCapture({ order, totalItems, currentDate }: { order: Order; totalItems: number; currentDate: string }) {
    return (
        <>
            {/* Paper texture effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(0,0,0,0.1) 10px,
                    rgba(0,0,0,0.1) 20px
                )`
            }} />
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px dashed #d1d5db' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>🍜 KAGI RAMEN</h3>
                <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                    Jl. Ramen No. 123, Surabaya
                </p>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.25rem' }}>
                    Telp: (031) 1234-5678
                </p>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>No. Pesanan:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>
                        {order.orderId || "KAGI-" + Date.now()}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>Tanggal:</span>
                    <span style={{ color: '#111827' }}>{currentDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#4b5563' }}>Nama:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>
                        {order.customerName}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#4b5563' }}>
                        {order.isTakeaway ? "Tipe:" : "Meja:"}
                    </span>
                    <span style={{ color: '#111827' }}>
                        {order.isTakeaway ? "Takeaway" : order.tableNumber}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    DAFTAR PESANAN ({totalItems} item)
                </h4>
                <div>
                    {order.items.map((item, idx) => {
                        const price = getEffectivePrice(item.menuItem);
                        return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#111827', fontWeight: '500' }}>
                                        {item.menuItem.name}
                                    </div>
                                    <div style={{ color: '#4b5563', fontSize: '0.75rem' }}>
                                        {item.quantity}x @ {formatRupiah(price)}
                                    </div>
                                </div>
                                <div style={{ color: '#111827', fontWeight: '600', marginLeft: '1rem' }}>
                                    {formatRupiah(price * item.quantity)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px dashed #d1d5db' }}>
                    <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.25rem' }}>Catatan:</p>
                    <p style={{ fontSize: '0.875rem', color: '#111827' }}>{order.notes}</p>
                </div>
            )}

            {/* Total */}
            <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>TOTAL</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                        {formatRupiah(order.totalPrice)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px dashed #d1d5db', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                    Terima kasih telah memesan di Kagi Ramen!
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Pesanan Anda sedang diproses
                </p>
            </div>
        </>
    );
}

// Safari mobile lebih lambat, perlu timeout lebih lama
const CAPTURE_TIMEOUT_MS = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window) ? 25000 : 12000;
// #region agent log
if (typeof window !== "undefined") {
    fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:244',message:'CAPTURE_TIMEOUT_MS configured',data:{timeout:CAPTURE_TIMEOUT_MS,isMobile:window.innerWidth < 768 || "ontouchstart" in window,windowWidth:window.innerWidth},timestamp:Date.now()})}).catch(()=>{});
}
// #endregion

/** Capture receipt element to PNG blob (shared by Unduh & Bagikan). Timeout agar tidak hang di Safari/iOS. */
async function captureReceiptToBlob(element: HTMLElement): Promise<Blob | null> {
    const startTime = Date.now();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:247',message:'captureReceiptToBlob START',data:{timeout:CAPTURE_TIMEOUT_MS,elementReady:!!element,scrollWidth:element?.scrollWidth,scrollHeight:element?.scrollHeight},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => {
            const elapsed = Date.now() - startTime;
            // #region agent log
            console.error('[DEBUG] TIMEOUT TRIGGERED', { elapsed, timeout: CAPTURE_TIMEOUT_MS });
            fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:250',message:'TIMEOUT TRIGGERED',data:{elapsed:elapsed,timeout:CAPTURE_TIMEOUT_MS},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            reject(new Error("Capture timeout"));
        }, CAPTURE_TIMEOUT_MS)
    );
    const capturePromise = (async (): Promise<Blob | null> => {
        const styleStartTime = Date.now();
        const originalTransform = element.style.transform;
        const originalTransformStyle = element.style.transformStyle;
        const originalVisibility = element.style.visibility;
        const originalOpacity = element.style.opacity;
        element.style.transform = "none";
        element.style.transformStyle = "flat";
        element.style.visibility = "visible";
        element.style.opacity = "1";
        await new Promise((r) => setTimeout(r, 150));
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:260',message:'Style applied, waiting for render',data:{elapsed:Date.now()-styleStartTime},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        const importStartTime = Date.now();
        const { default: html2canvas } = await import("html2canvas");
        const importElapsed = Date.now() - importStartTime;
        // #region agent log
        console.log('[DEBUG] html2canvas imported', { elapsed: importElapsed });
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:263',message:'html2canvas imported',data:{elapsed:importElapsed},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const isNarrow = typeof window !== "undefined" && window.innerWidth < 400;
        const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);
        const canvasStartTime = Date.now();
        // Safari mobile: gunakan scale lebih rendah dan optimasi sesuai Apple best practices
        const canvas = await html2canvas(element, {
            backgroundColor: "#ffffff",
            scale: isMobileDevice ? (isNarrow ? 0.8 : 1) : (isNarrow ? 1.5 : 2),
            logging: false,
            useCORS: true,
            allowTaint: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            // Optimasi untuk Safari mobile sesuai dokumentasi Apple/Safari
            ...(isMobileDevice && {
                removeContainer: true,
                foreignObjectRendering: false, // Lebih cepat tapi kurang akurat
                imageTimeout: 0, // Disable timeout untuk Safari iOS (default 15000ms terlalu pendek, Safari lebih lambat)
            }),
            onclone(clonedDoc, clonedEl) {
                (clonedEl as HTMLElement).style.visibility = "visible";
                (clonedEl as HTMLElement).style.opacity = "1";
                // Safari iOS: force load semua images yang lazy-loaded untuk menghindari hang
                // Issue: html2canvas hang jika ada lazy-loaded images di halaman
                if (isMobileDevice) {
                    const images = clonedDoc.querySelectorAll('img[loading="lazy"]');
                    images.forEach((img) => {
                        (img as HTMLImageElement).loading = 'eager';
                        (img as HTMLImageElement).removeAttribute('loading');
                    });
                }
            },
        });
        const canvasElapsed = Date.now() - canvasStartTime;
        // #region agent log
        console.log('[DEBUG] html2canvas completed', { elapsed: canvasElapsed, width: canvas.width, height: canvas.height });
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:276',message:'html2canvas completed',data:{elapsed:canvasElapsed,canvasWidth:canvas.width,canvasHeight:canvas.height},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        element.style.transform = originalTransform;
        element.style.transformStyle = originalTransformStyle;
        element.style.visibility = originalVisibility;
        element.style.opacity = originalOpacity;

        const blobStartTime = Date.now();
        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => {
            const blobElapsed = Date.now() - blobStartTime;
            const totalElapsed = Date.now() - startTime;
            // #region agent log
            console.log('[DEBUG] Blob created', { blobElapsed, totalElapsed, blobSize: blob?.size });
            fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:283',message:'Blob created',data:{elapsed:blobElapsed,totalElapsed:totalElapsed,blobSize:blob?.size},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            resolve(blob ?? null);
            }, "image/png");
        });
    })();
    try {
        const result = await Promise.race([capturePromise, timeoutPromise]);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:286',message:'captureReceiptToBlob SUCCESS',data:{totalElapsed:Date.now()-startTime,hasBlob:!!result},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return result;
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:289',message:'captureReceiptToBlob ERROR',data:{totalElapsed:Date.now()-startTime,error:error instanceof Error?error.message:String(error)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw error;
    }
}

function isMobile(): boolean {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768 || "ontouchstart" in window;
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("Read failed"));
        r.readAsDataURL(blob);
    });
}

export default function PaymentSuccess({ order, onClose }: PaymentSuccessProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const visibleReceiptRef = useRef<HTMLDivElement>(null);
    const receiptBlobRef = useRef<Blob | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageReady, setImageReady] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showScreenshotHint, setShowScreenshotHint] = useState(false);

    /**
     * Deteksi Safari sesuai Apple Developer Documentation best practices
     * Safari memiliki keterbatasan pada download attribute dan file handling
     * 
     * Referensi: https://developer.apple.com/documentation/foundation/url_loading_system/downloading_files_from_websites
     */
    function isSafari(): boolean {
        if (typeof window === "undefined") return false;
        const ua = navigator.userAgent;
        // Deteksi Safari: ada "Safari" tapi bukan Chrome/Edge/Opera
        // iOS devices selalu Safari (meskipun bisa pakai Chrome, tapi Chrome iOS masih pakai WebKit Safari)
        return (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Edg/i.test(ua)) || /iPhone|iPad|iPod/i.test(ua);
    }

    /**
     * Deteksi Safari untuk menentukan behavior download (bukan upload)
     * Upload ke Supabase/Telegram menggunakan fetch API ke same-origin route
     * yang bekerja dengan baik di Safari (per Apple Developer Documentation)
     */
    function isSafariOrNeedsNewTab(): boolean {
        return isSafari();
    }

    /**
     * Upload nota ke Supabase + kirim ke Telegram
     * Mengikuti Apple Developer Documentation & Next.js best practices:
     * - Fetch API ke same-origin API route bekerja dengan baik di Safari
     * - Server-side API route tidak terpengaruh oleh browser limitations
     * - Tidak perlu window.open untuk same-origin requests
     * 
     * Referensi:
     * - https://developer.apple.com/documentation/foundation/url_loading_system/downloading_files_from_websites
     * - Next.js API Routes best practices
     */
    const sendReceiptToCloud = useCallback(async (blob: Blob): Promise<void> => {
        const orderIdVal = order.orderId || `KAGI-${Date.now()}`;
        const filename = `nota-kagi-${orderIdVal}.png`;

        try {
            // Convert blob ke data URL untuk dikirim ke API route
            const dataUrl = await blobToDataUrl(blob);
            
            // Fetch ke same-origin API route - bekerja dengan baik di Safari
            // Per Apple Developer Documentation, same-origin requests tidak diblokir
            const response = await fetch("/api/receipt/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: dataUrl, filename, orderId: orderIdVal }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Upload nota ke Supabase/Telegram gagal:", {
                    status: response.status,
                    error: errorData.error || errorData.detail || "Unknown error",
                });
            } else {
                console.log("Nota berhasil dikirim ke Supabase dan Telegram");
            }
        } catch (err) {
            // Log error tapi jangan throw - upload adalah background operation
            console.error("Error saat upload nota ke Supabase/Telegram:", err);
        }
    }, [order.orderId]);

    /**
     * Generate gambar nota sekali saat payment success dan upload ke Supabase/Telegram
     * Mengikuti Apple Developer Documentation & Next.js best practices:
     * - Upload selalu dilakukan untuk semua browser (termasuk Safari)
     * - Fetch API ke same-origin API route bekerja dengan baik di Safari
     * - Upload adalah background operation yang tidak menghalangi UI
     */
    useEffect(() => {
        let cancelled = false;
        const t = setTimeout(async () => {
            const el = receiptRef.current;
            if (cancelled) {
                setImageReady(true);
                return;
            }
            if (el) {
                try {
                    const blob = await captureReceiptToBlob(el);
                    if (!cancelled && blob) {
                        receiptBlobRef.current = blob;
                        // Upload ke Supabase/Telegram untuk semua browser (termasuk Safari)
                        // Fetch API ke same-origin API route bekerja dengan baik di Safari
                        // Per Apple Developer Documentation, same-origin requests tidak diblokir
                        sendReceiptToCloud(blob).catch((err) => {
                            // Log error tapi jangan block UI
                            console.error("Background upload error:", err);
                        });
                    }
                } catch (error) {
                    // Log error tapi tetap set imageReady untuk user bisa screenshot
                    console.warn("Capture receipt error (user can still screenshot):", error);
                }
            }
            if (!cancelled) setImageReady(true);
        }, 800);
        const fallback = setTimeout(() => {
            if (!cancelled) setImageReady(true);
        }, 2500);
        return () => {
            cancelled = true;
            clearTimeout(t);
            clearTimeout(fallback);
        };
    }, [order.orderId, sendReceiptToCloud]);

    const getReceiptBlob = async (): Promise<Blob | null> => {
        // #region agent log
        console.log('[DEBUG] getReceiptBlob called', { hasCachedBlob: !!receiptBlobRef.current, hasReceiptRef: !!receiptRef.current, hasVisibleRef: !!visibleReceiptRef.current });
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:396',message:'getReceiptBlob called',data:{hasCachedBlob:!!receiptBlobRef.current,hasReceiptRef:!!receiptRef.current,hasVisibleRef:!!visibleReceiptRef.current},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (receiptBlobRef.current) return receiptBlobRef.current;
        
        // Coba capture dari off-screen element dulu
        if (receiptRef.current) {
            try {
                const blob = await captureReceiptToBlob(receiptRef.current);
                if (blob) {
                    receiptBlobRef.current = blob;
                    return blob;
                }
            } catch (error) {
                console.warn('[DEBUG] Capture from off-screen failed, trying visible element', error);
                // Fallback: gunakan visible element jika off-screen gagal
                if (visibleReceiptRef.current) {
                    try {
                        const blob = await captureReceiptToBlob(visibleReceiptRef.current);
                        if (blob) {
                            receiptBlobRef.current = blob;
                            return blob;
                        }
                    } catch (fallbackError) {
                        console.error('[DEBUG] Capture from visible element also failed', fallbackError);
                    }
                }
                throw error; // Re-throw original error
            }
        }
        
        // Fallback ke visible element jika off-screen tidak ada
        if (visibleReceiptRef.current) {
            const blob = await captureReceiptToBlob(visibleReceiptRef.current);
            if (blob) receiptBlobRef.current = blob;
            return blob;
        }
        
        return null;
    };


    /**
     * Handle save image dengan mengikuti Apple Developer Documentation best practices:
     * - Safari iOS: Tidak mendukung download attribute, gunakan Web Share API atau screenshot
     * - Safari Desktop: Download attribute didukung tapi harus synchronous (dalam user activation)
     * - Web Share API: Jangan gunakan parameter 'text' bersamaan dengan 'files' (iOS akan copy text bukan file)
     * - Semua operasi harus dipicu oleh user activation (button click) - sudah terpenuhi
     * 
     * Referensi: https://developer.apple.com/documentation/foundation/url_loading_system/downloading_files_from_websites
     */
    const handleSaveImage = async () => {
        setIsSaving(true);
        const forceDone = setTimeout(() => {
            setIsSaving(false);
            // Jika Safari dan timeout, tampilkan hint screenshot
            if (isSafari()) {
                setShowScreenshotHint(true);
                setIsFullScreen(true);
                toast.error("Download tidak tersedia di Safari. Gunakan tombol Screenshot untuk mengambil gambar.");
            } else {
                toast.error("Proses terlalu lama. Coba gunakan \"Bagikan Nota\" atau coba lagi.");
            }
        }, 18000);
        try {
            // Safari fix: Jika blob sudah ready, gunakan langsung tanpa async delay
            let blob = receiptBlobRef.current;
            const needsCapture = !blob;
            
            if (needsCapture) {
                blob = await getReceiptBlob();
            }
            
            if (!blob) {
                // Jika Safari dan gagal, tampilkan hint screenshot
                if (isSafari()) {
                    setShowScreenshotHint(true);
                    setIsFullScreen(true);
                    toast.error("Download tidak tersedia di Safari. Gunakan tombol Screenshot.");
                } else {
                    toast.error("Gagal menyimpan gambar");
                }
                clearTimeout(forceDone);
                setIsSaving(false);
                return;
            }
            
            const filename = `nota-kagi-${order.orderId || Date.now()}.png`;
            const file = new File([blob], filename, { type: "image/png" });
            const isSafariDesktop = isSafariOrNeedsNewTab() && !isMobile();

            if (isMobile()) {
                // iOS Safari: Gunakan Web Share API (Apple best practice)
                // Safari iOS tidak mendukung download attribute, jadi Web Share adalah cara terbaik
                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                    try {
                        // Best practice: Jangan gunakan parameter 'text' bersamaan dengan files
                        // iOS akan copy text ke clipboard bukan file (per Apple documentation)
                        await navigator.share({
                            title: `Nota Kagi Ramen - ${order.orderId}`,
                            files: [file],
                        });
                        toast.success("Pilih \"Simpan ke Foto\" atau simpan dari menu bagikan.");
                    } catch (err) {
                        if ((err as Error).name !== "AbortError") {
                            // Jika Safari dan share gagal, tampilkan hint screenshot
                            if (isSafari()) {
                                setShowScreenshotHint(true);
                                setIsFullScreen(true);
                                toast.error("Share tidak tersedia. Gunakan tombol Screenshot.");
                            } else {
                                toast.error("Bagikan dibatalkan atau tidak didukung.");
                            }
                        }
                    }
                    clearTimeout(forceDone);
                    setIsSaving(false);
                    return;
                }
                // Safari iOS tidak mendukung download attribute (per Apple documentation)
                // Tidak ada cara programmatic yang reliable untuk force download di Safari iOS
                // Best practice: Arahkan ke screenshot mode
                if (isSafari()) {
                    setShowScreenshotHint(true);
                    setIsFullScreen(true);
                    toast.error("Download tidak tersedia di Safari iOS. Gunakan tombol Screenshot.");
                    clearTimeout(forceDone);
                    setIsSaving(false);
                    return;
                }
                // Fallback untuk mobile non-Safari: gunakan data URL
                try {
                    const dataUrl = await blobToDataUrl(blob);
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.target = "_blank";
                    link.rel = "noopener";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Tekan lama pada gambar → Simpan gambar.");
                } catch (err) {
                    toast.error("Gagal membuka gambar. Coba gunakan tombol Screenshot.");
                }
            } else if (isSafariDesktop) {
                // Safari Desktop: Download attribute didukung tapi harus synchronous
                // Best practice: Trigger download dalam event handler user click (sudah synchronous)
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.style.display = "none";
                document.body.appendChild(link);
                // Trigger click secara synchronous (dalam event handler user click)
                // Ini adalah best practice untuk Safari Desktop (per Apple documentation)
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                toast.success("Nota berhasil disimpan!");
            } else {
                // Chrome/Firefox/Edge: Gunakan link.click() (bekerja dengan baik)
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                toast.success("Nota berhasil disimpan!");
            }
        } catch (error) {
            console.error("Error saving image:", error);
            // Jika Safari dan error, tampilkan hint screenshot
            if (isSafari()) {
                setShowScreenshotHint(true);
                setIsFullScreen(true);
                toast.error("Download tidak tersedia di Safari. Gunakan tombol Screenshot.");
            } else {
                toast.error(error instanceof Error && error.message === "Capture timeout"
                    ? "Pembuatan gambar terlalu lama. Coba lagi atau gunakan \"Bagikan Nota\"."
                    : `Gagal menyimpan gambar: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        } finally {
            clearTimeout(forceDone);
            setIsSaving(false);
        }
    };

    const handleScreenshotMode = () => {
        setIsFullScreen(true);
        setShowScreenshotHint(true);
        // Scroll ke atas untuk memastikan nota terlihat penuh
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
        setShowScreenshotHint(false);
    };

    /**
     * Handle share dengan mengikuti Apple Developer Documentation best practices:
     * - Web Share API: Jangan gunakan parameter 'text' bersamaan dengan 'files' atau 'url'
     *   iOS akan copy text ke clipboard bukan file/URL (per Apple documentation)
     * - Safari iOS: Tidak mendukung ClipboardItem dengan image, gunakan screenshot sebagai fallback
     * - Semua operasi harus dipicu oleh user activation (button click) - sudah terpenuhi
     * 
     * Referensi: 
     * - https://developer.apple.com/documentation/foundation/url_loading_system/downloading_files_from_websites
     * - Web Share API best practices untuk Safari iOS
     */
    const handleShare = async () => {
        setIsSaving(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:512',message:'handleShare START',data:{hasCachedBlob:!!receiptBlobRef.current,isMobile:isMobile()},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
            const blobStartTime = Date.now();
            const blob = await getReceiptBlob();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/66bfc78f-337a-4604-9667-d8e01fdbd8c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PaymentSuccess.tsx:516',message:'getReceiptBlob completed',data:{elapsed:Date.now()-blobStartTime,hasBlob:!!blob,blobSize:blob?.size},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (!blob) {
                // Jika Safari dan gagal, tampilkan hint screenshot
                if (isSafari()) {
                    setShowScreenshotHint(true);
                    setIsFullScreen(true);
                    toast.error("Share tidak tersedia di Safari. Gunakan tombol Screenshot.");
                } else {
                    toast.error("Gagal membagikan nota");
                }
                setIsSaving(false);
                return;
            }
            const file = new File(
                [blob],
                `nota-kagi-${order.orderId || Date.now()}.png`,
                { type: "image/png" }
            );

            // 1. Web Share API (files) — Apple best practice untuk Safari iOS
            // Best practice: Jangan gunakan parameter 'text' bersamaan dengan 'files'
            // iOS akan copy text ke clipboard bukan file (per Apple documentation)
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    // Hanya gunakan title dan files (best practice per Apple documentation)
                    await navigator.share({
                        title: `Nota Kagi Ramen - ${order.orderId}`,
                        files: [file],
                    });
                    toast.success("Nota berhasil dibagikan!");
                    setIsSaving(false);
                    return;
                } catch (err) {
                    if ((err as Error).name === "AbortError") {
                        setIsSaving(false);
                        return;
                    }
                    // Jika Safari dan share gagal, tampilkan hint screenshot
                    if (isSafari()) {
                        setShowScreenshotHint(true);
                        setIsFullScreen(true);
                        toast.error("Share tidak tersedia di Safari. Gunakan tombol Screenshot.");
                    } else {
                        toast.error("Gagal membagikan nota");
                    }
                    setIsSaving(false);
                    return;
                }
            }

            // 2. Fallback: copy image to clipboard (desktop/mobile, non-Safari)
            // Safari iOS tidak mendukung ClipboardItem dengan image (per Apple documentation)
            if (!isSafari()) {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                    toast.success("Nota disalin ke clipboard! Tempel (Ctrl+V) di chat atau dokumen.");
                    setIsSaving(false);
                    return;
                } catch {
                    // Clipboard not supported or denied - continue to next fallback
                }
            }

            // 3. Fallback untuk non-Safari: buka di tab baru
            // Safari iOS tidak mendukung download attribute dan tidak ada cara programmatic
            // yang reliable untuk force download (per Apple documentation)
            if (isSafari()) {
                // Best practice untuk Safari: Arahkan ke screenshot mode
                setShowScreenshotHint(true);
                setIsFullScreen(true);
                toast.error("Share tidak tersedia di Safari. Gunakan tombol Screenshot.");
                setIsSaving(false);
                return;
            }

            // Fallback untuk browser lain: buka di tab baru
            try {
                const dataUrl = await blobToDataUrl(blob);
                const link = document.createElement("a");
                link.href = dataUrl;
                link.target = "_blank";
                link.rel = "noopener";
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Nota dibuka di tab baru. Simpan atau bagikan dari tab tersebut.");
            } catch (err) {
                toast.error("Gagal membuka nota. Coba gunakan tombol Screenshot.");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            // Jika Safari dan error, tampilkan hint screenshot
            if (isSafari()) {
                setShowScreenshotHint(true);
                setIsFullScreen(true);
                toast.error("Share tidak tersedia di Safari. Gunakan tombol Screenshot.");
            } else {
                toast.error(`Gagal membagikan nota: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const currentDate = new Date().toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Full screen mode untuk screenshot
    if (isFullScreen) {
        const headerHeight = showScreenshotHint ? 120 : 64;
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-white"
                >
                    {/* Header untuk full screen */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <h2 className="text-lg font-bold">Pembayaran Berhasil!</h2>
                        </div>
                        <button
                            onClick={handleExitFullScreen}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Keluar dari mode full screen"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Screenshot hint */}
                    {showScreenshotHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-16 left-0 right-0 z-10 bg-blue-500 text-white p-3 text-center shadow-md"
                        >
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                <Camera className="w-5 h-5 flex-shrink-0" />
                                <p className="font-semibold text-sm md:text-base">
                                    {isMobile() 
                                        ? "Tekan Power + Volume Up untuk screenshot (Android & iPhone)"
                                        : "Tekan Cmd+Shift+3 (Mac) atau Windows+Shift+S (Windows) untuk screenshot"}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Receipt full screen */}
                    <div 
                        className="h-full overflow-y-auto px-4 flex items-center justify-center"
                        style={{ paddingTop: `${headerHeight}px`, paddingBottom: '80px' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-lg shadow-2xl p-6 md:p-8 border-2 border-dashed border-gray-200 relative overflow-hidden w-full max-w-2xl"
                        >
                            <ReceiptContent order={order} totalItems={totalItems} currentDate={currentDate} />
                        </motion.div>
                    </div>

                    {/* Footer untuk full screen */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-3 shadow-sm">
                        <button
                            onClick={handleExitFullScreen}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Normal mode dengan download/share
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-background rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-destructive text-primary-foreground p-6 text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-2" />
                        </motion.div>
                        <h2 className="text-2xl font-bold">Pembayaran Berhasil!</h2>
                        <p className="text-sm mt-1 opacity-90">
                            Kami sedang meracik kaldu spesial untuk Anda~
                        </p>
                    </div>

                    {/* Receipt */}
                    <div className="flex-1 overflow-y-auto p-6 relative">
                        {/* Off-screen receipt for capture (no visibility:hidden — html2canvas needs painted content) */}
                        <div
                            ref={receiptRef}
                            data-receipt-capture
                            style={{ 
                                position: 'absolute',
                                left: '-9999px',
                                top: '-9999px',
                                width: '384px',
                                transform: 'none',
                                backgroundColor: '#ffffff',
                                borderRadius: '0.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                padding: '1.5rem',
                                border: '2px dashed #e5e7eb',
                                overflow: 'hidden',
                                zIndex: -1,
                                pointerEvents: 'none',
                            }}
                            aria-hidden="true"
                        >
                            <ReceiptContentForCapture order={order} totalItems={totalItems} currentDate={currentDate} />
                        </div>

                        {/* Visible receipt with animation */}
                        <motion.div
                            ref={visibleReceiptRef}
                            initial={{ 
                                rotateX: -90, 
                                opacity: 0, 
                                y: 100,
                                scale: 0.8,
                            }}
                            animate={{ 
                                rotateX: 0, 
                                opacity: 1, 
                                y: 0,
                                scale: 1,
                            }}
                            transition={{
                                delay: 0.3,
                                duration: 0.8,
                                type: "spring",
                                stiffness: 150,
                                damping: 15,
                            }}
                            style={{ 
                                transformStyle: "preserve-3d",
                                perspective: "1000px",
                            }}
                            className="bg-white rounded-lg shadow-2xl p-6 border-2 border-dashed border-gray-200 relative overflow-hidden"
                        >
                            <ReceiptContent order={order} totalItems={totalItems} currentDate={currentDate} />
                        </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-border bg-card space-y-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSaveImage}
                            disabled={isSaving || !imageReady}
                            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-5 h-5" />
                            {!imageReady ? "Menyiapkan nota..." : isSaving ? "Menyimpan..." : "Simpan Nota"}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleShare}
                            disabled={isSaving || !imageReady}
                            className="w-full bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            <Share2 className="w-5 h-5" />
                            {!imageReady ? "Menyiapkan nota..." : isSaving ? "Mempersiapkan..." : "Bagikan Nota"}
                        </motion.button>
                        {/* Tombol Screenshot untuk Safari atau sebagai opsi alternatif */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleScreenshotMode}
                            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                            {isSafari() ? "Screenshot Nota (Rekomendasi untuk Safari)" : "Screenshot Nota"}
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
