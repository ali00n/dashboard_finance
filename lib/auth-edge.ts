// Lightweight middleware auth - Edge Runtime compatible (no Node.js modules)
import NextAuth from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [],  // No providers needed in middleware - JWT only
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
});
