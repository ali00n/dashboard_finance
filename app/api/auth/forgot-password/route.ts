import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        // Não revela se o e-mail existe ou não
        return NextResponse.json({ ok: true });
    }

    // Invalida tokens anteriores não utilizados
    await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await resend.emails.send({
        from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
        to: email,
        subject: "Redefinição de senha — Finance Dashboard",
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070d;color:#e2e8f0;border-radius:16px;">
                <h2 style="color:#fff;margin-bottom:8px;">Redefinição de senha</h2>
                <p style="color:#94a3b8;">Clique no botão abaixo para redefinir sua senha. O link expira em <strong>1 hora</strong>.</p>
                <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">
                    Redefinir senha
                </a>
                <p style="color:#475569;font-size:13px;">Se você não solicitou a redefinição, ignore este e-mail.</p>
                <hr style="border-color:#1e1e35;margin:24px 0;" />
                <p style="color:#475569;font-size:12px;">Ou copie o link: ${resetUrl}</p>
            </div>
        `,
    });

    return NextResponse.json({ ok: true });
}