import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, inviteCode } = body;

        if (!email || !password || !confirmPassword || !inviteCode) {
            return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres." }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });
        }

        // Validate and consume invite code atomically
        const normalizedCode = inviteCode.toUpperCase().trim();
        let invite;
        try {
            invite = await prisma.$transaction(async (tx) => {
                const inv = await tx.inviteCode.findUnique({ where: { code: normalizedCode } });
                if (!inv) throw new Error("INVALID_CODE");
                if (inv.useCount >= inv.maxUses) throw new Error("CODE_MAXED");
                if (inv.expiresAt && inv.expiresAt < new Date()) throw new Error("CODE_EXPIRED");
                return tx.inviteCode.update({
                    where: { id: inv.id },
                    data: { useCount: { increment: 1 } },
                });
            });
        } catch (e: any) {
            const msg: Record<string, string> = {
                INVALID_CODE: "Código de convite inválido.",
                CODE_MAXED: "Código de convite já foi utilizado o número máximo de vezes.",
                CODE_EXPIRED: "Código de convite expirado.",
            };
            return NextResponse.json({ error: msg[e.message] ?? "Código de convite inválido." }, { status: 400 });
        }

        // Check email not already in use (return same message to prevent enumeration)
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            return NextResponse.json(
                { error: "Não foi possível criar a conta. Verifique os dados e tente novamente." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const name = normalizedEmail.split("@")[0];

        const user = await prisma.user.create({
            data: { email: normalizedEmail, name, password: hashedPassword },
        });

        // Generate email verification token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        await prisma.emailVerificationToken.create({
            data: { token, userId: user.id, expiresAt },
        });

        const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
            to: normalizedEmail,
            subject: "Confirme seu e-mail — Finance Dashboard",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070d;color:#e2e8f0;border-radius:16px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <div style="display:inline-block;width:48px;height:48px;background:#312e81;border-radius:12px;line-height:48px;font-size:24px;">💰</div>
                    </div>
                    <h2 style="color:#fff;margin-bottom:8px;text-align:center;">Bem-vindo ao Finance Dashboard!</h2>
                    <p style="color:#94a3b8;text-align:center;">Clique no botão abaixo para confirmar seu e-mail e ativar sua conta. O link expira em <strong>24 horas</strong>.</p>
                    <div style="text-align:center;margin:32px 0;">
                        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                            Confirmar e-mail
                        </a>
                    </div>
                    <p style="color:#475569;font-size:13px;text-align:center;">Se você não criou uma conta, pode ignorar este e-mail com segurança.</p>
                    <hr style="border-color:#1e1e35;margin:24px 0;" />
                    <p style="color:#475569;font-size:12px;text-align:center;">Ou copie o link: <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a></p>
                </div>
            `,
        });

        return NextResponse.json(
            { ok: true, message: "Conta criada! Verifique seu e-mail para ativar o acesso." },
            { status: 201 }
        );
    } catch (err) {
        console.error("register error:", err);
        return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
    }
}