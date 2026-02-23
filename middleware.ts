import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        // NextAuth v5 (authjs) uses "authjs.session-token" in dev
        // and "__Secure-authjs.session-token" in prod (HTTPS)
        cookieName:
            process.env.NODE_ENV === "production"
                ? "__Secure-authjs.session-token"
                : "authjs.session-token",
    });

    const isLoggedIn = !!token;

    if (pathname.startsWith("/dashboard") && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname === "/login" && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
