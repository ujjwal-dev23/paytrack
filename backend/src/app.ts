import express from "express";
import cors from "cors";
import health from "./routes/health";
import auth from "./routes/auth";
import invoices from "./routes/invoices";
import reminders from "./routes/reminders";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/ApiError";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || "munch_munch"));

// Routes
app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/health", health);
app.use("/api/auth", auth);
app.use("/api/invoices", invoices);
app.use("/api/reminders", reminders);

// 404 Handler - Catch-all for undefined routes
app.use((req, _res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// Global Error Handler - Must be last
app.use(errorHandler);

export { app };
