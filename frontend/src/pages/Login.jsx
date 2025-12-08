// frontend/src/pages/Login.jsx
import { useState } from "react";
import { login } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { startAuthentication } from "@simplewebauthn/browser";
import webauthnApi from "../services/webauthnApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // NORMAL LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login({ email, password });
      const user = res.data;

      // Save session
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  // ==========================================
  // BIOMETRIC LOGIN (PASSKEY LOGIN)
  // ALWAYS VISIBLE BUTTON
  // ==========================================
  const handleBiometricLogin = async () => {
    setBioLoading(true);
    setError("");

    try {
      if (!window.PublicKeyCredential) {
        setError("❌ Your browser does not support Passkeys.");
        setBioLoading(false);
        return;
      }

      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("⚠ Login once normally and enable biometrics in Profile.");
        setBioLoading(false);
        return;
      }

      // 1️⃣ Fetch login options from backend
      const { data: options } = await webauthnApi.post("/login/options", {
        userId,
      });

      console.log("📌 WebAuthn Login Options:", options);

      // ---- SAFETY: Ensure required fields exist ----
      if (!options.challenge) {
        setError("Invalid WebAuthn challenge received from server.");
        setBioLoading(false);
        return;
      }

      // 2️⃣ Browser authentication (FaceID / Fingerprint)
      const authResult = await startAuthentication(options);

      // 3️⃣ Send result to backend
      const verifyRes = await webauthnApi.post("/login/verify", {
        userId,
        credential: authResult,
      });

      const user = verifyRes.data.user;

      // 4️⃣ Save user session
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Biometric login error:", err);
      setError("Biometric login failed.");
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FF] dark:bg-slate-900 flex items-center justify-center px-4 transition">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl rounded-3xl p-10 border border-gray-200 dark:border-slate-700">

        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 text-center">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-1 mb-6">
          Login to continue to Horizon
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-red-600 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-center rounded-xl py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        {/* EMAIL + PASSWORD LOGIN */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-2 p-3.5 border rounded-xl bg-white dark:bg-slate-700"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full mt-2 p-3.5 border rounded-xl bg-white dark:bg-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-md"
          >
            Login
          </button>
        </form>

        {/* 🔐 ALWAYS SHOW BIOMETRIC LOGIN */}
        <button
          onClick={handleBiometricLogin}
          disabled={bioLoading}
          className="w-full mt-4 bg-green-600 text-white py-3.5 rounded-xl 
                     text-lg font-semibold hover:bg-green-700 shadow-md 
                     disabled:bg-green-400"
        >
          {bioLoading ? "Authenticating..." : "🔐 Login with FaceID / Fingerprint"}
        </button>
        

        <p className="mt-5 text-center text-sm">
          New here?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Create account
          </Link>
        </p>
        
<p className="mt-2 text-center text-sm">
  <Link
    to="/admin-login"
    className="text-purple-600 font-semibold hover:underline"
  >
     Admin Login
  </Link>
</p>
      </div>
    </div>
  );
}
