import express from "express";
import type { Response, NextFunction } from "express";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import type { Customer } from "../models";

const router = express.Router();

// All customer routes require authentication
router.use(protect);

/**
 * Get all customers for the authenticated user
 * GET /api/customers
 */
router.get("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customers = db
      .prepare("SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC")
      .all(req.user!.id) as Customer[];

    res.status(200).json({
      status: "success",
      results: customers.length,
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a single customer
 * GET /api/customers/:id
 */
router.get("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as
      | Customer
      | undefined;

    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }

    if (customer.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to view this customer"));
    }

    res.status(200).json({
      status: "success",
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new customer
 * POST /api/customers
 */
router.post("/", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return next(new ApiError(400, "Please provide username and email"));
  }

  try {
    const stmt = db.prepare("INSERT INTO customers (username, email, user_id) VALUES (?, ?, ?)");

    const info = stmt.run(username, email, req.user!.id);

    const newCustomer: Customer = {
      id: Number(info.lastInsertRowid),
      username,
      email,
      user_id: req.user!.id,
      created_at: new Date().toISOString(),
    };

    res.status(201).json({
      status: "success",
      data: { customer: newCustomer },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return next(new ApiError(400, "A customer with this email already exists for your account"));
    }
    next(error);
  }
});

/**
 * Update a customer
 * PATCH /api/customers/:id
 */
router.patch("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    // 1. Check if customer exists and belongs to user
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as
      | Customer
      | undefined;

    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }

    if (customer.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to update this customer"));
    }

    // 2. Perform update
    const stmt = db.prepare(`
      UPDATE customers
      SET
        username = COALESCE(?, username),
        email = COALESCE(?, email)
      WHERE id = ?
    `);

    stmt.run(username, email, id);

    const updatedCustomer = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as Customer;

    res.status(200).json({
      status: "success",
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return next(new ApiError(400, "A customer with this email already exists for your account"));
    }
    next(error);
  }
});

/**
 * Delete a customer
 * DELETE /api/customers/:id
 */
router.delete("/:id", (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    // 1. Check if customer exists and belongs to user
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as
      | Customer
      | undefined;

    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }

    if (customer.user_id !== req.user!.id) {
      return next(new ApiError(403, "You do not have permission to delete this customer"));
    }

    // 2. Delete customer
    db.prepare("DELETE FROM customers WHERE id = ?").run(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
