import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function PaymentResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const statusParam = params.get("status");
    const resultCode = params.get("code") || params.get("resultCode");
    const orderId = params.get("orderId") || params.get("paymentId");
    const bookingId = params.get("booking_id");

    console.log("Payment Result Page:", {
      statusParam,
      resultCode,
      orderId,
      bookingId,
    });

    const processPayment = async () => {
      // VNPay success (status=paid)
      if (statusParam === "paid") {
        setStatus("success");
        setMessage("✅ Thanh toán thành công!");

        if (bookingId) {
          await updateBookingStatus(bookingId, "paid");
        }

        startCountdown();
        return;
      }

      // MoMo success (resultCode=0)
      if (resultCode === "0") {
        setStatus("success");
        setMessage("✅ Thanh toán MoMo thành công!");

        // Tìm booking_id từ orderId nếu cần
        if (orderId && !bookingId) {
          const bookingIdFromOrder = orderId.split("_")[0];
          await updateBookingStatus(bookingIdFromOrder, "paid");
        } else if (bookingId) {
          await updateBookingStatus(bookingId, "paid");
        }

        startCountdown();
        return;
      }

      // Xử lý lỗi
      if (statusParam === "invalid_signature") {
        setStatus("error");
        setMessage("🔐 Chữ ký không hợp lệ. Vui lòng thử lại.");
      } else if (statusParam === "error" || resultCode !== "0") {
        setStatus("error");
        setMessage(
          `❌ Thanh toán thất bại. Mã lỗi: ${resultCode || "Unknown"}`,
        );
      } else {
        setStatus("error");
        setMessage("❌ Có lỗi xảy ra trong quá trình thanh toán.");
      }

      startCountdown();
    };

    const updateBookingStatus = async (bookingIdParam, newStatus) => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const token = await user?.getIdToken();

        await axios.put(
          `http://localhost:5000/api/bookings/${bookingIdParam}/status`,
          { status: newStatus },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        console.log("✅ Updated booking status to:", newStatus);
      } catch (error) {
        console.error("❌ Failed to update booking status:", error);
      }
    };

    const startCountdown = () => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/movies");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    processPayment();
  }, [search, navigate]);

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
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition"
              >
                Về trang chủ
              </button>

              {status === "error" && (
                <button
                  onClick={() => navigate(-2)}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm transition"
                >
                  Thử lại
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={() => navigate("/profile/my-tickets")}
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
