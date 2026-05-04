// src/components/TwoFAStatus.jsx
import { useState, useEffect } from "react";
import { Clock, Shield } from "lucide-react";

export default function TwoFAStatus() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const checkExpiry = () => {
      const expiry = localStorage.getItem("twoFactorExpiry");
      if (expiry) {
        const now = Math.floor(Date.now() / 1000);
        const remaining = parseInt(expiry) - now;
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setTimeLeft({ minutes, seconds, valid: true });
        } else {
          setTimeLeft({ valid: false });
          // Xóa 2FA verified status
          localStorage.removeItem("twoFactorVerified");
          localStorage.removeItem("twoFactorExpiry");
        }
      } else {
        setTimeLeft(null);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft || !timeLeft.valid) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
      <Shield className="h-4 w-4 text-green-500" />
      <span>2FA Active</span>
      <Clock className="h-4 w-4 ml-2" />
      <span className="font-mono">
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}