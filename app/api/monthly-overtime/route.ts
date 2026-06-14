import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

    const data = await prisma.monthlyOvertime.findUnique({
        where: { userId_month: { userId: session.user.id, month } },
    });
    return NextResponse.json(data ?? { amount: 0 });
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { month, amount } = await request.json();
        if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

        const data = await prisma.monthlyOvertime.upsert({
            where: { userId_month: { userId: session.user.id, month } },
            update: { amount: parseFloat(amount) || 0 },
            create: { userId: session.user.id, month, amount: parseFloat(amount) || 0 },
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
    }
}