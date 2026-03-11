import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return (
    <div className="w-full">
      <Navbar />

      <main className="pb-6 sm:pb-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
