import express from "express";
import type { Response, NextFunction } from "express";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import type { Invoice } from "../models";

const router = express.Router();

// All invoice routes require authentication
router.use(protect);

/**
 * Get all invoices for the authenticated user
 * GET /api/invoices
 */
router.get("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Automatically mark past due pending invoices as overdue
    db.prepare(
      `
      UPDATE invoices
      SET status = 'overdue'
      WHERE user_id = ? AND status = 'pending' AND due_date < ?
    `,
    ).run(req.user!.id, today);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = `
      SELECT i.*, c.username as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ?
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ?
    `;

    const queryParams: unknown[] = [req.user!.id];
    const countParams: unknown[] = [req.user!.id];

    if (status && status !== "all") {
      query += ` AND i.status = ?`;
      countQuery += ` AND i.status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ` AND (c.username LIKE ? OR c.email LIKE ?)`;
      countQuery += ` AND (c.username LIKE ? OR c.email LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    query += ` ORDER BY i.created_on DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const invoices = db.prepare(query).all(...queryParams) as (Invoice & {
      customer_name: string;
      customer_email: string;
    })[];
    const { total: filteredTotal } = db.prepare(countQuery).get(...countParams) as {
      total: number;
    };

    // Global stats (ignoring filters)
    const globalStats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status != 'paid' THEN 1 ELSE 0 END) as unpaid
      FROM invoices 
      WHERE user_id = ?
    `,
      )
      .get(req.user!.id) as { total: number; unpaid: number };

    res.status(200).json({
      status: "success",
      results: invoices.length,
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages: Math.ceil(filteredTotal / limit) || 1,
      },
      stats: {
        total: globalStats.total,
        unpaid: globalStats.unpaid || 0,
      },
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get dashboard statistics
 * GET /api/invoices/stats/dashboard
 */
router.get("/stats/dashboard", (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // 1. Financial Totals
    const totals = db
      .prepare(
        `
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue
      FROM invoices 
      WHERE user_id = ?
    `,
      )
      .get(userId) as { paid: number; pending: number; overdue: number };

    // 2. Top Debtors (Unpaid balance)
    const topDebtors = db
      .prepare(
        `
      SELECT 
        c.id, c.username, c.email,
        SUM(i.amount) as total_unpaid
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ? AND i.status != 'paid'
      GROUP BY c.id
      ORDER BY total_unpaid DESC
      LIMIT 5
    `,
      )
      .all(userId);

    // 3. Needs Attention (Overdue or soon-to-be due)
    const needsAttention = db
      .prepare(
        `
      SELECT i.*, c.username as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ? AND i.status != 'paid'
      ORDER BY 
        CASE WHEN i.status = 'overdue' THEN 0 ELSE 1 END,
        i.due_date ASC
      LIMIT 5
    `,
      )
      .all(userId);

    res.status(200).json({
      status: "success",
      data: {
        totals: {
          paid: totals.paid || 0,
          pending: totals.pending || 0,
          overdue: totals.overdue || 0,
          total: (totals.paid || 0) + (totals.pending || 0) + (totals.overdue || 0),
        },
        topDebtors,
        needsAttention,
      },
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
    const invoice = db
      .prepare(
        `
      SELECT i.*, c.username as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `,
      )
      .get(id) as (Invoice & { customer_name: string; customer_email: string }) | undefined;

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

  try {
    // Verify customer ownership
    const customer = db
      .prepare("SELECT id FROM customers WHERE id = ? AND user_id = ?")
      .get(customer_id, req.user!.id);

    if (!customer) {
      return next(new ApiError(400, "Invalid customer_id or customer does not belong to you"));
    }

    const today = new Date().toISOString().split("T")[0];
    let finalStatus = status || "pending";
    if (finalStatus === "pending" && due_date < today) {
      finalStatus = "overdue";
    }

    const stmt = db.prepare(
      "INSERT INTO invoices (amount, user_id, customer_id, due_date, status) VALUES (?, ?, ?, ?, ?)",
    );

    const info = stmt.run(amount, req.user!.id, customer_id, due_date, finalStatus);

    const newInvoice = db
      .prepare(
        `
      SELECT i.*, c.username as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `,
      )
      .get(info.lastInsertRowid) as Invoice & { customer_name: string; customer_email: string };

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

    // Verify new customer ownership if customer_id is being changed
    if (customer_id && customer_id !== invoice.customer_id) {
      const customer = db
        .prepare("SELECT id FROM customers WHERE id = ? AND user_id = ?")
        .get(customer_id, req.user!.id);

      if (!customer) {
        return next(new ApiError(400, "Invalid customer_id or customer does not belong to you"));
      }
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

    // 3. Auto-update to overdue if needed after update
    const today = new Date().toISOString().split("T")[0];
    db.prepare(
      `
      UPDATE invoices
      SET status = 'overdue'
      WHERE id = ? AND status = 'pending' AND due_date < ?
    `,
    ).run(id, today);

    const updatedInvoice = db
      .prepare(
        `
      SELECT i.*, c.username as customer_name, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `,
      )
      .get(id) as Invoice & { customer_name: string; customer_email: string };

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
