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
        <div className="mt-2 text-xs text-zinc-400">
          {sub1}
          {sub2 ? <span className="ml-2">{sub2}</span> : null}
        </div>
      </div>
    </div>
  );
}

function ShowtimeRow({
  time,
  live,
  title,
  room,
  tag,
  progressText,
  progressPct,
  accent,
}) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">{time}</span>
            {live ? (
              <span className="rounded-md bg-cinema-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                LIVE
              </span>
            ) : null}
          </div>
          <div className="mt-1 truncate text-sm font-semibold">{title}</div>
          <div className="mt-0.5 text-xs text-zinc-400">{room}</div>
        </div>

        <span className="rounded-lg border border-zinc-700 bg-zinc-900/40 px-2 py-1 text-[11px] font-semibold text-zinc-300">
          {tag}
        </span>
      </div>

      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-zinc-900">
          <div
            className={["h-1.5 rounded-full", accent].join(" ")}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs text-zinc-400">
          {progressText}
        </div>
      </div>
    </div>
  );
}

function HourlyTicketsChart({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const barsAreaRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  const { chartMax, ticks } = useMemo(() => {
    const maxValue = Math.max(...items.map((i) => i.value), 1);
    const rounded = Math.ceil(maxValue / 25) * 25;
    const nextMax = Math.max(100, rounded || 100);

    return {
      chartMax: nextMax,
      ticks: [nextMax, nextMax * 0.75, nextMax * 0.5, nextMax * 0.25, 0].map(
        (t) => Math.round(t)
      ),
    };
  }, [items]);

  const updateTooltipPosition = useCallback(() => {
    if (hoveredIndex == null) return;
    const root = barsAreaRef.current;
    if (!root) return;

    const cell = root.querySelector(`[data-index="${hoveredIndex}"]`);
    const bar = cell?.querySelector(".hourly-bar");
    if (!cell || !bar) return;

    const rootRect = root.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();

    // Tooltip should sit above-right of the hovered bar (like the reference image)
    const tooltipWidth = 160; // Tailwind w-40
    const gutter = 12;
    const offsetX = 12;
    const offsetY = 10;

    const nextLeft = Math.round(barRect.right - rootRect.left + offsetX);
    const nextTop = Math.round(barRect.top - rootRect.top - offsetY);

    const clampedLeft = Math.min(
      Math.max(nextLeft, gutter),
      Math.max(gutter, Math.round(rootRect.width) - tooltipWidth - gutter)
    );
    const clampedTop = Math.max(0, nextTop);

    setTooltipPos({ left: clampedLeft, top: clampedTop });
  }, [hoveredIndex]);

  useLayoutEffect(() => {
    updateTooltipPosition();
  }, [updateTooltipPosition]);

  useLayoutEffect(() => {
    if (hoveredIndex == null) return;
    window.addEventListener("resize", updateTooltipPosition);
    return () => window.removeEventListener("resize", updateTooltipPosition);
  }, [hoveredIndex, updateTooltipPosition]);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-[40px_1fr] gap-3">
        <div className="flex h-36 flex-col justify-between pb-6 text-right text-xs font-medium text-zinc-400 sm:h-40">
          {ticks.map((t) => (
            <div key={t}>{t}</div>
          ))}
        </div>

        <div>
          <div className="relative h-36 border-b border-l border-zinc-700/70 sm:h-40">
            {ticks
              .filter((t) => t !== 0)
              .map((t) => {
                const pct = (t / chartMax) * 100;
                return (
                  <div
                    key={t}
                    className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-zinc-700/60"
                    style={{ bottom: `${pct}%` }}
                  />
                );
              })}

            <div
              ref={barsAreaRef}
              className="absolute inset-x-0 bottom-0 top-0 grid auto-cols-fr grid-flow-col gap-3 px-2 pb-6 sm:gap-4"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex != null ? (
                <div
                  className="pointer-events-none absolute z-10 w-40 rounded-xl border border-zinc-700 bg-zinc-950/95 px-3 py-2 text-sm shadow-sm backdrop-blur transition-all duration-150 ease-out"
                  style={{ left: tooltipPos.left, top: tooltipPos.top }}
                  role="status"
                >
                  <div className="text-xs font-semibold text-zinc-100">
                    {items[hoveredIndex]?.label}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-red-500">
                    Vé bán : {items[hoveredIndex]?.value}
                  </div>
                </div>
              ) : null}

              {items.map((item, index) => {
                const heightPct = Math.round((item.value / chartMax) * 100);
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={item.label}
                    data-index={index}
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onFocus={() => setHoveredIndex(index)}
                    onBlur={() => setHoveredIndex(null)}
                  >
                    <div
                      className={[
                        "absolute inset-0 rounded-md transition-opacity duration-150",
                        isHovered ? "bg-zinc-100 opacity-100" : "opacity-0",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <div className="relative flex h-full items-end">
                      <div
                        className="hourly-bar w-full rounded-md bg-red-600"
                        style={{
                          height: `${Math.min(100, Math.max(0, heightPct))}%`,
                        }}
                        aria-label={`${item.label}: ${item.value}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-x-0 bottom-0 grid auto-cols-fr grid-flow-col gap-3 px-2 pt-2 text-center text-[11px] font-medium text-zinc-400 sm:gap-4">
              {items.map((item) => (
                <div key={item.label}>{item.label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentTicket({ initials, name, detail, seats, timeAgo, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-zinc-200">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-zinc-400">{detail}</div>
          <div className="mt-1 text-xs text-zinc-400">Ghế: {seats}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-zinc-400">{timeAgo}</div>
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
