import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function isAuthorized(request: Request): boolean {
    const adminSecret = process.env.ADMIN_SECRET;
    const auth = request.headers.get("Authorization");
    return !!adminSecret && auth === `Bearer ${adminSecret}`;
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            emailVerified: true,
            createdAt: true,
            _count: {
                select: {
                    expenses: true,
                    incomes: true,
                    fixedExpenses: true,
                },
            },
        },
    });

    return NextResponse.json(users);
}
