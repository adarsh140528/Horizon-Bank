import dotenv from "dotenv";
dotenv.config();     // <--- MUST BE FIRST BEFORE ANY IMPORTS

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import webauthnRoutes from "./routes/webauthnRoutes.js";

console.log("==== ENV CHECK ====");
console.log("BREVO_EMAIL:", process.env.BREVO_EMAIL);
console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY?.slice(0, 8));
console.log("====================");


const app = express();

// Middleware
app.use(cors({
    origin: [
      "http://localhost:5173",
      "horizon-bank-lyrshezxz-adarshhs-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));
  
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);         // ✅ OTP routes
app.use("/api/account", accountRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webauthn", webauthnRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("Loading WebAuthn route...");
console.log("WebAuthn route ready!");
