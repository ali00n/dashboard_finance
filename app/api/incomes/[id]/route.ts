import { auth } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, amount, category, description, date } = body;

    const db = getDb();
    const existing = db.prepare("SELECT * FROM Income WHERE id = ?").get(id) as any;
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const dateStr = date ? new Date(date).toISOString() : existing.date;

    db.prepare(
        "UPDATE Income SET title=?, amount=?, category=?, description=?, date=?, updatedAt=? WHERE id=?"
    ).run(title, parseFloat(amount), category, description || null, dateStr, now, id);

    const income = db.prepare("SELECT * FROM Income WHERE id = ?").get(id);
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
    const db = getDb();
    const existing = db.prepare("SELECT * FROM Income WHERE id = ?").get(id) as any;
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM Income WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
}
