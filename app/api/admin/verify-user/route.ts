import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const adminSecret = process.env.ADMIN_SECRET;
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const email = searchParams.get("email");

    if (!adminSecret || secret !== adminSecret) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!email) {
        return NextResponse.json({ error: "Parâmetro 'email' obrigatório." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (user.emailVerified) {
        return NextResponse.json({ ok: true, message: "Usuário já estava verificado.", email: user.email });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
    });

    return NextResponse.json({ ok: true, message: "Usuário verificado com sucesso.", email: user.email });
}
