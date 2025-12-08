import { useEffect, useState } from "react";
import { getChartStats } from "../../services/adminApi.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalytics() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    getChartStats().then((res) => setChartData(res.data || []));
  }, []);

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Analytics</h1>

      <div className="bg-[#111827] p-6 rounded-xl border border-purple-600 shadow-xl">
        <h2 className="text-xl mb-4 text-purple-300">Transactions Over Last 7 Days</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="_id" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
