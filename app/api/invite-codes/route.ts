import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 8): string {
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const codes = await prisma.inviteCode.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    return NextResponse.json(codes);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    return NextResponse.json(invite, { status: 201 });
}