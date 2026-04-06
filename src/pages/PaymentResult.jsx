import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PaymentResultPage() {
  // ✅ ĐỔI TÊN Ở ĐÂY
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const status = params.get("status");
    const code = params.get("code");
    const paymentId = params.get("paymentId");

    console.log("Payment Result Page:", { status, code, paymentId });

    // Tự động chuyển hướng sau 3 giây nếu thành công
    if (status === "paid") {
      const timer = setTimeout(() => {
        navigate("/movies"); // ✅ SỬA THÀNH "/profile" HOẶC "/"
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [search, navigate]);

  const params = new URLSearchParams(search);
  const status = params.get("status");
  const code = params.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {status === "paid" ? (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl text-green-400 mb-2">
            ✅ Thanh toán thành công!
          </h1>
          <p className="text-zinc-400 mb-4">Mã giao dịch: {code || "N/A"}</p>
          <p className="text-zinc-400 mb-6">
            Đang chuyển hướng về trang chủ...
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Về trang chủ ngay
          </button>
        </div>
      ) : status === "invalid_signature" ? (
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">🔐 Chữ ký không hợp lệ</h1>
          <p className="text-zinc-400 mb-6">
            Có lỗi xảy ra trong quá trình xác thực
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      ) : status === "error" ? (
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">❌ Có lỗi xảy ra</h1>
          <p className="text-zinc-400 mb-6">Vui lòng thử lại sau</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">❌ Thanh toán thất bại</h1>
          <p className="text-zinc-400 mb-2">Mã lỗi: {code || "Unknown"}</p>
          <p className="text-zinc-400 mb-6">
            Vui lòng thử lại hoặc chọn phương thức khác
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
}
