// src/utils/axiosConfig.js
import axios from "axios";

const API_URL = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 🔥 BỎ interceptor xử lý 2FA, chỉ giữ lỗi cơ bản
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ xử lý lỗi 401 (unauthorized) - chuyển về login
    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - Redirecting to login");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
