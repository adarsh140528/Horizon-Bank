import React, { useState, useEffect, useRef } from "react";

const OtpModal = ({ onClose, onVerify }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Auto-focus OTP input on open
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleVerify = () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    onVerify(otp);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 animate-fadeIn">
        <h2 className="text-xl font-bold text-blue-700 mb-3 text-center">
          Enter OTP
        </h2>

        <input
          ref={inputRef}
          type="text"
          maxLength="6"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`w-full p-3 border rounded-xl mb-2 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="______"
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Allow only digits
            setOtp(value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyPress}
        />

        {error && (
          <p className="text-red-500 text-center text-sm mb-3">{error}</p>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleVerify}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Verify
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default OtpModal;
