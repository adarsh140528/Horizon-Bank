// frontend/src/pages/Transactions.jsx
import { useEffect, useState } from "react";
import { getMyTransactions } from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getMyTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.log("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString();

  const getDisplayInfo = (t) => {
    const fromId = t.from?._id || t.from;
    const toId = t.to?._id || t.to;

    const isSelf = fromId === toId && fromId === userId;
    const isSender = fromId === userId && !isSelf;
    const isReceiver = toId === userId && !isSelf;

    let label = "TRANSACTION";
    let color = "text-blue-600";
    let sign = "";

    if (isSelf) {
      label = "MONEY ADDED";
      color = "text-green-600";
      sign = "+";
    } else if (isReceiver) {
      label = "CREDIT";
      color = "text-green-600";
      sign = "+";
    } else if (isSender) {
      label = "DEBIT";
      color = "text-red-600";
      sign = "-";
    }

    return { label, sign, color };
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F6FF] flex">

      {/* MAIN CONTENT (Sidebar occupies left) */}
      <div className="ml-64 w-full p-10">

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Transaction History
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              View all your credits, debits, and wallet activity.
            </p>
          </div>

          {/* 🔵 Back Button — top right */}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-semibold"
          >
            ← Back To Dashboard
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white w-full max-w-4xl p-10 rounded-3xl shadow-xl border border-gray-200">

          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-700">All Transactions</h2>
            <div className="h-1 w-28 bg-blue-500 rounded-full mt-2"></div>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-500 text-lg">Loading...</p>
          )}

          {/* Transaction List */}
          {!loading && transactions.length > 0 && (
            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">

              {transactions.map((t) => {
                const { label, sign, color } = getDisplayInfo(t);
                return (
                  <div
                    key={t._id}
                    className="p-5 bg-blue-50/30 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    {/* TOP: Label and Amount */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">{label}</h3>

                      <span className={`text-xl font-bold ${color}`}>
                        {sign}₹ {t.amount}
                      </span>
                    </div>

                    {/* Middle: From / To */}
                    <div className="mt-3 space-y-1">
                      <p className="text-gray-700 text-sm">
                        <strong>From:</strong>{" "}
                        {t.from?.accountNumber
                          ? `${t.from.accountNumber} — ${t.from?.name}`
                          : "N/A"}
                      </p>

                      <p className="text-gray-700 text-sm">
                        <strong>To:</strong>{" "}
                        {t.to?.accountNumber
                          ? `${t.to.accountNumber} — ${t.to?.name}`
                          : "N/A"}
                      </p>

                      <p className="text-gray-400 text-xs">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Transactions */}
          {!loading && transactions.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-10">
              No transactions found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
