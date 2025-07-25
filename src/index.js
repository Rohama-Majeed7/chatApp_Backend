import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app,server} from "./lib/socket.js";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT;
// const __dirname = path.resolve();
app.get("/", (req, res) => {
  res.send("Server is running");  
});
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://chat-app-frontend-omega-two.vercel.app",
    credentials: true,
  })
);
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running on PORT:", PORT);
  });
});