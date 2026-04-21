import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BookingProvider>
          <Toaster

            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#18181b", // bg-zinc-900 solid
                color: "#fff",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              },
              success: {
                style: {
                  background: "#064e3b", // emerald-900 solid
                  borderColor: "#10b981", // emerald-500
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#10b981",
                },
              },
              error: {
                style: {
                  background: "#7f1d1d", // red-900 solid
                  borderColor: "#ef4444", // red-500
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#ef4444",
                },
              },
            }}
          />
          <RouterProvider router={router} />
        </BookingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
