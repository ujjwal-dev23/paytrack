import "dotenv/config";
import { app } from "./app";
import { initDb } from "./db";

const port = process.env.PORT || 3000;

// Initialize Database
try {
  initDb();
  console.log("Database initialized successfully.");
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Handle server startup errors
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`Error: Port ${port} requires elevated privileges.`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Error: Port ${port} is already in use.`);
      process.exit(1);
      break;
    default:
      console.error(`Server startup error: ${error.message}`);
      process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error(`Unhandled Rejection: ${err.name} - ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error(`Uncaught Exception: ${err.name} - ${err.message}`);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received: closing HTTP server.");
  server.close(() => {
    console.info("HTTP server closed.");
    process.exit(0);
  });
});
