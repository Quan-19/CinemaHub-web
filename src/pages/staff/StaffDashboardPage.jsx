import { useOutletContext } from "react-router-dom";
import { TrendingUp, Users, Ticket, Timer } from "lucide-react";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { getAuth } from "firebase/auth";
function StatCard({
  icon: Icon,
  accentClassName,
  value,
  title,
  sub1,
  sub2,
  delta,
}) {
  return (
    <div className="cinema-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
            accentClassName,
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
          {delta || "0%"}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-zinc-400">{title}</div>
        <div className="mt-2 text-xs text-zinc-500">
          {sub1}
          {sub2 ? <span className="ml-2">{sub2}</span> : null}
        </div>
      </div>
    </div>
  );
}

function RecentTicket({ initials, name, detail, seats, timeAgo, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-zinc-200">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-zinc-400">{detail}</div>
          <div className="mt-1 text-xs text-zinc-500">Ghế: {seats}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-zinc-500">{timeAgo}</div>
        <div
          className={`mt-2 text-xs font-semibold ${
            ok ? "text-emerald-400" : "text-zinc-400"
          }`}
        >
          {ok ? "✓ Xác nhận" : "Chờ"}
        </div>
      </div>
    </div>
  );
}

function StaffDashboardPage() {
  const { subtitle } = useOutletContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 CALL API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log("❌ No user logged in");
          return;
        }

        const token = await user.getIdToken();

        console.log("TOKEN:", token);

        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="text-white p-6">Loading...</div>;

  const todayRevenue = data?.revenue?.slice(-1)[0]?.revenue || 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Nhân viên</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Ticket}
          accentClassName="bg-cinema-primary/15 text-cinema-primary"
          value={data?.tickets || 0}
          title="Vé đã bán"
          sub1="Tổng hệ thống"
          delta="+5%"
        />

        <StatCard
          icon={TrendingUp}
          accentClassName="bg-emerald-500/15 text-emerald-400"
          value={Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(todayRevenue)}
          title="Doanh thu"
          sub1="Tháng hiện tại"
        />

        <StatCard
          icon={Users}
          accentClassName="bg-violet-500/15 text-violet-300"
          value={data?.users || 0}
          title="Người dùng"
        />

        <StatCard
          icon={Timer}
          accentClassName="bg-amber-500/15 text-amber-300"
          value={data?.movies || 0}
          title="Phim đang chiếu"
        />
      </section>

      {/* ================= CHART ================= */}
      <section className="cinema-surface p-4 sm:p-5">
        <h2 className="text-base font-semibold">Vé bán theo giờ hôm nay</h2>

        <div className="mt-4">
          {/* Nếu backend chưa có thì giữ fake */}
          {/* Sau này thay bằng data.hourlyTickets */}
          <div className="text-sm text-zinc-400">
            (Chưa có API hourly → đang dùng dữ liệu mẫu)
          </div>
        </div>
      </section>

      {/* ================= RECENT ================= */}
      <section className="cinema-surface p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Đặt vé gần đây</h2>
        </div>

        <div className="mt-4 space-y-3">
          {data?.recent?.map((b, i) => (
            <RecentTicket
              key={i}
              initials={b.user?.charAt(0)}
              name={b.user}
              detail={`${b.movie}`}
              seats={b.seats || "N/A"}
              timeAgo="Vừa xong"
              ok={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default StaffDashboardPage;
