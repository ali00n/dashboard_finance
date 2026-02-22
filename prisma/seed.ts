import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("host3000", 12);

    const user = await prisma.user.upsert({
        where: { username: "alissondev" },
        update: {},
        create: {
            username: "alissondev",
            password: hashedPassword,
        },
    });

    console.log("✅ Usuário criado:", user.username);

    // Seed some sample expenses
    const now = new Date();
    const sampleExpenses = [
        { title: "Almoço restaurante", amount: 35.5, category: "Alimentação", date: new Date(now.getFullYear(), now.getMonth(), 10) },
        { title: "Uber para o trabalho", amount: 22.0, category: "Transporte", date: new Date(now.getFullYear(), now.getMonth(), 12) },
        { title: "Conta de luz", amount: 180.0, category: "Moradia", date: new Date(now.getFullYear(), now.getMonth(), 5) },
        { title: "Cinema", amount: 45.0, category: "Lazer", date: new Date(now.getFullYear(), now.getMonth(), 15) },
        { title: "Farmácia", amount: 67.3, category: "Saúde", date: new Date(now.getFullYear(), now.getMonth(), 8) },
    ];

    for (const exp of sampleExpenses) {
        await prisma.expense.create({
            data: { ...exp, userId: user.id },
        });
    }

    console.log(`✅ ${sampleExpenses.length} gastos de exemplo criados.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
