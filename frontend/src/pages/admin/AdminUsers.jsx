import { useEffect, useState } from "react";
import {
  getAllUsers,
  freezeUserAPI,
  unfreezeUserAPI,
  deleteUserAPI
} from "../../services/adminApi.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchUsers = async () => {
    const res = await getAllUsers(search, page);
    setUsers(res.data.users || []);
    setPages(res.data.pages || 1);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  return (
    <div className="p-6 min-h-screen bg-[#0b0f19] text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">
        User Management
      </h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-3 rounded-lg bg-[#111827] border border-cyan-700 text-white placeholder-gray-400 
                   shadow-md focus:outline-none focus:border-cyan-400 mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-indigo-700 bg-[#111827] shadow-lg">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-[#1f273a] text-cyan-300 border-b border-gray-700">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Account No</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-700 hover:bg-[#1b2233] transition"
              >
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.accountNumber}</td>
                <td className="p-4">₹{user.balance}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "active"
                        ? "bg-green-800 text-green-300"
                        : "bg-red-800 text-red-300"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-4 space-x-2">
                  {user.status === "active" ? (
                    <button
                      onClick={() => freezeUserAPI(user._id).then(fetchUsers)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded shadow"
                    >
                      Freeze
                    </button>
                  ) : (
                    <button
                      onClick={() => unfreezeUserAPI(user._id).then(fetchUsers)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded shadow"
                    >
                      Unfreeze
                    </button>
                  )}

                  <button
                    onClick={() => deleteUserAPI(user._id).then(fetchUsers)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-lg transition ${
              page === i + 1
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/50"
                : "bg-[#1f273a] text-gray-300 border border-gray-700 hover:bg-[#2b3448]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
