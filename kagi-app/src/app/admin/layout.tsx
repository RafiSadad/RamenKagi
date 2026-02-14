import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#111111] text-[#FFF9EC]">
            <AdminNav />
            <div className="max-w-6xl mx-auto p-4">{children}</div>
        </div>
    );
}
