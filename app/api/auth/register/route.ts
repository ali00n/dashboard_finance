import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resendVerificationEmail(userId: string, email: string) {
    try {
        await prisma.emailVerificationToken.updateMany({
            where: { userId, used: false },
            data: { used: true },
        });
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.emailVerificationToken.create({ data: { token, userId, expiresAt } });

        const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
            to: email,
            subject: "Confirme seu e-mail — Finance Dashboard",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070d;color:#e2e8f0;border-radius:16px;">
                <h2 style="color:#fff;text-align:center;">Confirme seu e-mail</h2>
                <p style="color:#94a3b8;text-align:center;">Clique no botão abaixo para ativar sua conta (link válido por 24h).</p>
                <div style="text-align:center;margin:32px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;">Confirmar e-mail</a>
                </div>
                <p style="color:#475569;font-size:12px;text-align:center;">Ou copie: <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a></p>
            </div>`,
        });
    } catch (err) {
        console.error("resendVerificationEmail failed:", err);
    }
}

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

        // 1. Check email not already in use BEFORE consuming the invite code
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            // If account exists but is unverified, resend the verification email
            if (!existing.emailVerified) {
                await resendVerificationEmail(existing.id, normalizedEmail);
                return NextResponse.json(
                    { ok: true, message: "Essa conta já existe mas não foi verificada. Reenviamos o e-mail de verificação. Verifique sua caixa de entrada (e o spam)." },
                    { status: 200 }
                );
            }
            return NextResponse.json(
                { error: "Não foi possível criar a conta. Verifique os dados e tente novamente." },
                { status: 400 }
            );
        }

        // 2. Validate invite code (without consuming yet)
        const normalizedCode = inviteCode.toUpperCase().trim();
        const invCheck = await prisma.inviteCode.findUnique({ where: { code: normalizedCode } });
        if (!invCheck) {
            return NextResponse.json({ error: "Código de convite inválido." }, { status: 400 });
        }
        if (invCheck.useCount >= invCheck.maxUses) {
            return NextResponse.json({ error: "Código de convite já foi utilizado o número máximo de vezes." }, { status: 400 });
        }
        if (invCheck.expiresAt && invCheck.expiresAt < new Date()) {
            return NextResponse.json({ error: "Código de convite expirado." }, { status: 400 });
        }

        // 3. Atomically: consume code + create user + create verification token
        const hashedPassword = await bcrypt.hash(password, 12);
        const name = normalizedEmail.split("@")[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        let user: { id: string };
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Re-check inside transaction to prevent race conditions
                const inv = await tx.inviteCode.findUnique({ where: { code: normalizedCode } });
                if (!inv || inv.useCount >= inv.maxUses) throw new Error("CODE_MAXED");

                const newUser = await tx.user.create({
                    data: { email: normalizedEmail, name, password: hashedPassword },
                });

                await tx.emailVerificationToken.create({
                    data: { token, userId: newUser.id, expiresAt },
                });

                await tx.inviteCode.update({
                    where: { id: inv.id },
                    data: { useCount: { increment: 1 } },
                });

                return newUser;
            });
            user = result;
        } catch (e: any) {
            if (e.message === "CODE_MAXED") {
                return NextResponse.json({ error: "Código de convite já foi utilizado o número máximo de vezes." }, { status: 400 });
            }
            throw e;
        }

        const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        // Send verification email — non-fatal: account is already created
        try {
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
        } catch (emailErr) {
            console.error("register: email send failed (account still created):", emailErr);
        }

        return NextResponse.json(
            { ok: true, message: "Conta criada! Verifique seu e-mail para ativar o acesso." },
            { status: 201 }
        );
    } catch (err) {
        console.error("register error:", err);
        return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
    }
}