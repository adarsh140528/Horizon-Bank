import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Users, Receipt, PieChart, AlertTriangle, LogOut } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const menu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/admin/users", label: "Users", icon: <Users size={20} /> },
    { path: "/admin/transactions", label: "Transactions", icon: <Receipt size={20} /> },
    { path: "/admin/analytics", label: "Analytics", icon: <PieChart size={20} /> },
    { path: "/admin/suspicious", label: "Suspicious", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white">

      {/* Sidebar */}
      <div className="w-64 bg-[#111827]/60 backdrop-blur-xl shadow-xl p-6 border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-8 text-cyan-400">Admin Panel</h2>

        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  location.pathname === item.path
                    ? "bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-lg"
                    : "hover:bg-gray-700/40"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 pt-5 border-t border-gray-700">
          <Link
            to="/login"
            onClick={() => localStorage.clear()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/40 hover:bg-red-700/50 transition"
          >
            <LogOut size={20} />
            Logout
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
