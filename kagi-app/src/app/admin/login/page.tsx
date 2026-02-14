"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }
            router.push("/admin");
            router.refresh();
        } catch {
            setError("Login gagal. Coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#FFF9EC]/10 bg-[#1a1410] p-6 shadow-xl">
                <h1 className="text-xl font-semibold text-[#FFF9EC] mb-1">
                    Admin Kagi Ramen
                </h1>
                <p className="text-sm text-[#FFF9EC]/50 mb-6">Masuk ke dashboard</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#FFF9EC]/80 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[#FFF9EC]/20 bg-black/30 px-3 py-2 text-[#FFF9EC] placeholder:text-[#FFF9EC]/40 focus:border-[#FFAF03] focus:outline-none focus:ring-1 focus:ring-[#FFAF03]"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#FFF9EC]/80 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[#FFF9EC]/20 bg-black/30 px-3 py-2 text-[#FFF9EC] placeholder:text-[#FFF9EC]/40 focus:border-[#FFAF03] focus:outline-none focus:ring-1 focus:ring-[#FFAF03]"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FFAF03] hover:bg-[#e09e03] text-[#47240F] font-semibold"
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
