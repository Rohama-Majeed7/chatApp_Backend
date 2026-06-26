import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { app, server } from "./lib/socket.js";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "https://chat-app-frontend-omega-two.vercel.app",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

export default app;

if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running locally on PORT: ${PORT}`);
    });
  });
}