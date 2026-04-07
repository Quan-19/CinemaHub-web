
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar.jsx";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = expanded ? 256 : 80; // px

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-cinema-bg flex overflow-hidden">
      {/* Desktop sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="hidden lg:flex h-full flex-shrink-0 z-30 transition-all duration-300"
      >
        <Sidebar expanded={expanded} setExpanded={setExpanded} />
      </div>

      {/* Mobile drawer sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          expanded={true}
          setExpanded={() => {}}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-cinema-bg">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-cinema-bg px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cinema-surface border border-white/10 text-white/80 hover:text-white"
            title="Mở menu"
          >
            <ChevronRight size={18} />
          </button>
          <div className="text-sm font-semibold text-white/80">Admin</div>
        </div>

        {/* Content padding */}
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;