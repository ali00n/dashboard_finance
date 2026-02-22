import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const hashedPassword = await bcrypt.hash("host3000", 12);

    // Check if user exists
    let userResult = await sql`SELECT * FROM "User" WHERE username = 'alissondev'`;
    let userId = "";

    if (userResult.length === 0) {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await sql`INSERT INTO "User" (id, username, password, "createdAt") VALUES (${id}, 'alissondev', ${hashedPassword}, ${now})`;
        userId = id;
        console.log("✅ Usuário criado: alissondev");
    } else {
        userId = userResult[0].id;
        console.log("✅ Usuário já existente: alissondev");
    }

    const now = new Date();
    const sampleExpenses = [
        { title: "Almoço restaurante", amount: 35.5, category: "Alimentação", date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
        { title: "Uber para o trabalho", amount: 22.0, category: "Transporte", date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString() },
        { title: "Conta de luz", amount: 180.0, category: "Moradia", date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
        { title: "Cinema", amount: 45.0, category: "Lazer", date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
        { title: "Farmácia", amount: 67.3, category: "Saúde", date: new Date(now.getFullYear(), now.getMonth(), 8).toISOString() },
    ];

    for (const exp of sampleExpenses) {
        const id = crypto.randomUUID();
        const dateStr = new Date().toISOString();
        await sql`INSERT INTO "Expense" (id, title, amount, category, description, date, "userId", "createdAt", "updatedAt") 
                  VALUES (${id}, ${exp.title}, ${exp.amount}, ${exp.category}, null, ${exp.date}, ${userId}, ${dateStr}, ${dateStr})`;
    }

    console.log(`✅ ${sampleExpenses.length} gastos de exemplo criados.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
