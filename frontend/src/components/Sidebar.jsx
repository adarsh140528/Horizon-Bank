// frontend/src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSend,
  FiUser,
  FiPlusCircle,
  FiList,
  FiLogOut,
  FiBell,
} from "react-icons/fi";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Active link UI
  const active = (path) =>
    location.pathname === path
      ? "bg-white text-blue-700 shadow-sm border-l-4 border-blue-600 font-semibold"
      : "text-gray-700 hover:bg-blue-100 hover:text-blue-700";

  // Load theme + notifications
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications([]);
      }
    }
  }, []);

  // -------------------------------------
  // LOGOUT FUNCTION — FIXED FOR BIOMETRICS
  // -------------------------------------
  const handleLogout = () => {
    const biometric = localStorage.getItem("biometric");
    const userId = localStorage.getItem("userId");

    // Clear ONLY session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Keep biometric login working
    if (biometric === "true" && userId) {
      localStorage.setItem("biometric", "true");
      localStorage.setItem("userId", userId);
    }

    navigate("/login");
  };

  return (
    <>
      <div
        className="w-64 h-screen fixed left-0 top-0 p-6 flex flex-col"
        style={{
          backgroundColor: "#E8F1FF",
          borderRight: "1px solid #D0E2FF",
        }}
      >
        {/* Logo and icons */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">
            HORIZON
          </h1>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="p-2 rounded-full hover:bg-blue-100 text-blue-700 transition"
              title="Notifications"
            >
              <FiBell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="flex flex-col gap-2">
          <Link to="/dashboard" className={`p-3 rounded-lg flex items-center gap-3 ${active("/dashboard")}`}>
            <FiHome size={18} /> Dashboard
          </Link>

          <Link to="/add-money" className={`p-3 rounded-lg flex items-center gap-3 ${active("/add-money")}`}>
            <FiPlusCircle size={18} /> Add Money
          </Link>

          <Link to="/transfer" className={`p-3 rounded-lg flex items-center gap-3 ${active("/transfer")}`}>
            <FiSend size={18} /> Transfer
          </Link>

          <Link to="/transactions" className={`p-3 rounded-lg flex items-center gap-3 ${active("/transactions")}`}>
            <FiList size={18} /> Transactions
          </Link>

          <Link to="/profile" className={`p-3 rounded-lg flex items-center gap-3 ${active("/profile")}`}>
            <FiUser size={18} /> Profile
          </Link>
        </div>

        {/* LOGOUT BUTTON (Updated) */}
        <button
          onClick={handleLogout}
          className="mt-auto w-full flex items-center gap-3 p-3 rounded-lg text-red-600 
                     hover:bg-red-100 hover:text-red-700 transition font-semibold"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>

      {/* Notification Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="flex-1 bg-black/40" onClick={() => setShowNotifications(false)} />

          <div className="w-80 bg-white h-full shadow-2xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-800">
                Close
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications yet.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto">
                {notifications
                  .slice()
                  .reverse()
                  .map((n, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-gray-50 text-sm">
                      <p className="font-semibold">{n.title || "Notification"}</p>
                      {n.message && <p className="text-gray-600">{n.message}</p>}
                      {n.time && <p className="text-gray-400 text-[11px] mt-1">{n.time}</p>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
