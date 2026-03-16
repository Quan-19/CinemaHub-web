import {
  LayoutDashboard,
  Film,
  CalendarDays,
  Ticket,
  Users,
  BarChart3,
  Settings
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {

  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/admin"
    },
    {
      name: "Phim",
      icon: <Film size={18} />,
      path: "/admin/movies"
    },
    {
      name: "Lịch chiếu",
      icon: <CalendarDays size={18} />,
      path: "/admin/showtimes"
    },
    {
      name: "Đặt vé",
      icon: <Ticket size={18} />,
      path: "/admin/orders"
    },
    {
      name: "Người dùng",
      icon: <Users size={18} />,
      path: "/admin/users"
    },
    {
      name: "Doanh thu",
      icon: <BarChart3 size={18} />,
      path: "/admin/revenue"
    },
    {
      name: "Cài đặt",
      icon: <Settings size={18} />,
      path: "/admin/settings"
    }
  ];

  return (
    <div className="w-64 h-screen bg-[#020617] border-r border-gray-800 text-white">

      {/* LOGO */}

      <div className="p-6 text-xl font-bold border-b border-gray-800">
        🎬 CineStar Admin
      </div>

      {/* MENU */}

      <nav className="p-4 space-y-2">

        {menu.map((item, index) => (

          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition
               ${isActive
                 ? "bg-red-500 text-white"
                 : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>

        ))}

      </nav>

    </div>
  );
}