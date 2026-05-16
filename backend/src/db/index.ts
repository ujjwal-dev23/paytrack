import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const initDb = () => {
  // Users table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      reminder_template TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ).run();

  // Customers table - optimized with index on user_id
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, email)
    );
  `,
  ).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);`).run();

  // Invoices table - customer_id now references customers table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      due_date DATETIME NOT NULL,
      status TEXT CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
      created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );
  `,
  ).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);`).run();

  // Reminders table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sent_on DATETIME DEFAULT CURRENT_TIMESTAMP,
      invoice_id INTEGER NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );
  `,
  ).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_reminders_invoice_id ON reminders(invoice_id);`).run();
};

export { db, initDb };
