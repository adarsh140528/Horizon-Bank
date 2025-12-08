// frontend/src/pages/Transfer.jsx
import { useState } from "react";
import OtpModal from "../components/OtpModal";
import OtpSentAnimation from "../components/OtpSentAnimation";
import { sendOtp, verifyOtp, transferMoney } from "../services/api";

export default function Transfer() {
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const userId = localStorage.getItem("userId");

  // STEP 1 — Send OTP
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!receiverAccount || !amount) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await sendOtp({
        userId,
        method: "email",
        type: "transfer",
      });

      // Show animation first
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        setShowOtpModal(true);
      }, 1500);

    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Verify OTP → Transfer Money
  const verifyTransferOtp = async (otpCode) => {
    try {
      const res = await verifyOtp({
        userId,
        otp: otpCode,
        type: "transfer",
      });

      if (!res.data?.success) {
        setError("Invalid OTP");
        return;
      }

      const cleanAcc = receiverAccount.trim().toUpperCase();

      const transferRes = await transferMoney({
        receiverAccountNumber: cleanAcc,
        amount: Number(amount),
        otpVerified: true,
      });

      setMessage(transferRes.data.message || "Transfer successful");
      setReceiverAccount("");
      setAmount("");
      setShowOtpModal(false);

    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F6FF] flex">

      {/* PAGE CONTENT (shifted because of sidebar) */}
      <div className="ml-64 w-full p-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">Transfer Money</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Send money securely with OTP verification.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white w-full max-w-2xl p-10 rounded-3xl shadow-xl border border-gray-200">

          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-700">Transfer Details</h2>
            <div className="h-1 w-24 bg-blue-500 mt-2 rounded-full"></div>
          </div>

          {/* Alerts */}
          {message && (
            <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-5">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleTransfer} className="space-y-6">

            {/* Receiver Account */}
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">
                Receiver Account Number
              </label>
              <input
                type="text"
                placeholder="ACXXXXXX123"
                className="w-full p-4 border rounded-xl text-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={receiverAccount}
                onChange={(e) => setReceiverAccount(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">
                Amount
              </label>
              <input
                type="number"
                placeholder="₹ 0.00"
                className="w-full p-4 border rounded-xl text-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* SEND OTP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform 
              ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"}`}
            >
              {loading ? "Sending OTP..." : "Send OTP & Continue"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            OTP helps secure your transactions.
          </p>
        </div>
      </div>

      {/* OTP Animation */}
      {showAnimation && (
        <OtpSentAnimation onFinished={() => setShowAnimation(false)} />
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpModal
          onClose={() => setShowOtpModal(false)}
          onVerify={verifyTransferOtp}
        />
      )}
    </div>
  );
}
