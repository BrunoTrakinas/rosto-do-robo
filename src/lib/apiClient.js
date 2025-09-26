// F:\uber-chat-mvp\rosto-do-robo\src\lib\apiClient.js
import axios from "axios";

/**
 * PRODUÇÃO: Render
 * DEV: localhost (se quiser testar local)
 */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-oficial-5fye.onrender.com"; // <- seu domínio no Render

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000
});

export default apiClient;
