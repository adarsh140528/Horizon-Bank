// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { getBalance } from "../services/api";
import { startRegistration } from "@simplewebauthn/browser";
import Sidebar from "../components/Sidebar";
import webauthnApi from "../services/webauthnApi";

export default function Profile() {
  const [user, setUser] = useState({});
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Load user info + biometric flag
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);

    const bioFlag = localStorage.getItem("biometric") === "true";
    setBiometricEnabled(bioFlag);
  }, []);

  // Load balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const res = await getBalance();
        setBalance(res.data.balance);
      } catch (err) {
        console.log("Balance Error:", err);
      }
    };

    loadBalance();
  }, []);

  // ======================================================
  //         ENABLE BIOMETRICS (PASSKEY / FACEID)
  // ======================================================
  const enableBiometrics = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("User ID not found. Please log out and log in again.");
        return;
      }

      // 1️⃣ Ask backend for registration options
      const { data: options } = await webauthnApi.post("/register", {
        userId,
      });

      console.log("📌 BACKEND OPTIONS:", options);

      // 2️⃣ Ask browser to create passkey
      const credential = await startRegistration(options);

      // 3️⃣ Verify passkey with backend
      const verifyRes = await webauthnApi.post("/verify-register", {
        userId,
        credential,
      });

      if (!verifyRes.data?.success) {
        alert("⚠ Backend verification failed.");
        return;
      }

      // SAVE BIOMETRIC FLAG
      localStorage.setItem("biometric", "true");
      localStorage.setItem("userId", userId);   // ⭐ REQUIRED FIX
    
      setBiometricEnabled(true);
      alert("🎉 Biometrics Enabled Successfully!");
      
    } catch (err) {
      console.error("❌ Biometric error:", err);
      alert("❌ Failed to enable biometrics.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  return (
    <div className="flex min-h-screen bg-[#F3F6FF] dark:bg-slate-900 transition">
      <Sidebar />

      <div className="ml-64 w-full p-10 text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-extrabold mb-4">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your personal details and biometric security.
        </p>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 max-w-2xl">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6">
            User Information
          </h2>

          <div className="space-y-3 text-lg">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account Number:</strong> {user.accountNumber}</p>
            <p><strong>Current Balance:</strong> ₹ {balance}</p>
          </div>

          {/* BIOMETRICS */}
          <div className="mt-10">
            <h3 className="font-semibold text-lg mb-2">Biometric Login</h3>

            {biometricEnabled ? (
              <p className="text-green-600 dark:text-green-400 font-semibold">
                ✓ Biometrics Enabled (FaceID / Fingerprint / Passkey)
              </p>
            ) : (
              <button
                disabled={loading}
                onClick={enableBiometrics}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md 
                           hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? "Enabling..." : "Enable FaceID / Fingerprint"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
