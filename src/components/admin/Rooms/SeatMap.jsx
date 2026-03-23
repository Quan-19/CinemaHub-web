import { X } from "lucide-react";

const ROWS_LABELS = "ABCDEFGHIJKLMNOPQRST".split("");

export default function SeatMap({ room, onClose }) {
  if (!room) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl max-h-[90vh] flex flex-col"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">
              Sơ đồ ghế — {room.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {room.cinemaName} · {room.type} · {room.totalSeats} ghế
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Screen indicator */}
          <div
            className="w-full rounded-lg py-2 text-center mb-6"
            style={{
              background: "rgba(255,255,255,0.08)",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: 2,
            }}
          >
            ▬▬▬ MÀN HÌNH ▬▬▬
          </div>

          {/* Seat grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {Array.from({ length: room.rows }, (_, rowIdx) => {
                const rowLabel = ROWS_LABELS[rowIdx];
                const isVip = room.vipRows.includes(rowIdx + 1);
                const isCouple = room.coupleRow === rowIdx + 1;
                
                return (
                  <div key={rowIdx} className="flex items-center gap-2 mb-1.5">
                    <span
                      style={{
                        width: 20,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {rowLabel}
                    </span>
                    <div className="flex gap-1 flex-1 justify-center">
                      {Array.from(
                        { length: isCouple ? Math.floor(room.cols / 2) : room.cols },
                        (_, colIdx) => {
                          const isBooked = false; // You can implement booking check here
                          let seatColor = isBooked 
                            ? "rgba(255,255,255,0.12)" 
                            : isVip 
                            ? "#f59e0b" 
                            : isCouple 
                            ? "#e50914" 
                            : "rgba(255,255,255,0.18)";
                          let seatW = isCouple ? 44 : 26;
                          
                          return (
                            <div
                              key={colIdx}
                              style={{
                                width: seatW,
                                height: 22,
                                borderRadius: 4,
                                background: isBooked ? "rgba(255,255,255,0.06)" : seatColor,
                                opacity: isBooked ? 0.5 : 1,
                                border: `1px solid ${
                                  isBooked 
                                    ? "rgba(255,255,255,0.05)" 
                                    : isVip 
                                    ? "rgba(245,158,11,0.4)" 
                                    : isCouple 
                                    ? "rgba(229,9,20,0.4)" 
                                    : "rgba(255,255,255,0.15)"
                                }`,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                color: "rgba(255,255,255,0.5)",
                                transition: "opacity 0.15s",
                              }}
                              title={`${rowLabel}${
                                isCouple 
                                  ? colIdx * 2 + 1 + "-" + (colIdx * 2 + 2) 
                                  : colIdx + 1
                              }`}
                            >
                              {isCouple ? "👥" : ""}
                            </div>
                          );
                        }
                      )}
                    </div>
                    {isVip && (
                      <span style={{ fontSize: 10, color: "#f59e0b", flexShrink: 0, width: 24 }}>
                        VIP
                      </span>
                    )}
                    {isCouple && (
                      <span style={{ fontSize: 10, color: "#e50914", flexShrink: 0, width: 32 }}>
                        CPL
                      </span>
                    )}
                    {!isVip && !isCouple && <span style={{ width: 24, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div
            className="flex flex-wrap items-center gap-4 py-4 mt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { color: "rgba(255,255,255,0.18)", border: "rgba(255,255,255,0.15)", label: "Ghế thường" },
              { color: "#f59e0b", border: "rgba(245,158,11,0.4)", label: "Ghế VIP" },
              { color: "#e50914", border: "rgba(229,9,20,0.4)", label: "Ghế Couple" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  style={{
                    width: 16,
                    height: 14,
                    borderRadius: 3,
                    background: l.color,
                    border: `1px solid ${l.border}`,
                  }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}