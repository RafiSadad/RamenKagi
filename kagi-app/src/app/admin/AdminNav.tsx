"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, BarChart3, LogOut } from "lucide-react";

export default function AdminNav() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <nav className="border-b border-[#FFF9EC]/10 bg-[#1a1410] px-4 py-3">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin"
                        className="text-[#FFF9EC] font-semibold hover:text-[#FFAF03] transition-colors"
                    >
                        Kagi Admin
                    </Link>
                    <Link
                        href="/admin/stock"
                        className="flex items-center gap-2 text-sm text-[#FFF9EC]/70 hover:text-[#FFAF03] transition-colors"
                    >
                        <Package className="w-4 h-4" />
                        Stok
                    </Link>
                    <Link
                        href="/admin/sales"
                        className="flex items-center gap-2 text-sm text-[#FFF9EC]/70 hover:text-[#FFAF03] transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Penjualan
                    </Link>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-[#FFF9EC]/70 hover:text-red-400 hover:bg-red-400/10"
                >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                </Button>
            </div>
        </nav>
    );
}
