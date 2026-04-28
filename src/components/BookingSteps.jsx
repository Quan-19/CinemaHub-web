import { Film, MapPin, Armchair, CreditCard, Check } from "lucide-react";

const steps = [
  { id: 1, label: "Chọn phim", icon: Film },
  { id: 2, label: "Chọn rạp & suất", icon: MapPin },
  { id: 3, label: "Chọn ghế", icon: Armchair },
  { id: 4, label: "Thanh toán", icon: CreditCard },
];

export default function BookingSteps({ currentStep = 1 }) {
  return (
    <div className="w-full py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                        : isActive
                        ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)] ring-2 ring-red-500/30"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden sm:block transition-colors ${
                      isActive
                        ? "text-white"
                        : isDone
                        ? "text-green-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div className="flex-1 mx-2 sm:mx-4 relative">
                    <div
                      className={`h-[2px] rounded-full transition-all duration-500 ${
                        isDone ? "bg-green-500/60" : "bg-zinc-800"
                      }`}
                    />
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

