import express, { Application } from "express";
import expenseRoutes from "./routes/expenseRoutes";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

connectDB();

// CLIENT_URL may be a comma-separated list of allowed origins
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Basic Health Check Route
app.get("/", (req, res) => {
  res.send("Hello from TS + Express");
});

// Expense Routes
app.use("/api/expenses", expenseRoutes);

// Auth Routes
app.use("/api/auth", authRoutes);

// Profile Route
app.use("/api/profile", profileRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// Avatar
app.use("/uploads", express.static("uploads"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot Find ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(
    `📋 Port loaded from: ${process.env.PORT ? ".env file" : "default (8000)"}`,
  );
  console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// MongoDB Installation Guide
// https://www.youtube.com/watch?v=gB6WLkSrtJk
