const db = require('better-sqlite3')('dev.db');
db.exec(`CREATE TABLE IF NOT EXISTS Income (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'Salário',
  description TEXT,
  date TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES User(id)
)`);
console.log('Tabela Income criada com sucesso!');
db.close();
