import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Safe alphanumeric chars (no 0/O/1/I to avoid confusion)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 8): string {
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export async function POST(request: Request) {
    const adminSecret = process.env.ADMIN_SECRET;
    const authHeader = request.headers.get("Authorization");

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const maxUses: number = Number(body.maxUses) || 1;
    const expiresInDays: number | undefined = body.expiresInDays ? Number(body.expiresInDays) : undefined;

    const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    const code = generateCode();

    const invite = await prisma.inviteCode.create({
        data: { code, maxUses, expiresAt },
    });

    return NextResponse.json({
        code: invite.code,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt ?? "sem expiração",
    });
}