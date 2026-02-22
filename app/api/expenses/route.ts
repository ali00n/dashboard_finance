import { auth } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const expenses = db
        .prepare("SELECT * FROM Expense WHERE userId = ? ORDER BY date DESC")
        .all(session.user.id);

    return NextResponse.json(expenses);
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

    const db = getDb();
    const id = randomBytes(8).toString("hex");
    const now = new Date().toISOString();
    const dateStr = date ? new Date(date).toISOString() : now;

    db.prepare(
        "INSERT INTO Expense (id, title, amount, category, description, date, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, title, parseFloat(amount), category, description || null, dateStr, session.user.id, now, now);

    const expense = db.prepare("SELECT * FROM Expense WHERE id = ?").get(id);
    return NextResponse.json(expense, { status: 201 });
}
