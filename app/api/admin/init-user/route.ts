import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Endpoint de emergência: reseta senha e e-mail do usuário alissondev.
// Protegido por ADMIN_SECRET. Remova ou desabilite após o uso.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || secret !== adminSecret) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const newPassword = searchParams.get("password") ?? "host3000";
    const email = searchParams.get("email") ?? "alisontattooskate@gmail.com";

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const user = await prisma.user.update({
        where: { username: "alissondev" },
        data: { password: passwordHash, email },
    });

    return NextResponse.json({
        ok: true,
        username: user.username,
        email: user.email,
        message: `Senha redefinida para "${newPassword}" e e-mail atualizado.`,
    });
}