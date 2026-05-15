import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import type { User } from "../models";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";

/**
 * Extended Express Request to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: Omit<User, "password">;
}

/**
 * Middleware to protect routes - ensures user is authenticated
 */
export const protect = (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Get token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      email: string;
    };

    // 3. Check if user still exists in database
    const user = db
      .prepare("SELECT id, username, email, reminder_template FROM users WHERE id = ?")
      .get(decoded.id) as Omit<User, "password"> | undefined;

    if (!user) {
      return next(new ApiError(401, "The user belonging to this token no longer exists"));
    }

    // 4. Grant access to protected route
    req.user = user;
    next();
  } catch (_error) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }
};
