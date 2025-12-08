import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

export default function BalanceChart({ dataPoints }) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const data = {
    labels,
    datasets: [
      {
        label: "Balance Trend",
        data: dataPoints,
        borderColor: "#1A73E8",
        backgroundColor: "rgba(26, 115, 232, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-bold mb-4">Weekly Balance Trend</h3>
      <Line data={data} />
    </div>
  );
}
