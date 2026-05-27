import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AIChatbox from "../components/AIChatbox.jsx";
import ScrollToTopButton from "../components/ScrollToTopButton.jsx";

function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  // Các trang có banner hero tràn viền: không cần padding-top
  const isFullBleed = useMemo(() => {
    if (location.pathname === "/") return true;
    if (location.pathname.match(/^\/movies\/[^/(]+$/)) return true;
    return false;
  }, [location.pathname]);

  return (
    <div className="w-full">
      <Navbar />

      <main
        className={`pb-6 sm:pb-8 ${!isFullBleed ? "pt-[72px] lg:pt-[88px]" : ""}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <AIChatbox />
      <ScrollToTopButton />
    </div>
  );
}

export default MainLayout;
