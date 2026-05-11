import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const hasRedirected = useRef(false);
  const isProcessed = useRef(false);
  const redirectInfo = useRef({ bookingId: null, method: "" });

  // Parsing logic extracted for initial state and effect
  const getPaymentStatus = (searchString) => {
    const params = new URLSearchParams(searchString);
    const vnpStatus = params.get("status");
    const vnpCode = params.get("code");
    const momoResultCode = params.get("resultCode");
    const momoBookingId = params.get("booking_id");
    const zalopayStatus = params.get("payment_status");
    const zalopayBookingId = params.get("booking_id");
    const zalopayMethod = params.get("method");
    const commonBookingId = params.get("booking_id");
    const paymentStatus = params.get("payment_status");

    let isSuccess = false;
    let statusMessage = "";
    let bookingId = null;
    let method = null;

    if (zalopayStatus === "success" && zalopayBookingId) {
      isSuccess = true;
      statusMessage = "✅ Thanh toán ZaloPay thành công!";
      method = zalopayMethod || "zalopay";
      bookingId = zalopayBookingId;
    } else if (vnpStatus === "paid" && vnpCode === "00") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán VnPay thành công!";
      method = "vnpay";
      bookingId = commonBookingId;
    } else if (momoResultCode === "0") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán MoMo thành công!";
      method = "momo";
      bookingId = momoBookingId || commonBookingId;
    } else if (paymentStatus === "success") {
      isSuccess = true;
      statusMessage = "✅ Thanh toán thành công!";
      method = params.get("method") || "unknown";
      bookingId = commonBookingId;
    } else if (zalopayStatus === "failed") {
      statusMessage = `❌ Thanh toán ZaloPay thất bại. Mã lỗi: ${params.get("code") || "unknown"}`;
    } else {
      if (vnpCode && vnpCode !== "00") {
        statusMessage = `❌ Thanh toán VnPay thất bại. Mã lỗi: ${vnpCode}`;
      } else if (momoResultCode && momoResultCode !== "0") {
        statusMessage = `❌ Thanh toán MoMo thất bại. Mã lỗi: ${momoResultCode}`;
      } else if (zalopayStatus === "error") {
        statusMessage = "❌ Thanh toán ZaloPay thất bại. Vui lòng thử lại.";
      } else {
        statusMessage = "❌ Thanh toán thất bại. Vui lòng thử lại.";
      }
    }

    return { isSuccess, statusMessage, bookingId, method };
  };

  const [status] = useState(() => {
    const { isSuccess } = getPaymentStatus(search);
    return isSuccess ? "success" : "error";
  });
  const [message] = useState(() => {
    const { statusMessage } = getPaymentStatus(search);
    return statusMessage || "❌ Thanh toán thất bại. Vui lòng thử lại.";
  });

  useLayoutEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    const { bookingId, method } = getPaymentStatus(search);

    if (bookingId) {
      redirectInfo.current = { bookingId, method };
    }
  }, [search]);

  // Xử lý redirect
  useEffect(() => {
    if (status === "processing") return;
    if (hasRedirected.current) return;

    const timer = setTimeout(() => {
      hasRedirected.current = true;
      if (status === "success") {
        const bookingId = redirectInfo.current?.bookingId;
        const method = redirectInfo.current?.method;

        console.log(`🔄 Redirecting with bookingId: ${bookingId}, method: ${method}`);

        if (bookingId) {
          // ✅ Redirect sang trang confirm vé (giống MoMo)
          navigate(
            `/booking/confirm?payment_status=success&booking_id=${encodeURIComponent(bookingId)}${method ? `&method=${encodeURIComponent(method)}` : ""}`,
            { replace: true },
          );
        } else {
          console.warn("⚠️ No bookingId found, redirecting to tickets page");
          navigate("/profile/my-tickets", { replace: true });
        }
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

  // UI Components (giữ nguyên)
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