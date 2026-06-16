import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    amount: z.coerce.number().positive().optional(),
    category: z.string().min(1).optional(),
    description: z.string().max(500).optional().nullable(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.fixedExpense.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
        const issue = parsed.error.issues?.[0];
        return NextResponse.json({ error: issue?.message ?? "Dados inválidos" }, { status: 400 });
    }

    const data = await prisma.fixedExpense.update({
        where: { id },
        data: parsed.data,
    });
    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.fixedExpense.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { isActive } = await request.json();
    if (typeof isActive !== "boolean") {
        return NextResponse.json({ error: "isActive deve ser booleano" }, { status: 400 });
    }

    const data = await prisma.fixedExpense.update({
        where: { id },
        data: { isActive },
    });
    return NextResponse.json(data);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.fixedExpense.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.fixedExpense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}