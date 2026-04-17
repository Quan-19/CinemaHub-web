import { Outlet } from "react-router-dom";
import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
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
            "relative flex min-h-0 min-w-0 flex-1 flex-col",
            mobileOpen ? "pointer-events-none lg:pointer-events-auto" : "",
          ].join(" ")}
        >
          {/* Nút burger mở menu cho bản di động khi Topbar đã bị xóa */}
          {!mobileOpen && (
            <button
              type="button"
              className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 shadow-xl backdrop-blur lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <Outlet context={{ subtitle }} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default StaffLayout;
