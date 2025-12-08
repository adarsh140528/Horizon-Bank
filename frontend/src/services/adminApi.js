import axios from "axios";

const API = axios.create({
  baseURL: "https://horizon-bank.onrender.com/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Admin Stats
export const getAdminStats = () => API.get("/stats");

// User List
export const getAllUsers = (search = "", page = 1) =>
  API.get(`/users?search=${search}&page=${page}`);

// ✔ Correct Freeze API
export const freezeUserAPI = (id) =>
  API.put(`/users/freeze/${id}`);

// ✔ Correct Unfreeze API
export const unfreezeUserAPI = (id) =>
  API.put(`/users/unfreeze/${id}`);

// ✔ Correct Delete API
export const deleteUserAPI = (id) =>
  API.delete(`/users/${id}`);

export const getChartStats = () => API.get("/charts");
export const getSuspicious = () => API.get("/suspicious");
export const getAllTransactions = () => API.get("/transactions");

export default API;
