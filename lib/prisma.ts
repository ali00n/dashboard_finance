import Database from "better-sqlite3";
import path from "path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "dev.db");
    _db = new Database(dbPath);
  }
  return _db;
}
