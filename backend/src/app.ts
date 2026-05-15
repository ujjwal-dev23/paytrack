import express from "express";
import cors from "cors";
import health from "./routes/health";
import auth from "./routes/auth";
import invoices from "./routes/invoices";
import reminders from "./routes/reminders";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/ApiError";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "0.0.0.0",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

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
