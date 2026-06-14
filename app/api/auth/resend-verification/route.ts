import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        // Always return success to prevent email enumeration
        if (!user || user.emailVerified) {
            return NextResponse.json({ ok: true });
        }

        // Invalidate old tokens
        await prisma.emailVerificationToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.emailVerificationToken.create({
            data: { token, userId: user.id, expiresAt },
        });

        const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
                to: normalizedEmail,
                subject: "Confirme seu e-mail — Finance Dashboard",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070d;color:#e2e8f0;border-radius:16px;">
                        <h2 style="color:#fff;margin-bottom:8px;text-align:center;">Confirme seu e-mail</h2>
                        <p style="color:#94a3b8;text-align:center;">Clique no botão abaixo para ativar sua conta. O link expira em <strong>24 horas</strong>.</p>
                        <div style="text-align:center;margin:32px 0;">
                            <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                                Confirmar e-mail
                            </a>
                        </div>
                        <hr style="border-color:#1e1e35;margin:24px 0;" />
                        <p style="color:#475569;font-size:12px;text-align:center;">Ou copie: <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a></p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error("resend-verification: email send failed:", emailErr);
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("resend-verification error:", err);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}