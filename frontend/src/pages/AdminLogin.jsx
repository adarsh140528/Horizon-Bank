import { useState } from "react";
import { login } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login({ email, password });
      const user = res.data;

      if (user.role !== "admin") {
        setError("Access denied. You are not an admin.");
        return;
      }

      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br 
                    from-[#0b0f19] via-[#111827] to-[#1f2937] px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 
                      shadow-2xl rounded-3xl p-10 text-white">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 bg-purple-700/30 p-4 rounded-2xl w-fit">
            <ShieldCheck size={45} className="text-purple-400" />
          </div>

          <h1 className="text-3xl font-extrabold text-purple-300">Admin Access</h1>
          <p className="text-gray-300 text-sm mt-1">
            Only authorized administrators may proceed
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-400 bg-red-900/40 border border-red-700 
                        text-center rounded-xl py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleAdminLogin} className="space-y-6">

          {/* EMAIL INPUT */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-3.5 rounded-xl bg-white/10 border border-white/20 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-purple-500"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-4 text-gray-400" />
              <input
                type="password"
                className="w-full p-3.5 pl-10 rounded-xl bg-white/10 border border-white/20 
                           placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-purple-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white 
                      py-3.5 rounded-xl text-lg font-semibold shadow-lg hover:opacity-90 
                      transition-all"
          >
            Login as Admin
          </button>
        </form>

      </div>
    </div>
  );
}
