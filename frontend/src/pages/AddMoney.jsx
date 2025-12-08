// frontend/src/pages/AddMoney.jsx
import { useState } from "react";
import OtpModal from "../components/OtpModal";
import OtpSentAnimation from "../components/OtpSentAnimation";
import { addMoney, sendOtp, verifyOtp } from "../services/api";
import { pushNotification } from "../utils/notifications";

export default function AddMoney() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const userId = localStorage.getItem("userId");

  // STEP 1 — Send OTP
  const handleAddMoney = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await sendOtp({
        userId,
        method: "email",
        type: "addMoney",
      });

      // Show animation, then OTP modal
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

  // STEP 2 — Verify OTP + Add Money
  const handleVerifyOtp = async (otp) => {
    try {
      const verifyRes = await verifyOtp({
        userId,
        otp,
        type: "addMoney",
      });

      if (!verifyRes.data.success) {
        setError("Incorrect or expired OTP");
        return;
      }

      const res = await addMoney({
        amount: Number(amount),
        otpVerified: true,
      });

      setMessage(res.data.message || "Money added successfully");
      setAmount("");
      setShowOtpModal(false);

      // 🔔 Push Notification to panel
      pushNotification({
        title: "Money Added",
        message: `₹${amount} has been credited to your account.`,
      });

    } catch (err) {
      setError(err.response?.data?.message || "Unable to add money");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F3F6FF] dark:bg-slate-900 transition">

      {/* PAGE CONTENT (shift with sidebar) */}
      <div className="ml-64 w-full p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Add Money
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Easily load money into your Horizon wallet.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 
                        w-full max-w-2xl p-10 rounded-3xl shadow-xl 
                        border border-gray-200">

          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              Enter Amount
            </h2>
            <div className="h-1 w-20 bg-blue-500 dark:bg-blue-400 mt-2 rounded-full"></div>
          </div>

          {/* Alerts */}
          {message && (
            <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 
                            text-green-700 dark:text-green-300 p-4 rounded-xl mb-5">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 
                            text-red-700 dark:text-red-300 p-4 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAddMoney} className="space-y-6">

            {/* Amount Field */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-medium text-sm mb-1">
                Amount
              </label>

              <input
                type="number"
                placeholder="₹ 0.00"
                className="w-full p-4 border rounded-xl text-lg shadow-sm 
                           bg-white dark:bg-slate-700 dark:text-white 
                           focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform
              ${loading
                ? "bg-blue-400 dark:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {loading ? "Sending OTP..." : "Add Money (Email OTP)"}
            </button>
          </form>

          {/* Info */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Your wallet top-up is protected with OTP verification.
          </p>
        </div>
      </div>

      {/* OTP Animation */}
      {showAnimation && (
        <OtpSentAnimation onFinished={() => setShowAnimation(false)} />
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          onClose={() => setShowOtpModal(false)}
          onVerify={handleVerifyOtp}
        />
      )}
    </div>
  );
}
