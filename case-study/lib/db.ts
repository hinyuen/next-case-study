import Database from 'better-sqlite3';
import path from 'path';

// Path to your SQLite database file (placed in project root or /db)
const dbPath = path.join(process.cwd(), 'sqlite.db');

// Create or open the database
const db = new Database(dbPath);

export default db;
