import React, { useState } from "react";
import OtpModal from "../components/OtpModal";
import { sendOtp, verifyOtp, addBeneficiary } from "../services/api";

const AddBeneficiary = () => {
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOtp = async () => {
    if (!name || !accountNumber) {
      alert("Enter all details");
      return;
    }

    await sendOtp({
      userId,
      method: "email", // or "sms"
      type: "beneficiary",
    });

    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (otpCode) => {
    const res = await verifyOtp({
      userId,
      otp: otpCode,
      type: "beneficiary",
    });

    if (res.success) {
      setOtpVerified(true);
      setShowOtpModal(false);
      submitBeneficiary();
    } else {
      alert("Wrong OTP");
    }
  };

  const submitBeneficiary = async () => {
    const res = await addBeneficiary({
      name,
      beneficiaryAccount: accountNumber,
      otpVerified: true,
    });

    alert(res.message);
    setName("");
    setAccountNumber("");
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Add Beneficiary
        </h2>

        <label className="block mb-2 font-medium text-gray-600">Name</label>
        <input
          type="text"
          className="w-full p-3 rounded-lg border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Beneficiary Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2 font-medium text-gray-600">
          Account Number
        </label>
        <input
          type="text"
          className="w-full p-3 rounded-lg border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        <button
          onClick={handleSendOtp}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
        >
          Add Beneficiary (Verify OTP)
        </button>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          onClose={() => setShowOtpModal(false)}
          onVerify={handleVerifyOtp}
        />
      )}
    </div>
  );
};

export default AddBeneficiary;
