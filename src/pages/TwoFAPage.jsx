// src/pages/TwoFAPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function TwoFAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    // Lấy email từ URL params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    
    // Hoặc lấy từ localStorage
    const storedEmail = localStorage.getItem("pending2FAEmail") || 
                       sessionStorage.getItem("pending2FAEmail");
    
    const finalEmail = emailParam || storedEmail;
    
    if (!finalEmail) {
      // Không có email, quay về login
      navigate("/auth");
      return;
    }
    
    setEmail(finalEmail);
    
    // Lưu lại để dùng nếu refresh
    localStorage.setItem("pending2FAEmail", finalEmail);
  }, [location.search, navigate]);
  
  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("🔵 Verifying 2FA for:", email);
      
      const response = await axios.post(`${API_URL}/2fa/verify-login`, {
        email: email,
        token: otpCode,
        backupCode: null
      });
      
      console.log("🔵 Response:", response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Lưu token và 2FA verified
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        localStorage.setItem('twoFactorVerified', 'true');
        sessionStorage.setItem('twoFactorVerified', 'true');
        
        // Xóa email tạm
        localStorage.removeItem("pending2FAEmail");
        
        console.log("✅ 2FA verified, redirecting...");
        
        // Redirect dựa trên role
        const role = user.role;
        if (role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (role === 'staff') {
          window.location.href = '/staff';
        } else {
          window.location.href = '/';
        }
      } else {
        setError("Xác thực thất bại");
      }
    } catch (err) {
      console.error("2FA error:", err);
      setError(err.response?.data?.message || "Mã OTP không đúng");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-96 border border-zinc-700">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Xác thực 2 yếu tố</h2>
          <p className="text-gray-400 mt-2">Vui lòng nhập mã OTP từ Google Authenticator</p>
          <p className="text-sm text-gray-500 mt-1">
            Email: <strong className="text-white">{email}</strong>
          </p>
        </div>
        
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono mb-4 focus:border-red-500 focus:outline-none"
          maxLength={6}
          autoFocus
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        />
        
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}
        
        <button
          onClick={handleVerify}
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem("pending2FAEmail");
            navigate("/auth");
          }}
          className="w-full mt-3 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}