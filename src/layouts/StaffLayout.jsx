import { Outlet } from "react-router-dom";
import { useMemo, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import StaffSidebar from "../components/staff/StaffSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatVietnamDate(date) {
  // Example: "Thứ 2, 16/03/2026"
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 2",
    "Thứ 7",
  ];
  const dayName = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dayName}, ${dd}/${mm}/${yyyy}`;
}

function StaffLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const subtitle = useMemo(() => {
    const cinemaName = user?.cinema_name || "Chưa gán rạp";
    return `${cinemaName} — ${formatVietnamDate(new Date())}`;
  }, [user?.cinema_name]);

  return (
    <div className="h-screen overflow-hidden bg-cinema-bg text-zinc-100">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex h-full min-h-0">
        <StaffSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div
          className={[
            "flex min-w-0 min-h-0 flex-1 flex-col",
            mobileOpen ? "pointer-events-none lg:pointer-events-auto" : "",
          ].join(" ")}
        >
          <header className="z-10 shrink-0 border-b border-zinc-700 bg-cinema-bg/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700 bg-cinema-surface text-zinc-200 hover:bg-zinc-900 lg:hidden"
                  aria-label="Mở menu"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="hidden w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-700 bg-cinema-surface px-3 py-2 sm:flex">
                  <Search
                    className="h-4 w-4 text-zinc-400"
                    aria-hidden="true"
                  />
                  <input
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                    placeholder="Tìm kiếm..."
                    type="search"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700 bg-cinema-surface text-zinc-200 hover:bg-zinc-900"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                </button>
                {/* 
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-cinema-surface px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cinema-primary text-xs font-semibold">
                    NV
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold leading-5">
                      Nhân viên
                    </div>
                    <div className="text-xs text-zinc-400">
                      staff@EbizCinema.vn
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </header>

          <main className="min-w-0 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <Outlet context={{ subtitle }} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default StaffLayout;
