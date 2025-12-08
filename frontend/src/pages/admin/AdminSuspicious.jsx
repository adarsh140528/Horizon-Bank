import { useEffect, useState } from "react";
import { getSuspicious } from "../../services/adminApi.js";

export default function AdminSuspicious() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getSuspicious().then((res) => {
      console.log("Suspicious data:", res.data); // Debugging
      setList(res.data || []);
    });
  }, []);

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6 text-red-400">Suspicious Activity</h1>

      <div className="bg-[#111827] p-6 rounded-xl border border-red-600 shadow-xl">
        {list.length === 0 ? (
          <p className="text-gray-400">No suspicious activity found.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((s) => (
              <li
                key={s._id}
                className="p-5 rounded-xl bg-red-900/30 border border-red-700 shadow"
              >
                <p className="text-lg">
                  ⚠ High-value transfer:
                  <span className="text-red-300 font-semibold"> ₹{s.amount}</span>
                </p>

                <div className="mt-2 text-gray-300">
                  <p>
                    <span className="font-semibold text-red-400">From:</span>{" "}
                    {s.senderAccount || "Unknown"}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-red-400">To:</span>{" "}
                    {s.receiverAccount || "Unknown"}
                  </p>
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
