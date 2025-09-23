import axios from "axios";

// Este cliente lê a URL do seu arquivo .env, garantindo que o endereço está sempre correto.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ex: https://bepit-backend-oficial.onrender.com
  timeout: 30000, // Aumentamos o tempo de espera para 30 segundos para lidar com o "cold start" do Render
  headers: {
    "Content-Type": "application/json"
  }
});

export default apiClient;

