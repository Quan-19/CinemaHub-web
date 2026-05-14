import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, ChevronRight, Loader2, ReceiptText } from "lucide-react";
import axios from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";

const formatNumber = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return "---";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeTier = (tier) => {
  if (!tier) return { code: "bronze", name: "Bronze", min_points: 0 };
  return {
    code: tier.code ?? "bronze",
    name: tier.name ?? "Bronze",
    min_points: Number(tier.min_points ?? tier.minPoints ?? 0) || 0,
  };
};

const tierDiscountPercent = {
  bronze: 5,
  silver: 10,
  gold: 20,
  platinum: 30,
};

const tierNameVi = {
  bronze: "Đồng",
  silver: "Bạc",
  gold: "Vàng",
  platinum: "Bạch kim",
};

export default function LoyaltyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, txRes] = await Promise.all([
          axios.get("/api/loyalty/me"),
          axios.get("/api/loyalty/transactions", { params: { limit: 50 } }),
        ]);

        setSummary(summaryRes.data ?? null);
        const rows = Array.isArray(txRes.data?.data) ? txRes.data.data : [];
        setTransactions(rows);
      } catch (err) {
        console.error("Load loyalty failed", err);
        const message =
          err?.response?.data?.message ||
          "Không thể tải thông tin điểm thưởng. Vui lòng thử lại.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user]);

  const viewModel = useMemo(() => {
    const totalPoints = Number(summary?.total_points ?? 0) || 0;
    const tier = normalizeTier(summary?.tier);
    const nextTier = summary?.next_tier
      ? normalizeTier(summary.next_tier)
      : null;

    const pointsToNext = Number(summary?.points_to_next_tier ?? 0) || 0;
    const earnRate = Number(summary?.earn_rate?.vnd_per_point ?? 1000) || 1000;

    const rangeStart = tier.min_points;
    const rangeEnd = nextTier
      ? nextTier.min_points
      : Math.max(tier.min_points, totalPoints);
    const rangeSize = Math.max(rangeEnd - rangeStart, 1);
    const progressRaw = (totalPoints - rangeStart) / rangeSize;
    const progress = nextTier ? Math.min(Math.max(progressRaw, 0), 1) : 1;

    return {
      totalPoints,
      tier,
      nextTier,
      pointsToNext,
      earnRate,
      progress,
      discountPercent: tierDiscountPercent[tier.code] ?? 0,
      tierNameLocalized: tierNameVi[tier.code] ?? tier.name,
    };
  }, [summary]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-cinema-bg flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
            <Loader2 className="h-6 w-6 animate-spin text-cinema-primary" />
          </div>
          <div>
            <p className="text-white font-semibold">Đang tải điểm thưởng...</p>
            <p className="text-zinc-400 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-cinema-bg flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-cinema-surface p-6">
          <h1 className="text-xl font-bold text-white">Điểm thưởng</h1>
          <p className="mt-2 text-zinc-300">{error}</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cinema-btn-primary"
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Về hồ sơ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-bg pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cinema-primary/10 border border-cinema-primary/20">
                <Award className="h-5 w-5 text-cinema-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Điểm thưởng
                </h1>
                <p className="text-zinc-400 text-sm">
                  Theo dõi hạng thành viên và lịch sử tích điểm
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Hồ sơ
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-cinema-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  Hạng hiện tại
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  {viewModel.tier.name}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  Tổng điểm
                </p>
                <p className="mt-1 text-2xl font-extrabold text-cinema-gold">
                  {formatNumber(viewModel.totalPoints)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <p className="text-zinc-300 font-semibold">
                  {viewModel.nextTier
                    ? `Còn ${formatNumber(viewModel.pointsToNext)} điểm để lên ${viewModel.nextTier.name}`
                    : "Bạn đã đạt hạng cao nhất"}
                </p>
                <p className="text-zinc-500 font-medium">
                  {Math.round(viewModel.progress * 100)}%
                </p>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <div
                  className="h-full rounded-full bg-cinema-primary transition-[width] duration-500"
                  style={{ width: `${Math.round(viewModel.progress * 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{formatNumber(viewModel.tier.min_points)}+</span>
                <span>
                  {viewModel.nextTier
                    ? formatNumber(viewModel.nextTier.min_points)
                    : "MAX"}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">
                Tỉ lệ tích điểm
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                1 điểm / {formatNumber(viewModel.earnRate)} VNĐ
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Điểm được cộng sau khi đơn đặt vé thanh toán thành công.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">
                Ưu đãi theo hạng
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {viewModel.tierNameLocalized} ({viewModel.tier.name}) giảm{" "}
                {viewModel.discountPercent}% trực tiếp vào tổng đơn hàng.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-cinema-surface p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 border border-white/10">
                <ReceiptText className="h-5 w-5 text-zinc-200" />
              </div>
              <div>
                <p className="text-white font-bold">Giao dịch gần đây</p>
                <p className="text-xs text-zinc-500">Tối đa 50 giao dịch</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm font-semibold text-white">
                    Chưa có giao dịch
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Hãy mua vé để bắt đầu tích điểm.
                  </p>
                </div>
              ) : (
                transactions.slice(0, 6).map((tx) => {
                  const points = Number(tx.points ?? 0) || 0;
                  const isEarn = String(tx.type ?? "").toLowerCase() === "earn";
                  const sign = isEarn ? "+" : "-";
                  return (
                    <div
                      key={
                        tx.transaction_id ?? `${tx.booking_id}-${tx.created_at}`
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {tx.description ||
                              (isEarn ? "Tích điểm" : "Giao dịch")}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {tx.booking_id ? `Booking #${tx.booking_id}` : ""}
                            {tx.booking_id ? " • " : ""}
                            {formatDateTime(tx.created_at)}
                          </p>
                        </div>
                        <div
                          className={
                            isEarn
                              ? "text-emerald-400 font-extrabold"
                              : "text-red-400 font-extrabold"
                          }
                        >
                          {sign}
                          {formatNumber(Math.abs(points))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {transactions.length > 6 ? (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("loyalty-tx-list");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Xem tất cả giao dịch
                </button>
              ) : null}
            </div>
          </section>
        </div>

        <section
          id="loyalty-tx-list"
          className="mt-6 rounded-3xl border border-white/10 bg-cinema-surface p-6"
        >
          <h2 className="text-lg font-extrabold text-white">
            Lịch sử giao dịch
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Danh sách chi tiết các lần cộng/trừ điểm
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-3 text-left font-semibold">
                    Thời gian
                  </th>
                  <th className="py-3 pr-3 text-left font-semibold">Mô tả</th>
                  <th className="py-3 pr-3 text-left font-semibold">Booking</th>
                  <th className="py-3 text-right font-semibold">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isEarn =
                      String(tx.type ?? "").toLowerCase() === "earn";
                    const points = Number(tx.points ?? 0) || 0;
                    return (
                      <tr
                        key={
                          tx.transaction_id ??
                          `${tx.booking_id}-${tx.created_at}`
                        }
                        className="border-b border-white/5"
                      >
                        <td className="py-3 pr-3 text-zinc-300 whitespace-nowrap">
                          {formatDateTime(tx.created_at)}
                        </td>
                        <td className="py-3 pr-3 text-white">
                          {tx.description ||
                            (isEarn ? "Tích điểm" : "Giao dịch")}
                        </td>
                        <td className="py-3 pr-3 text-zinc-300">
                          {tx.booking_id ? `#${tx.booking_id}` : "---"}
                        </td>
                        <td
                          className={
                            "py-3 text-right font-extrabold " +
                            (isEarn ? "text-emerald-400" : "text-red-400")
                          }
                        >
                          {isEarn ? "+" : "-"}
                          {formatNumber(Math.abs(points))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
