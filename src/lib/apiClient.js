// src/lib/apiClient.js
import axios from "axios";

// Usa variável do Netlify/Vite (definida no painel de env)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // permite cookies se backend precisar
});

export default apiClient;

