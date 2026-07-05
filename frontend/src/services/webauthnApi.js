import axios from "axios";
//new
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/webauthn` 
  : "https://horizon-bank.onrender.com/api/webauthn";

export default axios.create({
  baseURL,
});
