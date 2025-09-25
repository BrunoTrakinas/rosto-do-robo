// src/lib/apiClient.js
import axios from "axios";

// Em desenvolvimento, use http://localhost:3002
// Em produção, defina VITE_API_URL no .env do front (ex.: https://seu-backend.com)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

export default apiClient;
