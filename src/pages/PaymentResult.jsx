import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const hasRedirected = useRef(false);
  const isProcessed = useRef(false);

  useLayoutEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    const params = new URLSearchParams(search);
    
    // Lấy params từ VnPay
    const vnpStatus = params.get("status"); // VnPay: "paid"
    const vnpCode = params.get("code"); // VnPay: "00"
    const vnpPaymentId = params.get("paymentId");
    
    // Lấy params từ MoMo
    const momoResultCode = params.get("resultCode"); // MoMo: "0"
    const momoOrderId = params.get("orderId");
    
    // Lấy params chung
    const paymentStatus = params.get("payment_status");
    
    console.log("=== Payment Result Debug ===");
    console.log("VnPay - status:", vnpStatus);
    console.log("VnPay - code:", vnpCode);
    console.log("MoMo - resultCode:", momoResultCode);
    console.log("payment_status:", paymentStatus);
    console.log("All params:", Object.fromEntries(params.entries()));
    
    // ✅ KIỂM TRA VNPAY THÀNH CÔNG
    let isSuccess = false;
    let statusMessage = "";
    
    if (vnpStatus === "paid" && vnpCode === "00") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán VnPay thành công!";
      console.log("✅ VnPay payment success!");
    } 
    // ✅ KIỂM TRA MOMO THÀNH CÔNG
    else if (momoResultCode === "0") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán MoMo thành công!";
      console.log("✅ MoMo payment success!");
    }
    // ✅ KIỂM TRA CUSTOM STATUS
    else if (paymentStatus === "success") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán thành công!";
      console.log("✅ Custom payment success!");
    }
    // ❌ THẤT BẠI
    else {
      // Kiểm tra lỗi VnPay
      if (vnpCode && vnpCode !== "00") {
        statusMessage = `❌ Thanh toán VnPay thất bại. Mã lỗi: ${vnpCode}`;
      } 
      // Kiểm tra lỗi MoMo
      else if (momoResultCode && momoResultCode !== "0") {
        statusMessage = `❌ Thanh toán MoMo thất bại. Mã lỗi: ${momoResultCode}`;
      }
      else {
        statusMessage = "❌ Thanh toán thất bại. Vui lòng thử lại.";
      }
      console.log("❌ Payment failed");
    }
    
    // Cập nhật state
    if (isSuccess) {
      setStatus("success");
      setMessage(statusMessage);
    } else {
      setStatus("error");
      setMessage(statusMessage);
    }
  }, [search]);

  // Xử lý redirect
  useEffect(() => {
    if (status === "processing") return;
    if (hasRedirected.current) return;
    
    const timer = setTimeout(() => {
      hasRedirected.current = true;
      if (status === "success") {
        navigate("/profile/my-tickets", { replace: true });
      } else if (status === "error") {
        navigate("/movies", { replace: true });
      }
    }, 5000);
    
    // Countdown effect
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [status, navigate]);

  // UI Components
  const getIcon = () => {
    if (status === "success") {
      return <CheckCircle size={64} className="text-green-500" />;
    }
    if (status === "error") {
      return <XCircle size={64} className="text-red-500" />;
    }
    return <Loader2 size={64} className="text-yellow-500 animate-spin" />;
  };

  const getBgColor = () => {
    if (status === "success") return "bg-green-500/10 border-green-500/20";
    if (status === "error") return "bg-red-500/10 border-red-500/20";
    return "bg-yellow-500/10 border-yellow-500/20";
  };

  const getTitleColor = () => {
    if (status === "success") return "text-green-400";
    if (status === "error") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div
        className={`max-w-md w-full mx-4 p-8 rounded-2xl text-center border ${getBgColor()}`}
      >
        <div className="flex justify-center mb-6">{getIcon()}</div>

        <h1 className={`text-2xl font-bold mb-3 ${getTitleColor()}`}>
          {status === "success"
            ? "Thanh toán thành công!"
            : status === "error"
              ? "Thanh toán thất bại"
              : "Đang xử lý..."}
        </h1>

        <p className="text-zinc-400 mb-6">{message}</p>

        {status !== "processing" && (
          <>
            <p className="text-zinc-500 text-sm mb-6">
              Đang chuyển hướng sau {countdown} giây...
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  hasRedirected.current = true;
                  navigate("/");
                }}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition"
              >
                Về trang chủ
              </button>

              {status === "error" && (
                <button
                  onClick={() => {
                    hasRedirected.current = true;
                    navigate(-2);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm transition"
                >
                  Thử lại
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={() => {
                    hasRedirected.current = true;
                    navigate("/profile/my-tickets");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm transition"
                >
                  Xem vé của tôi
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}