import express from "express";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendEmailOTP, sendSmsOTP } from "../utils/sendOtp.js";

const router = express.Router();

// ---------- SEND OTP ----------
router.post("/send", async (req, res) => {
  try {
    const { userId, method, type } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove older OTPs for same user + type
    await Otp.deleteMany({ userId, type });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      userId,
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    if (method === "email") {
      await sendEmailOTP(user.email, otp);
    } else {
      await sendSmsOTP(user.phone, otp);
    }

    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- VERIFY OTP ----------
router.post("/verify", async (req, res) => {
  try {
    const { userId, otp, type } = req.body;

    console.log("\n========== OTP VERIFY DEBUG ==========");
    console.log("Incoming body:", req.body);

    const record = await Otp.findOne({ userId, type }).sort({ createdAt: -1 });

    console.log("DB Record Found:", record);

    if (!record) {
      console.log("❌ No OTP found for:", userId, type);
      return res.status(400).json({ message: "No OTP found" });
    }

    console.log("Comparing OTP:", otp, "with", record.otp);

    if (record.otp !== otp) {
      console.log("❌ OTP mismatch");
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    if (record.expiresAt < new Date()) {
      console.log("❌ OTP expired");
      return res.status(400).json({ message: "OTP expired" });
    }

    await Otp.deleteMany({ userId, type });

    console.log("✅ OTP VERIFIED SUCCESSFULLY");
    console.log("=======================================\n");

    return res.json({ success: true });

  } catch (err) {
    console.log("❌ VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// EXPORT ROUTER
export default router;