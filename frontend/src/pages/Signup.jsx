import { useState } from "react";
import { signup } from "../services/api.js";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signup({ name, email, password });

      // Backend returns user directly — no nested user object
      const user = res.data;

      // Save user
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FF] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-10 border border-gray-200">

        <h1 className="text-3xl font-extrabold text-blue-700 text-center">
          Horizon
        </h1>
        <p className="text-center text-gray-600 mt-1 mb-6">
          Create your secure banking account
        </p>

        {error && (
          <p className="text-red-600 bg-red-100 border border-red-200 text-center rounded-xl py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              className="w-full mt-2 p-3.5 border rounded-xl"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-2 p-3.5 border rounded-xl"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-2 p-3.5 border rounded-xl"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
