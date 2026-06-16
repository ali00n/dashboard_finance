import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
        return NextResponse.json(
            { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
            {
                status: 429,
                headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
            }
        );
    }
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

        // 1. Check email availability before consuming invite code
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            // Account exists but was never activated — auto-activate so they can log in
            if (!existing.emailVerified) {
                await prisma.user.update({
                    where: { id: existing.id },
                    data: { emailVerified: new Date() },
                });
                return NextResponse.json(
                    { ok: true, message: "Conta ativada! Você já pode fazer login com seu e-mail e senha." },
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

        // 3. Atomically: consume code + create user (already verified — invite code is the trust gate)
        const hashedPassword = await bcrypt.hash(password, 12);
        const name = normalizedEmail.split("@")[0];

        try {
            await prisma.$transaction(async (tx) => {
                const inv = await tx.inviteCode.findUnique({ where: { code: normalizedCode } });
                if (!inv || inv.useCount >= inv.maxUses) throw new Error("CODE_MAXED");

                await tx.user.create({
                    data: {
                        email: normalizedEmail,
                        name,
                        password: hashedPassword,
                        emailVerified: new Date(), // auto-verified — invite code is the gate
                    },
                });

                await tx.inviteCode.update({
                    where: { id: inv.id },
                    data: { useCount: { increment: 1 } },
                });
            });
        } catch (e: any) {
            if (e.message === "CODE_MAXED") {
                return NextResponse.json({ error: "Código de convite já foi utilizado o número máximo de vezes." }, { status: 400 });
            }
            throw e;
        }

        // Send welcome email — optional, non-blocking, no verification link needed
        try {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            const token = crypto.randomBytes(32).toString("hex");
            await resend.emails.send({
                from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
                to: normalizedEmail,
                subject: "Bem-vindo ao Finance Dashboard!",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070d;color:#e2e8f0;border-radius:16px;">
                        <h2 style="color:#fff;text-align:center;">Bem-vindo ao Finance Dashboard!</h2>
                        <p style="color:#94a3b8;text-align:center;">Sua conta foi criada com sucesso. Você já pode fazer login.</p>
                        <div style="text-align:center;margin:32px 0;">
                            <a href="${process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`}/login"
                               style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;">
                                Acessar o Dashboard
                            </a>
                        </div>
                    </div>
                `,
            });
        } catch {
            // Welcome email is optional — ignore failures
        }

        return NextResponse.json(
            { ok: true, message: "Conta criada com sucesso! Você já pode fazer login." },
            { status: 201 }
        );
    } catch (err) {
        console.error("register error:", err);
        return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
    }
}
