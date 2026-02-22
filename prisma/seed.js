const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "../dev.db");
const db = new Database(dbPath);

async function seed() {
    const hashedPassword = await bcrypt.hash("host3000", 12);

    // Insert or replace user
    const existingUser = db.prepare("SELECT id FROM User WHERE username = ?").get("alissondev");

    let userId;
    if (existingUser) {
        userId = existingUser.id;
        console.log("Usuário já existe:", userId);
    } else {
        const { v4: uuidv4 } = require("crypto");
        // Use a simple cuid-like ID
        const id = "user_" + Date.now().toString(36);
        db.prepare("INSERT INTO User (id, username, password, createdAt) VALUES (?, ?, ?, ?)").run(
            id,
            "alissondev",
            hashedPassword,
            new Date().toISOString()
        );
        userId = id;
        console.log("Usuário criado:", userId);
    }

    // Delete existing expenses for this user
    db.prepare("DELETE FROM Expense WHERE userId = ?").run(userId);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sampleExpenses = [
        { title: "Almoço restaurante", amount: 35.5, category: "Alimentação", date: new Date(currentYear, currentMonth, 10).toISOString(), description: null },
        { title: "Uber para o trabalho", amount: 22.0, category: "Transporte", date: new Date(currentYear, currentMonth, 12).toISOString(), description: null },
        { title: "Conta de luz", amount: 180.0, category: "Moradia", date: new Date(currentYear, currentMonth, 5).toISOString(), description: "Conta mensal de energia" },
        { title: "Cinema com amigos", amount: 45.0, category: "Lazer", date: new Date(currentYear, currentMonth, 15).toISOString(), description: null },
        { title: "Farmácia", amount: 67.3, category: "Saúde", date: new Date(currentYear, currentMonth, 8).toISOString(), description: "Medicamentos" },
    ];

    const insertExpense = db.prepare(
        "INSERT INTO Expense (id, title, amount, category, description, date, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    for (const exp of sampleExpenses) {
        const id = "exp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        const now_iso = new Date().toISOString();
        insertExpense.run(id, exp.title, exp.amount, exp.category, exp.description, exp.date, userId, now_iso, now_iso);
    }

    console.log(sampleExpenses.length + " gastos de exemplo criados com sucesso!");
    db.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
