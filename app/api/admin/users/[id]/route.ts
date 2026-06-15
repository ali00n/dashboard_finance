import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isAuthorized(request: Request): boolean {
    const adminSecret = process.env.ADMIN_SECRET;
    const auth = request.headers.get("Authorization");
    return !!adminSecret && auth === `Bearer ${adminSecret}`;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, emailVerified: true, createdAt: true,
            _count: { select: { expenses: true, incomes: true, fixedExpenses: true } } },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    return NextResponse.json(user);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, password } = body;
    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name;

    if (email !== undefined) {
        const normalizedEmail = email.toLowerCase().trim();
        const conflict = await prisma.user.findFirst({
            where: { email: normalizedEmail, NOT: { id } },
        });
        if (conflict) {
            return NextResponse.json({ error: "E-mail já em uso por outro usuário." }, { status: 400 });
        }
        data.email = normalizedEmail;
        data.emailVerified = new Date();
    }

    if (password !== undefined) {
        if (password.length < 8) {
            return NextResponse.json({ error: "Senha deve ter no mínimo 8 caracteres." }, { status: 400 });
        }
        data.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, emailVerified: true, createdAt: true },
    });

    return NextResponse.json(user);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Usuário e todos os dados foram removidos." });
}
