// frontend/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHome, FiSend, FiUser, FiPlusCircle, FiList } from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    setUser(stored);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const active = (path) =>
    location.pathname === path
      ? "text-white font-semibold"
      : "text-white/80 hover:text-white";

  return (
    <nav className="
      w-full fixed top-0 left-0 z-50
      bg-gradient-to-r from-blue-900 to-blue-700
      shadow-lg
      px-8 py-4
      flex justify-between items-center
    ">
      
      {/* Logo */}
      <h1 
        onClick={() => navigate("/dashboard")}
        className="text-2xl font-extrabold text-white cursor-pointer tracking-tight"
      >
        FinBankX
      </h1>

      {/* Links */}
      <div className="hidden md:flex gap-10 text-lg items-center">

        <Link to="/dashboard" className={`${active("/dashboard")} flex items-center gap-2`}>
          <FiHome /> Dashboard
        </Link>

        <Link to="/add-money" className={`${active("/add-money")} flex items-center gap-2`}>
          <FiPlusCircle /> Add Money
        </Link>

        <Link to="/transfer" className={`${active("/transfer")} flex items-center gap-2`}>
          <FiSend /> Transfer
        </Link>

        <Link to="/transactions" className={`${active("/transactions")} flex items-center gap-2`}>
          <FiList /> Transactions
        </Link>

        <Link to="/profile" className={`${active("/profile")} flex items-center gap-2`}>
          <FiUser /> Profile
        </Link>

      </div>

      {/* Logout */}
      {user && (
        <button
          onClick={logout}
          className="
            bg-white text-blue-700 
            px-5 py-2 rounded-lg 
            font-semibold shadow-md
            hover:bg-gray-100 transition
          "
        >
          Logout
        </button>
      )}
    </nav>
  );
}
