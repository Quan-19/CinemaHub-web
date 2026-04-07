
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar.jsx";
import { useState } from "react";

const AdminLayout = () => {
  const [expanded, setExpanded] = useState(true);
  const sidebarWidth = expanded ? 256 : 80; // 64px/20px (tailwind w-64/w-20)
  return (
    <div className="h-screen bg-cinema-bg flex overflow-hidden">
      <div
        style={{ width: sidebarWidth }}
        className="h-full flex-shrink-0 z-30 transition-all duration-300"
      >
        <Sidebar expanded={expanded} setExpanded={setExpanded} />
      </div>
      <main
        className="flex-1 min-w-0 h-full overflow-y-auto p-6 bg-cinema-bg transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;