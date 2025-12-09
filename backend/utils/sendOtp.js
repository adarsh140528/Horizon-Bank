// backend/utils/sendOtp.js
import axios from "axios";

// Send OTP email using Resend
export const sendEmailOTP = async (to, otp) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";

    if (!apiKey) {
      console.error("❌ RESEND_API_KEY missing");
      throw new Error("Resend API missing");
    }

    await axios.post(
      "https://api.resend.com/emails",
      {
        from,
        to,
        subject: "Your OTP Code",
        html: `
          <h2>Your OTP Code</h2>
          <p>Your Horizon Bank OTP is:</p>
          <h1 style="font-size: 32px; color: #2563eb;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Resend Email sent to:", to);
  } catch (error) {
    console.error("❌ Resend Email Error:", error.response?.data || error);
    throw new Error("OTP email sending failed");
  }
};

// Keep your SMS OTP handler as-is
export const sendSmsOTP = async (phone, otp) => {
  console.log(`(SMS MOCK) OTP ${otp} sent to phone ${phone}`);
};
