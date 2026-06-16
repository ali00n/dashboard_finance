import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    amount: z.coerce.number().positive().optional(),
    category: z.string().min(1).optional(),
    description: z.string().max(500).optional().nullable(),
    date: z.string().optional(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
        const issue = parsed.error.issues?.[0];
        return NextResponse.json({ error: issue?.message ?? "Dados inválidos" }, { status: 400 });
    }

    const { title, amount, category, description, date } = parsed.data;

    const income = await prisma.income.update({
        where: { id },
        data: {
            ...(title !== undefined && { title }),
            ...(amount !== undefined && { amount }),
            ...(category !== undefined && { category }),
            description: description ?? null,
            ...(date !== undefined && { date: new Date(date) }),
        },
    });

    return NextResponse.json(income);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.income.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}