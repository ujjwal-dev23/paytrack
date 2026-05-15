import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import type { User } from "../models";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Register a new user
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError(400, "Please provide username, email, and password"));
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");

    const info = stmt.run(username, email, hashedPassword);
    const userId = Number(info.lastInsertRowid);

    const token = jwt.sign({ id: userId, username, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: userId,
          username,
          email,
        },
      },
    });
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

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
    );

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
