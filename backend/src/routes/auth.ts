import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import type { User } from "../models";
import { protect } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Helper to sign token and send cookie
 */
const sendToken = (user: Omit<User, "password">, statusCode: number, res: express.Response) => {
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

/**
 * Register a new user
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError(400, "Please provide username, email, and password"));
  }

  if (password.length < 3) {
    return next(new ApiError(400, "Password must be at least 3 characters long"));
  }

  try {
    const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT || 10);

    const stmt = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    );

    const info = stmt.run(username, email, hashedPassword);
    const userId = Number(info.lastInsertRowid);

    // Fetch the user to get the database-generated default reminder_template
    const newUser = db.prepare("SELECT id, username, email, reminder_template FROM users WHERE id = ?").get(userId) as Omit<User, "password">;

    sendToken(newUser, 201, res);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return next(new ApiError(400, "Username or email already exists"));
    }
    next(error);
  }
});

/**
 * Authenticate a user
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const userResponse: Omit<User, "password"> = {
      id: user.id,
      username: user.username,
      email: user.email,
      reminder_template: user.reminder_template,
    };

    sendToken(userResponse, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Log out a user
 * POST /api/auth/logout
 */
router.post("/logout", (_req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
});

/**
 * Get current user info
 * GET /api/auth/me
 */
router.get("/me", protect, (req: AuthRequest, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

/**
 * Update current user profile
 * PATCH /api/auth/me
 */
router.patch("/me", protect, async (req: AuthRequest, res, next) => {
  const { username, password, reminder_template } = req.body;

  try {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (username) {
      updates.push("username = ?");
      params.push(username);
    }

    if (password) {
      if (password.length < 3) {
        return next(new ApiError(400, "Password must be at least 3 characters long"));
      }
      const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT || 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    if (reminder_template !== undefined) {
      updates.push("reminder_template = ?");
      params.push(reminder_template);
    }

    if (updates.length === 0) {
      return next(new ApiError(400, "Please provide username, password, or reminder_template to update"));
    }

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    params.push(req.user!.id);

    db.prepare(sql).run(...params);

    const updatedUser = db.prepare("SELECT id, username, email, reminder_template FROM users WHERE id = ?").get(req.user!.id) as Omit<User, "password">;

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return next(new ApiError(400, "Username already exists"));
    }
    next(error);
  }
});

export default router;
