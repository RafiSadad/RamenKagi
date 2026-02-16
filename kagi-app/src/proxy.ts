import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST; // e.g. dashboard.ramenkagi.com

export async function proxy(request: NextRequest) {
    // Subdomain admin: dashboard.ramenkagi.com → /admin
    if (ADMIN_HOST && request.nextUrl.hostname === ADMIN_HOST && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }
    return await updateSession(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
