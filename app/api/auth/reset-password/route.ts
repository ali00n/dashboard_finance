import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = checkRateLimit(`reset:${ip}`, 5, 300_000);
    if (!allowed) {
        return NextResponse.json(
            { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
            {
                status: 429,
                headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
            }
        );
    }

    const { token, password } = await request.json();

    if (!token || !password || password.length < 8) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        }),
    ]);

    return NextResponse.json({ ok: true });
}