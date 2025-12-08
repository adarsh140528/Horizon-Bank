// backend/utils/sendOtp.js

import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import axios from "axios";

// DEBUG ENV CHECK
console.log("DEBUG SMTP LOGIN =", process.env.SMTP_USER);
console.log("DEBUG SMTP PASS =", process.env.SMTP_PASS ? "Loaded ✔" : "Missing ❌");
console.log("DEBUG FROM =", process.env.SMTP_FROM);

// ---------------- EMAIL OTP (Gmail SMTP) ----------------
export const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER, // your Gmail
        pass: process.env.SMTP_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM, // your Gmail
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    console.log("✅ Email OTP sent to", email, "OTP:", otp);
    return true;
  } catch (err) {
    console.error("❌ Email OTP error:", err.message);
    return false;
  }
};

// ---------------- SMS OTP (Fast2SMS) ----------------
export const sendSmsOTP = async (phone, otp) => {
  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "v3",
        sender_id: "TXTIND",
        message: `Your OTP is ${otp}`,
        language: "english",
        flash: 0,
        numbers: phone,
      },
      {
        headers: { authorization: process.env.FAST2SMS_API_KEY },
      }
    );

    console.log("✅ SMS OTP sent to", phone);
    return true;
  } catch (err) {
    console.error("❌ SMS OTP error:", err.message);
    return false;
  }
};
