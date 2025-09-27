// src/lib/apiClient.js
import axios from "axios";

// Mostre no console qual backend está sendo usado
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";
console.log("[apiClient] Base URL:", baseURL);

const apiClient = axios.create({
  baseURL,
  // Se você NÃO usa cookies/sessão entre domínios, deixe false:
  withCredentials: false
});

export default apiClient;
