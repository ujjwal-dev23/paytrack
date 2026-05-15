import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const initDb = () => {
  const createUsers = db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      reminder_template TEXT
  );`);

  const createInvoices = db.prepare(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      due_date DATETIME NOT NULL,
      status TEXT CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
      created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE
  );`);

  const createReminders = db.prepare(`CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sent_on DATETIME DEFAULT CURRENT_TIMESTAMP,
      invoice_id INTEGER NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
  );`);

  db.transaction(() => {
    createUsers.run();
    createInvoices.run();
    createReminders.run();
  })();
};

export { db, initDb };
