import { useEffect } from "react";
import { Check, X, AlertTriangle } from "lucide-react";

export default function StaffSuccessToast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const config = {
    success: {
      border: "border-emerald-500",
      bg: "bg-[#064e3b]",
      text: "text-white",
      iconBg: "bg-emerald-500/20",
      ring: "ring-emerald-500/30",
      icon: <Check className="h-4 w-4" strokeWidth={2.5} />,
    },
    error: {
      border: "border-red-500",
      bg: "bg-[#7f1d1d]",
      text: "text-white",
      iconBg: "bg-red-500/20",
      ring: "ring-red-500/30",
      icon: <X className="h-4 w-4" strokeWidth={2.5} />,
    },
    warning: {
      border: "border-amber-500",
      bg: "bg-[#78350f]",
      text: "text-white",
      iconBg: "bg-amber-500/20",
      ring: "ring-amber-500/30",
      icon: <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />,
    },
  };

  const currentConfig = config[type] || config.success;

  return (
    <div className="fixed right-4 top-4 z-[70] transition-all duration-300">
      <div className={`flex items-center gap-2 rounded-2xl border ${currentConfig.border} ${currentConfig.bg} px-4 py-3 text-sm font-semibold ${currentConfig.text} shadow-2xl shadow-black/30`}>
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${currentConfig.iconBg} ring-1 ${currentConfig.ring}`}>
          {currentConfig.icon}
        </span>
        <div>{message}</div>
      </div>
    </div>
  );
}
