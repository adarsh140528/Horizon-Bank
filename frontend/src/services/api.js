// frontend/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// AUTH
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

// OTP
export const sendOtp = (data) => API.post("/otp/send", data);
export const verifyOtp = (data) => API.post("/otp/verify", data);

// ACCOUNT
export const getBalance = () => API.get("/account/balance");
export const addMoney = (data) => API.post("/account/add-money", data);
export const transferMoney = (data) => API.post("/account/transfer", data);

// BENEFICIARY
export const addBeneficiary = (data) =>
  API.post("/account/beneficiary/add", data);
export const removeBeneficiary = (data) =>
  API.post("/account/beneficiary/remove", data);

// TRANSACTIONS
export const getMyTransactions = () => API.get("/transaction/my");
export const getAllTransactions = () => API.get("/transaction/all");

export default API;
