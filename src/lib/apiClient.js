// src/lib/apiClient.js
import axios from "axios";

// Em produção, ISSO precisa estar definido no Netlify:
// VITE_API_BASE_URL = https://seu-backend.onrender.com
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

// Log de diagnóstico útil (só no dev console do navegador)
if (typeof window !== "undefined") {
  console.log("[apiClient] baseURL =", baseURL);
}

const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

export default apiClient;
