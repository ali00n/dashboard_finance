import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" }
    });

    return NextResponse.json(expenses);
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        console.log("POST /api/expenses Payload:", body);

        const { title, amount, category, description, date } = body;

        if (!title || amount === undefined || !category) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const dateStr = date ? new Date(date) : new Date();

        const expense = await prisma.expense.create({
            data: {
                title,
                amount: parseFloat(amount),
                category,
                description: description || null,
                date: dateStr,
                userId: session.user.id
            }
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/expenses Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
    }
}
