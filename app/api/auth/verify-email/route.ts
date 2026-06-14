import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token obrigatório." }, { status: 400 });
    }

    const verifyToken = await prisma.emailVerificationToken.findUnique({ where: { token } });

    if (!verifyToken || verifyToken.used || verifyToken.expiresAt < new Date()) {
        return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: verifyToken.userId },
            data: { emailVerified: new Date() },
        }),
        prisma.emailVerificationToken.update({
            where: { id: verifyToken.id },
            data: { used: true },
        }),
    ]);

    return NextResponse.json({ ok: true });
}