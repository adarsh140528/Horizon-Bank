// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { getBalance, getMyTransactions } from "../services/api.js";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";
import VirtualCard from "../components/VirtualCard.jsx";
import BalanceChart from "../components/BalanceChart.jsx";
import { FiBell, FiMoon, FiSun, FiX } from "react-icons/fi";

export default function Dashboard() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  // 🌙 Dark mode state (saved in localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = async () => {
    try {
      const balRes = await getBalance();
      const txRes = await getMyTransactions();

      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
    } catch (err) {
      console.log("Dashboard Load Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Format notifications from recent transactions
  const recentNotifications = transactions.slice(0, 5).map((t) => {
    let title = "";
    let desc = "";

    if (t.type === "credit") {
      title = "Money Received";
      desc = `₹${t.amount} credited to your account.`;
    } else if (t.type === "debit" || t.type === "transfer") {
      title = "Money Sent";
      desc = `₹${t.amount} sent to ${t.to?.accountNumber || "beneficiary"}.`;
    } else {
      title = "Transaction";
      desc = `₹${t.amount} processed.`;
    }

    return {
      id: t._id,
      title,
      desc,
      time: new Date(t.createdAt).toLocaleString(),
    };
  });

  return (
    <div className={darkMode ? "dark w-full" : "w-full"}>
      <div className="min-h-screen bg-[#F3F6FF] flex dark:bg-slate-900 transition-colors">

        {/* Sidebar Navigation */}
        <Sidebar onLogout={logout} />

        {/* Main Content */}
        <div className="ml-64 p-10 w-full text-gray-900 dark:text-gray-100 transition-colors">

          {/* Header Row: Welcome + Controls */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Here is a quick overview of your finances.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Button */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow hover:shadow-md transition"
              >
                <FiBell className="text-gray-700 dark:text-gray-200" size={18} />
                {transactions.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Dark Mode Toggle */}
              
            </div>
          </div>

          {/* Top Row: Virtual Card + Balance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            {/* Virtual Card Component */}
            <VirtualCard name={user.name} last4={"8423"} />

            {/* Chart Component */}
            <BalanceChart
              dataPoints={[2000, 2500, 2200, 3000, 3500, 3200, balance]}
            />
          </div>

          {/* Balance Summary + Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

            {/* Balance Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 transition-colors">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Current Balance</p>
              <h1 className="text-4xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                ₹ {balance}
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Updated just now
              </p>
            </div>

            {/* Total Transactions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 transition-colors">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Transactions
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {transactions.length}
              </h2>
            </div>

            {/* Highest Transfer */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 transition-colors">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Highest Transfer
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                ₹ {Math.max(...transactions.map((t) => t.amount), 0)}
              </h2>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Recent Transactions
              </h3>
              <button
                onClick={() => navigate("/transactions")}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View all
              </button>
            </div>

            {transactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No recent transactions.
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {t.type.toUpperCase()}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p
                      className={`text-lg font-semibold ${
                        t.type === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹ {t.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🔔 Notifications Drawer */}
        {showNotifications && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* backdrop */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setShowNotifications(false)}
            />
            {/* panel */}
            <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 shadow-2xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <FiX className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {recentNotifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No recent notifications.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {n.desc}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {n.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
