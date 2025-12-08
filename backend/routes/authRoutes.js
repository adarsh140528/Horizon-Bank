// backend/routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../models/User.js";

const router = express.Router();

// USER AUTH ROUTES
router.post("/signup", signup);
router.post("/login", login);

// TEMP: CREATE ADMIN (delete in production)
router.get("/create-admin", async (req, res) => {
  try {
    const adminData = {
      name: "Admin",
      email: "admin@bank.com",
      password: "admin123",
      role: "admin",
      accountNumber: "ADMIN001",
      balance: 0,
    };

    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Use .save() to ensure password hashing works
    const admin = new User(adminData);
    await admin.save();

    res.json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
