import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

function getUser(username: string): { id: string; username: string; password: string } | null {
    const dbPath = path.join(process.cwd(), "dev.db");
    const db = new Database(dbPath, { readonly: true });
    try {
        return db.prepare("SELECT id, username, password FROM User WHERE username = ?").get(username) as any;
    } finally {
        db.close();
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Usuário", type: "text" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = getUser(credentials.username as string);
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password as string, user.password);
                if (!isValid) return null;

                return { id: user.id, name: user.username, email: user.username };
            },
        }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/login" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.username as string;
            }
            return session;
        },
    },
});
