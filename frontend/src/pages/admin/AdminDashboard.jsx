import { useEffect, useState } from "react";
import {
  getAdminStats,
  getAllTransactions,
  getChartStats,
  getSuspicious,
  getAllUsers
} from "../../services/adminApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4f46e5", "#06b6d4"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [suspicious, setSuspicious] = useState([]);

  useEffect(() => {
    // Load all stats
    getAdminStats().then((res) => setStats(res.data));

    // Load Users
    getAllUsers().then((res) => {
      console.log("Users API:", res.data);
      setUsers(res.data.users || []);       // FIXED
    });

    // Load Transactions
    getAllTransactions().then((res) => {
      console.log("Transactions API:", res.data);
      setTransactions(res.data.transactions || res.data || []);  // FIXED
    });

    // Load chart stats
    getChartStats().then((res) => setChartData(res.data || []));

    // Load suspicious records
    getSuspicious().then((res) => setSuspicious(res.data || []));
  }, []);

  if (!stats) return <p className="text-white p-10">Loading dashboard...</p>;

  return (
    <div className="p-6 text-white min-h-screen bg-[#0b0f19]">

      <h1 className="text-3xl font-bold mb-6 text-cyan-400 drop-shadow-lg">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="p-6 bg-[#111827] rounded-xl shadow-lg border border-cyan-700 hover:border-cyan-400 transition-all hover:shadow-cyan-700/40"
          >
            <h2 className="text-lg text-gray-300 capitalize">{key}</h2>
            <p className="text-3xl font-bold mt-2 text-cyan-400">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-10">

        {/* Line Chart */}
        <div className="bg-[#111827] p-6 rounded-xl border border-indigo-600 shadow-xl">
          <h2 className="text-xl mb-4 text-indigo-400">Transactions – Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="_id" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#111827] p-6 rounded-xl border border-cyan-600 shadow-xl">
          <h2 className="text-xl mb-4 text-cyan-400">Active vs Inactive Users</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active", value: stats.activeUsers },
                  { name: "Inactive", value: stats.totalUsers - stats.activeUsers },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest Users */}
      <div className="mt-10 bg-[#111827] p-6 rounded-xl border border-purple-600 shadow-xl">
        <h2 className="text-2xl mb-4 text-purple-400">Latest Users</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="text-purple-300 border-b border-gray-700">
              <th>Name</th>
              <th>Email</th>
              <th>Account No</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {users.slice(0, 5).map((u) => (
              <tr key={u._id} className="border-b border-gray-800">
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.accountNumber}</td>
                <td className="capitalize">{u.status || "active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Latest Transactions */}
      <div className="mt-10 bg-[#111827] p-6 rounded-xl border border-blue-600 shadow-xl">
        <h2 className="text-2xl mb-4 text-blue-400">Latest Transactions</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="text-blue-300 border-b border-gray-700">
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
        {transactions.slice(0, 5).map((t) => (
          <tr key={t._id} className="border-b border-gray-800">
            <td className="p-2 text-cyan-300">
              {t.from?.accountNumber || "—"}
            </td>
            <td className="p-2 text-purple-300">
              {t.to?.accountNumber || "—"}
            </td>
            <td className="p-2 text-green-400">₹{t.amount}</td>
            <td className="p-2 capitalize">{t.type}</td>
          </tr>
        ))}
      </tbody>
     
        </table>
      </div>

      {/* Suspicious Activity */}
      <div className="mt-10 bg-[#150f1d] p-6 rounded-xl border border-red-600 shadow-xl">
        <h2 className="text-2xl mb-4 text-red-400">Suspicious Activity</h2>

        {suspicious.length === 0 ? (
          <p className="text-gray-400">No suspicious transactions detected.</p>
        ) : (
          suspicious.map((s) => (
            <p key={s._id} className="text-red-300">
              ⚠ {s.amount} from {s.senderAccount || "Unknown"} → {s.receiverAccount || "Unknown"}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
