import { useEffect, useState } from "react";
import { getAllTransactions } from "../../services/adminApi.js";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllTransactions();
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Error loading admin transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#0b0f19] text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">
        All Transactions
      </h1>

      {transactions.length === 0 ? (
        <p className="text-gray-400">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-indigo-600 bg-[#111827] shadow-lg">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-[#1f273a] border-b border-gray-700 text-blue-300">
              <tr>
                <th className="p-4">From (Account)</th>
                <th className="p-4">To (Account)</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-gray-800 hover:bg-[#1b2233]"
                >
                  <td className="p-4">
                    <div className="font-semibold text-cyan-300">
                      {t.from?.accountNumber || "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t.from?.name || ""}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-purple-300">
                      {t.to?.accountNumber || "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t.to?.name || ""}
                    </div>
                  </td>

                  <td className="p-4 capitalize">
                    {t.type}
                  </td>

                  <td className="p-4 text-green-400 font-bold">
                    ₹{t.amount}
                  </td>

                  <td className="p-4 text-gray-400 text-xs">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
