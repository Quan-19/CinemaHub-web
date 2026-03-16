import { useOutletContext } from "react-router-dom";
import { TrendingUp, Users, Ticket, Timer } from "lucide-react";

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
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        {delta ? (
          <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
            {delta}
          </div>
        ) : (
          <div className="rounded-full bg-zinc-500/10 px-2 py-1 text-xs font-semibold text-zinc-400">
            0%
          </div>
        )}
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
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

        <span className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-2 py-1 text-[11px] font-semibold text-zinc-300">
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
        <div className="mt-2 text-right text-xs text-zinc-500">
          {progressText}
        </div>
      </div>
    </div>
  );
}

function Bars({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-3 sm:gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <div className="flex h-28 w-full items-end">
              <div
                className="w-full rounded-xl bg-cinema-primary"
                style={{ height: `${Math.round((item.value / max) * 100)}%` }}
                aria-label={`${item.label}: ${item.value}`}
              />
            </div>
            <div className="text-[11px] font-medium text-zinc-500">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTicket({ initials, name, detail, seats, timeAgo, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-zinc-200 ring-1 ring-zinc-700">
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
          className={[
            "mt-2 text-xs font-semibold",
            ok ? "text-emerald-400" : "text-zinc-400",
          ].join(" ")}
        >
          {ok ? "✓ Xác nhận" : "Chờ"}
        </div>
      </div>
    </div>
  );
}

function StaffDashboardPage() {
  const { subtitle } = useOutletContext();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Nhân viên</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Ticket}
          accentClassName="bg-cinema-primary/15 text-cinema-primary"
          value="374"
          title="Vé bán hôm nay"
          sub1="Mục tiêu: 400"
          delta="+6%"
        />
        <StatCard
          icon={TrendingUp}
          accentClassName="bg-emerald-500/15 text-emerald-400"
          value="41.2M₫"
          title="Doanh thu hôm nay"
          sub1="Hôm qua: 38.7M₫"
          delta="+6%"
        />
        <StatCard
          icon={Users}
          accentClassName="bg-violet-500/15 text-violet-300"
          value="256"
          title="Khách hàng"
          sub1="Hôm nay"
          delta="+3%"
        />
        <StatCard
          icon={Timer}
          accentClassName="bg-amber-500/15 text-amber-300"
          value="5"
          title="Suất chiếu hôm nay"
          sub1="2 đang chiếu"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="cinema-surface p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Suất chiếu hôm nay</h2>
            <span className="rounded-full bg-cinema-primary/10 px-2 py-1 text-xs font-semibold text-cinema-primary">
              5 suất
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <ShowtimeRow
              time="09:15"
              live
              title="Biệt Đội Chiến Thần"
              room="Phòng P1"
              tag="2D"
              progressText="38/60"
              progressPct={63}
              accent="bg-amber-400"
            />
            <ShowtimeRow
              time="11:45"
              title="Hành Trình Vũ Trụ"
              room="Phòng P2"
              tag="3D"
              progressText="45/60"
              progressPct={75}
              accent="bg-amber-400"
            />
            <ShowtimeRow
              time="14:20"
              title="Bóng Đêm Vĩnh Cửu"
              room="Phòng P3"
              tag="IMAX"
              progressText="52/70"
              progressPct={74}
              accent="bg-amber-400"
            />
          </div>
        </div>

        <div className="cinema-surface p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Vé bán theo giờ hôm nay</h2>
          </div>
          <Bars
            items={[
              { label: "08:00", value: 12 },
              { label: "10:00", value: 28 },
              { label: "12:00", value: 46 },
              { label: "14:00", value: 38 },
              { label: "16:00", value: 52 },
              { label: "18:00", value: 68 },
              { label: "20:00", value: 88 },
            ]}
          />
        </div>
      </section>

      <section className="cinema-surface p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Đặt vé gần đây</h2>
          <button
            type="button"
            className="text-sm font-semibold text-cinema-primary hover:opacity-90"
          >
            Xem tất cả
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <RecentTicket
            initials="N"
            name="Nguyễn Văn A"
            detail="Hành Trình Vũ Trụ · 14:20 — Phòng P3"
            seats="D5, D6"
            timeAgo="5 phút trước"
            ok
          />
          <RecentTicket
            initials="T"
            name="Trần Thị B"
            detail="Biệt Đội Chiến Thần · 17:00 — Phòng P1"
            seats="E3, E4"
            timeAgo="12 phút trước"
            ok
          />
          <RecentTicket
            initials="L"
            name="Lê Minh C"
            detail="Rồng Bay Lên · 19:30 — Phòng P2"
            seats="A1, A2"
            timeAgo="18 phút trước"
            ok={false}
          />
        </div>
      </section>
    </div>
  );
}

export default StaffDashboardPage;
