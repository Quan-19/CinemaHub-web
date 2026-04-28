import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

// 🔥 INTERCEPTOR PHẢI ĐƯỢC ĐẶT Ở ĐÂY, TRƯỚC KHI RENDER
axios.interceptors.request.use(
  (config) => {
    // Lấy từ sessionStorage trước, sau đó mới localStorage
    let token = sessionStorage.getItem("token");
    if (!token) token = localStorage.getItem("token");

    let twoFactorVerified = sessionStorage.getItem("twoFactorVerified");
    if (!twoFactorVerified)
      twoFactorVerified = localStorage.getItem("twoFactorVerified");

    console.log(`🔵 [${config.method?.toUpperCase()}] ${config.url}`, {
      hasToken: !!token,
      twoFactorVerified: twoFactorVerified === "true",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (twoFactorVerified === "true") {
      config.headers["x-2fa-verified"] = "true";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - KHÔNG TỰ ĐỘNG CLEAR STORAGE
axios.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    // 🔥 LẤY TỪ sessionStorage TRƯỚC
    let twoFactorVerified = sessionStorage.getItem("twoFactorVerified");
    if (!twoFactorVerified)
      twoFactorVerified = localStorage.getItem("twoFactorVerified");

    console.log("🔵 Interceptor - twoFactorVerified value:", twoFactorVerified);
    console.log(
      "🔵 Interceptor - twoFactorVerified type:",
      typeof twoFactorVerified,
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (twoFactorVerified === "true") {
      config.headers["x-2fa-verified"] = "true";
      console.log("✅ Added x-2fa-verified header");
    } else {
      console.log("❌ NO x-2fa-verified header");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
