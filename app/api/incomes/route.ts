import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
    title: z.string().min(1, "Título obrigatório").max(100),
    amount: z.coerce.number().positive("Valor deve ser positivo"),
    category: z.string().min(1, "Categoria obrigatória"),
    description: z.string().max(500).optional().nullable(),
    date: z.string().optional(),
});

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: session.user.id };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [year, monthNum] = month.split("-").map(Number);
        where.date = {
            gte: new Date(year, monthNum - 1, 1),
            lt: new Date(year, monthNum, 1),
        };
    }

    const incomes = await prisma.income.findMany({
        where,
        orderBy: { date: "desc" },
    });

    return NextResponse.json(incomes);
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            const issue = parsed.error.issues?.[0];
            const message = issue?.message ?? "Dados inválidos";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { title, amount, category, description, date } = parsed.data;

        const income = await prisma.income.create({
            data: {
                title,
                amount,
                category,
                description: description ?? null,
                date: date ? new Date(date) : new Date(),
                userId: session.user.id,
            },
        });

        return NextResponse.json(income, { status: 201 });
    } catch (error: unknown) {
        console.error("POST /api/incomes Error:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}