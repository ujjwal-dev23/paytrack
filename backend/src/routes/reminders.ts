import express from "express";
import type { Response, NextFunction } from "express";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import type { Reminder, Invoice } from "../models";

const router = express.Router();

// All reminder routes require authentication
router.use(protect);

/**
 * Create a new reminder log
 * POST /api/reminders
 */
router.post("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { invoice_id } = req.body;

  if (!invoice_id) {
    return next(new ApiError(400, "Please provide invoice_id"));
  }

  try {
    // 1. Check if invoice exists and belongs to user
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(invoice_id) as
      | Invoice
      | undefined;

    if (!invoice) {
      return next(new ApiError(404, "Invoice not found"));
    }

    if (invoice.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to add reminders to this invoice"));
    }

    // 2. Create reminder
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
