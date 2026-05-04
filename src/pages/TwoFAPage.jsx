// src/pages/TwoFAPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, AlertCircle, ArrowLeft, Clock } from "lucide-react";
import axios from "../utils/axiosConfig";

export default function TwoFAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const expired = params.get("expired") === "true";

    const storedEmail =
      emailParam ||
      localStorage.getItem("pending2FAEmail") ||
      sessionStorage.getItem("pending2FAEmail") ||
      localStorage.getItem("userEmail");

    if (!storedEmail) {
      console.error("No email found for 2FA");
      window.location.href = "/auth";
      return;
    }

    setEmail(storedEmail);
    setSessionExpired(expired);

    if (expired) {
      setError("Phiên xác thực đã hết hạn (5 phút). Vui lòng xác thực lại.");
    }

    localStorage.setItem("pending2FAEmail", storedEmail);
    localStorage.setItem("userEmail", storedEmail);
  }, [location.search]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        const response = await axios.post("/api/2fa/verify-session", {
          token: otpCode,
          backupCode: null,
        });

        console.log("Verify session response:", response.data);

        if (response.data.success) {
          // Lưu trạng thái 2FA
          localStorage.setItem("twoFactorVerified", "true");
          sessionStorage.setItem("twoFactorVerified", "true");

          if (response.data.twoFactorVerifiedUntil) {
            localStorage.setItem(
              "twoFactorExpiry",
              response.data.twoFactorVerifiedUntil,
            );
          }

          localStorage.removeItem("pending2FAEmail");
          window.location.href = "/admin/dashboard";
        }
      } else {
        const response = await axios.post("/api/2fa/verify-login", {
          email: email,
          token: otpCode,
          backupCode: null,
        });

        console.log("Verify login response:", response.data);

        if (response.data.success) {
          const { token: newToken, user } = response.data;

          localStorage.setItem("token", newToken);
          sessionStorage.setItem("token", newToken);
          localStorage.setItem("role", user.role);
          sessionStorage.setItem("role", user.role);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("twoFactorVerified", "true");
          sessionStorage.setItem("twoFactorVerified", "true");

          localStorage.removeItem("pending2FAEmail");
          window.location.href = "/admin/dashboard";
        }
      }
    } catch (err) {
      console.error("2FA error:", err);
      const errorMessage =
        err.response?.data?.message || "Mã OTP không đúng. Vui lòng thử lại.";
      setError(errorMessage);
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("pending2FAEmail");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("twoFactorVerified");
    sessionStorage.removeItem("twoFactorVerified");
    localStorage.removeItem("twoFactorExpiry");
    localStorage.removeItem("role");
    sessionStorage.removeItem("role");

    window.location.href = "/auth";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-96 border border-zinc-700">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {sessionExpired ? "Xác thực lại 2FA" : "Xác thực 2 yếu tố"}
          </h2>
          <p className="text-gray-400 mt-2">
            {sessionExpired
              ? "Phiên xác thực đã hết hạn. Vui lòng nhập mã OTP mới."
              : "Vui lòng nhập mã OTP từ Google Authenticator"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Email: <strong className="text-white">{email}</strong>
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
            <Clock className="h-3 w-3" />
            <span>Mỗi lần xác thực có hiệu lực trong 5 phút</span>
          </div>
        </div>

        <input
          type="text"
          value={otpCode}
          onChange={(e) =>
            setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono mb-4 focus:border-red-500 focus:outline-none"
          maxLength={6}
          autoFocus
          disabled={loading}
          onKeyPress={(e) => e.key === "Enter" && handleVerify()}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>

        <button
          onClick={handleBackToLogin}
          className="w-full mt-3 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}
