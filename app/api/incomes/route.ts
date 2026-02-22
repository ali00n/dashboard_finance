import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomes = await prisma.income.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" }
    });

    return NextResponse.json(incomes);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, amount, category, description, date } = body;

    if (!title || !amount || !category) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const dateStr = date ? new Date(date) : new Date();

    const income = await prisma.income.create({
        data: {
            title,
            amount: parseFloat(amount),
            category,
            description: description || null,
            date: dateStr,
            userId: session.user.id
        }
    });

    return NextResponse.json(income, { status: 201 });
}
