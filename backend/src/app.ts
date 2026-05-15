import express from "express";
import cors from "cors";
import health from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/ApiError";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://127.0.0.1",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/health", health);

// 404 Handler - Catch-all for undefined routes
app.use((req, _res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// Global Error Handler - Must be last
app.use(errorHandler);

export { app };
