import express from "express";
import type { Response, NextFunction } from "express";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import type { Invoice, InvoiceStatus } from "../models";

const router = express.Router();

// All invoice routes require authentication
router.use(protect);

/**
 * Get all invoices for the authenticated user
 * GET /api/invoices
 */
router.get("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoices = db
      .prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_on DESC")
      .all(req.user!.id) as Invoice[];

    res.status(200).json({
      status: "success",
      results: invoices.length,
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a single invoice
 * GET /api/invoices/:id
 */
router.get("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
      | Invoice
      | undefined;

    if (!invoice) {
      return next(new ApiError(404, "Invoice not found"));
    }

    if (invoice.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to view this invoice"));
    }

    res.status(200).json({
      status: "success",
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new invoice
 * POST /api/invoices
 */
router.post("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { amount, customer_id, due_date, status } = req.body;

  if (!amount || !customer_id || !due_date) {
    return next(new ApiError(400, "Please provide amount, customer_id, and due_date"));
  }

  if (customer_id === req.user?.id) {
    return next(new ApiError(400, "User cannot be equal to Customer"));
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO invoices (amount, user_id, customer_id, due_date, status) VALUES (?, ?, ?, ?, ?)",
    );

    const info = stmt.run(amount, req.user!.id, customer_id, due_date, status || "pending");

    const newInvoice: Invoice = {
      id: Number(info.lastInsertRowid),
      amount,
      user_id: req.user!.id,
      customer_id,
      due_date,
      status: (status as InvoiceStatus) || "pending",
      created_on: new Date().toISOString(), // This is a fallback, DB uses CURRENT_TIMESTAMP
    };

    res.status(201).json({
      status: "success",
      data: { invoice: newInvoice },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update an invoice
 * PATCH /api/invoices/:id
 */
router.patch("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { amount, customer_id, due_date, status } = req.body;

  try {
    // 1. Check if invoice exists and belongs to user
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
      | Invoice
      | undefined;

    if (!invoice) {
      return next(new ApiError(404, "Invoice not found"));
    }

    if (invoice.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to update this invoice"));
    }

    // 2. Perform update
    const stmt = db.prepare(`
      UPDATE invoices
      SET
        amount = COALESCE(?, amount),
        customer_id = COALESCE(?, customer_id),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status)
      WHERE id = ?
    `);

    stmt.run(amount, customer_id, due_date, status, id);

    const updatedInvoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as Invoice;

    res.status(200).json({
      status: "success",
      data: { invoice: updatedInvoice },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete an invoice
 * DELETE /api/invoices/:id
 */
router.delete("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    // 1. Check if invoice exists and belongs to user
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as
      | Invoice
      | undefined;

    if (!invoice) {
      return next(new ApiError(404, "Invoice not found"));
    }

    if (invoice.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to delete this invoice"));
    }

    // 2. Delete invoice
    db.prepare("DELETE FROM invoices WHERE id = ?").run(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
