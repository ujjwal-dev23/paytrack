import express from "express";
import { version } from "../../package.json";

const router = express.Router();

router.get("/", (_, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version,
    memoryUsage: process.memoryUsage(),
    env: process.env.NODE_ENV || "development",
  });
});

export default router;
