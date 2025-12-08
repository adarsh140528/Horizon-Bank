import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  otp: String,
  type: String, // login, transfer, beneficiary
  expiresAt: Date
}, { timestamps: true });

export default mongoose.model("Otp", otpSchema);
