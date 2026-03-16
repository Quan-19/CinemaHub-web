import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar.jsx";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;