import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await prisma.fixedExpense.findMany({
        where: { userId: session.user.id, isActive: true },
        orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, amount, category, description } = await request.json();
        if (!title || amount === undefined || !category) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const data = await prisma.fixedExpense.create({
            data: {
                title,
                amount: parseFloat(amount),
                category,
                description: description || null,
                userId: session.user.id,
            },
        });
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
    }
}