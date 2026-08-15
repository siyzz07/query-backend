import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import docRoutes from "./routes/documents";
import invoiceRoutes from "./routes/invoices";
import logRoutes from "./routes/logs";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { SuperAdminRoutes } from "./routes/super.admin";
import { startEmailWorker } from "./lib/queue";
import QueryRouter from "./routes/query";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Setup Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Wire Routers
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/logs", logRoutes);
app.use("/super-admin", SuperAdminRoutes);
app.use("/api/query", QueryRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Connect DB and then start the server
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Core backend running on port ${PORT}`);
      startEmailWorker();
    });
  })
  .catch((err) => {
    console.error("[Server] Critical error starting database:", err);
    process.exit(1);
  });
