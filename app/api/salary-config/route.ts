import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await prisma.salaryConfig.findUnique({ where: { userId: session.user.id } });
    return NextResponse.json(data ?? { baseSalary: 0 });
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { baseSalary } = await request.json();
        const data = await prisma.salaryConfig.upsert({
            where: { userId: session.user.id },
            update: { baseSalary: parseFloat(baseSalary) || 0 },
            create: { userId: session.user.id, baseSalary: parseFloat(baseSalary) || 0 },
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
    }
}