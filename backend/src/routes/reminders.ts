import express from "express";
import type { Response, NextFunction } from "express";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import type { Reminder } from "../models";
import { sendInvoiceReminder } from "../services/email";

const router = express.Router();

// All reminder routes require authentication
router.use(protect);

/**
 * Create a new reminder log and send email
 * POST /api/reminders
 */
router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { invoice_id, currency_symbol } = req.body;

  if (!invoice_id) {
    return next(new ApiError(400, "Please provide invoice_id"));
  }

  try {
    // 1. Fetch detailed data for email
    const data = db
      .prepare(
        `
      SELECT
        i.amount, i.due_date, i.status, i.description, i.user_id,
        c.username as customer_name, c.email as customer_email,
        u.username as my_name, u.email as my_email, u.reminder_template
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `,
      )
      .get(invoice_id) as
      | {
          amount: number;
          due_date: string;
          status: string;
          description: string | null;
          user_id: number;
          customer_name: string;
          customer_email: string;
          my_name: string;
          my_email: string;
          reminder_template: string;
        }
      | undefined;

    if (!data) {
      return next(new ApiError(404, "Invoice data not found"));
    }

    // IMPORTANT: Security check to ensure invoice belongs to the logged-in user
    if (data.user_id !== req.user!.id) {
      return next(new ApiError(403, "Not authorized to send reminders for this invoice"));
    }

    // 2. Interpolate template
    const symbol = currency_symbol || "$";
    const formattedAmount = `${symbol}${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formattedDate = new Date(data.due_date).toLocaleDateString();

    let emailText = data.reminder_template || "";
    
    // Support both curly braces and potentially case-insensitive matching for better UX
    const replacements = {
      customer_name: data.customer_name,
      description: data.description || "No description provided",
      amount: formattedAmount,
      status: data.status.toUpperCase(),
      due_date: formattedDate,
      my_name: data.my_name,
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, "gi");
      emailText = emailText.replace(regex, value);
    });

    // 3. Send email via Resend
    await sendInvoiceReminder({
      to: data.customer_email,
      replyTo: data.my_email,
      subject: `Reminder: Invoice Payment Due (${formattedDate})`,
      text: emailText,
    });

    // 4. Create reminder log only if email succeeded
    const stmt = db.prepare("INSERT INTO reminders (invoice_id) VALUES (?)");
    const info = stmt.run(invoice_id);

    const newReminder: Reminder = {
      id: Number(info.lastInsertRowid),
      invoice_id,
      sent_on: new Date().toISOString(),
    };

    res.status(201).json({
      status: "success",
      data: { reminder: newReminder },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all reminders for the authenticated user's invoices
 * GET /api/reminders
 */
router.get("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminders = db
      .prepare(
        `
      SELECT r.*
      FROM reminders r
      JOIN invoices i ON r.invoice_id = i.id
      WHERE i.user_id = ?
      ORDER BY r.sent_on DESC
    `,
      )
      .all(req.user!.id) as Reminder[];

    res.status(200).json({
      status: "success",
      results: reminders.length,
      data: { reminders },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a single reminder
 * GET /api/reminders/:id
 */
router.get("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const reminder = db
      .prepare(
        `
      SELECT r.*
      FROM reminders r
      JOIN invoices i ON r.invoice_id = i.id
      WHERE r.id = ? AND i.user_id = ?
    `,
      )
      .get(id, req.user!.id) as Reminder | undefined;

    if (!reminder) {
      return next(new ApiError(404, "Reminder not found"));
    }

    res.status(200).json({
      status: "success",
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a reminder log
 * DELETE /api/reminders/:id
 */
router.delete("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    // Check ownership before deleting
    const reminder = db
      .prepare(
        `
      SELECT r.id
      FROM reminders r
      JOIN invoices i ON r.invoice_id = i.id
      WHERE r.id = ? AND i.user_id = ?
    `,
      )
      .get(id, req.user!.id);

    if (!reminder) {
      return next(new ApiError(404, "Reminder not found"));
    }

    db.prepare("DELETE FROM reminders WHERE id = ?").run(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
