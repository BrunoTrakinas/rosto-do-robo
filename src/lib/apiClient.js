// src/lib/apiClient.js
import axios from "axios";

/**
 * Base da API:
 * - Em produção (Netlify/Vercel), defina VITE_API_BASE_URL, exemplo:
 *   https://seu-backend.onrender.com
 * - Em desenvolvimento local, cai no http://localhost:3002
 */
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

/**
 * Normalização simples para evitar // duplos quando concatenar rotas.
 */
const baseURL = rawBaseURL.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000
});

// Interceptor opcional: loga erros com mais clareza no console
apiClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const info = {
      baseURL,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message
    };
    console.error("[apiClient] Falha na requisição:", info);
    return Promise.reject(error);
  }
);

export default apiClient;
