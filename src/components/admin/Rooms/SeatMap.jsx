// SeatMap.jsx (phiên bản căn chỉnh ghế Couple)
import { X, Wrench } from "lucide-react";
import { useState, useMemo } from "react";

const ROWS_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function SeatLegendItem({ colorClassName, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <span
        className={["h-4 w-4 rounded-[4px] border", colorClassName].join(" ")}
      />
      <span>{label}</span>
    </div>
  );
}

function buildSeatGrid({ rows, seatsPerRow, vipRows, coupleRow }) {
  const letters = ROWS_LABELS;
  const vipSet = new Set(vipRows);
  const data = [];

  for (let r = 1; r <= rows; r += 1) {
    const rowLabel = letters[r - 1] ?? String(r);
    const isCoupleRow = coupleRow === r;
    const seats = [];

    if (isCoupleRow) {
      // Hàng Couple: mỗi ghế đại diện cho 1 cặp (2 chỗ ngồi)
      const coupleSeatsCount = Math.ceil(seatsPerRow / 2);
      for (let c = 1; c <= coupleSeatsCount; c += 1) {
        seats.push({
          id: `${rowLabel}${c}`,
          label: `${rowLabel}${c}`,
          row: r,
          col: c,
          type: "couple",
          isCouple: true,
          seatsCount: 2, // Mỗi ghế couple tương đương 2 chỗ ngồi
        });
      }
    } else {
      // Hàng thường và VIP: mỗi ghế là 1 chỗ ngồi
      for (let c = 1; c <= seatsPerRow; c += 1) {
        const type = vipSet.has(r) ? "vip" : "standard";
        seats.push({
          id: `${rowLabel}${c}`,
          label: `${rowLabel}${c}`,
          row: r,
          col: c,
          type,
          isCouple: false,
          seatsCount: 1,
        });
      }
    }

    data.push({ row: r, label: rowLabel, seats, isCoupleRow });
  }

  return data;
}

export default function SeatMap({ room, onClose }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceSeats, setMaintenanceSeats] = useState(new Set());

  const seatRows = useMemo(() => {
    if (!room) return [];
    return buildSeatGrid({
      rows: room.rows,
      seatsPerRow: room.cols || room.seatsPerRow,
      vipRows: room.vipRows || [],
      coupleRow: room.coupleRow,
    });
  }, [room]);

  const handleSeatClick = (seatId) => {
    if (!maintenanceMode) return;
    setMaintenanceSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });
  };

  if (!room) return null;

  const seatsPerRow = room.cols || room.seatsPerRow;
  
  // Tính tổng số ghế thực tế (đếm cả ghế couple là 2 chỗ)
  const actualTotalSeats = seatRows.reduce((total, row) => {
    return total + row.seats.reduce((rowTotal, seat) => rowTotal + seat.seatsCount, 0);
  }, 0);

  // Tìm hàng couple để lấy số lượng ghế làm chuẩn cho việc căn chỉnh
  const coupleRowData = seatRows.find(row => row.isCoupleRow);
  const standardSeatWidth = 28; // w-7 = 28px (7 * 4px)
  const coupleSeatWidth = 56; // w-14 = 56px (14 * 4px)
  
  // Tính toán số ghế để căn chỉnh
  const getSeatWidth = (seat) => seat.isCouple ? coupleSeatWidth : standardSeatWidth;
  
  // Tính tổng chiều rộng của hàng thường
  const standardRowTotalWidth = seatsPerRow * (standardSeatWidth + 8); // 8px là gap
  // Tính tổng chiều rộng của hàng couple
  const coupleRowTotalWidth = (coupleRowData?.seats.length || 0) * (coupleSeatWidth + 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-5xl rounded-2xl max-h-[90vh] flex flex-col"
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
              {room.cinemaName} · {room.type} · {actualTotalSeats} ghế
            </p>
            {room.coupleRow && (
              <p className="text-xs text-fuchsia-400 mt-1">
                * Hàng {room.coupleRow} là ghế Couple (2 ghế/vé)
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMaintenanceMode((v) => !v)}
              className={[
                "inline-flex h-9 items-center gap-2 rounded-2xl border px-4 text-xs font-semibold transition-colors",
                maintenanceMode
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800",
              ].join(" ")}
            >
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              {maintenanceMode ? "Đang chọn bảo trì" : "Bảo trì ghế"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {maintenanceMode && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs text-red-300">
              Nhấn vào ghế để đánh dấu / bỏ đánh dấu bảo trì. Ghế bảo trì sẽ không thể đặt được.
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4 sm:p-5">
            {/* Screen SVG */}
            <div className="relative mb-6 flex items-center justify-center">
              <svg
                className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full text-cyan-400"
                viewBox="0 0 600 80"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <filter id="screenGlowBlur" x="-30%" y="-80%" width="160%" height="260%">
                    <feGaussianBlur stdDeviation="7" />
                  </filter>
                  <linearGradient id="screenSpot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 110 52 Q 300 16 490 52 L 520 110 L 80 110 Z"
                  fill="url(#screenSpot)"
                  opacity="0.9"
                />
                <path
                  d="M 110 52 Q 300 16 490 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeLinecap="round"
                  opacity="0.22"
                  filter="url(#screenGlowBlur)"
                />
                <path
                  d="M 110 52 Q 300 16 490 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
              <div className="pt-6 text-[11px] font-semibold tracking-[0.55em] text-zinc-500">
                SCREEN
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto">
              <div className="mx-auto w-fit">
                <div className="inline-grid gap-2">
                  {seatRows.map((row) => {
                    // Tính toán padding để căn chỉnh hàng couple với các hàng khác
                    const isCoupleRow = row.isCoupleRow;
                    const rowSeatsCount = row.seats.length;
                    const standardSeatsCount = seatsPerRow;
                    
                    // Tính số padding cần thêm để căn giữa
                    let leftPadding = 0;
                    let rightPadding = 0;
                    
                    if (isCoupleRow) {
                      // Hàng couple: mỗi ghế rộng gấp đôi, cần căn chỉnh để nằm giữa
                      const standardWidth = standardSeatsCount * (standardSeatWidth + 8);
                      const coupleWidth = rowSeatsCount * (coupleSeatWidth + 8);
                      const diff = standardWidth - coupleWidth;
                      leftPadding = diff / 2;
                      rightPadding = diff / 2;
                    }
                    
                    return (
                      <div
                        key={row.label}
                        className="grid grid-cols-[28px_auto_28px] items-center gap-3"
                      >
                        <div className="text-center text-[11px] font-semibold text-zinc-500">
                          {row.label}
                        </div>

                        <div className="flex justify-center">
                          <div
                            className="grid auto-cols-max grid-flow-col gap-2"
                            style={{
                              paddingLeft: leftPadding > 0 ? `${leftPadding}px` : 0,
                              paddingRight: rightPadding > 0 ? `${rightPadding}px` : 0,
                            }}
                          >
                            {row.seats.map((seat) => {
                              const isMaintenance = maintenanceSeats.has(seat.id);
                              const base = seat.isCouple 
                                ? "h-7 w-14 rounded-[6px] border bg-zinc-950/10 flex items-center justify-center gap-1"
                                : "h-7 w-7 rounded-[6px] border bg-zinc-950/10";
                              
                              let style = "";
                              if (isMaintenance) {
                                style = "border-red-500 bg-red-500/25";
                              } else if (seat.type === "vip") {
                                style = "border-amber-400";
                              } else if (seat.type === "couple") {
                                style = "border-fuchsia-400 bg-fuchsia-500/10";
                              } else {
                                style = "border-zinc-700 bg-zinc-800/40";
                              }
                              
                              const cursor = maintenanceMode
                                ? "cursor-pointer hover:ring-2 hover:ring-red-400/40"
                                : "";

                              if (seat.isCouple) {
                                return (
                                  <div
                                    key={seat.id}
                                    className={[base, style, cursor].join(" ")}
                                    title={
                                      isMaintenance
                                        ? `${seat.label} (Bảo trì - 2 ghế)`
                                        : `${seat.label} (Ghế đôi - 2 chỗ)`
                                    }
                                    aria-label={seat.label}
                                    onClick={() => handleSeatClick(seat.id)}
                                  >
                                    <span className="text-[10px]">👥</span>
                                    <span className="text-[8px] text-zinc-400">2</span>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={seat.id}
                                  className={[base, style, cursor].join(" ")}
                                  title={
                                    isMaintenance
                                      ? `${seat.label} (Bảo trì)`
                                      : seat.label
                                  }
                                  aria-label={seat.label}
                                  onClick={() => handleSeatClick(seat.id)}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-center text-[11px] font-semibold text-zinc-500">
                          {row.label}
                        </div>
                      </div>
                    );
                  })}

                  {/* Column numbers */}
                  <div className="grid grid-cols-[28px_auto_28px] items-center gap-3 pt-2">
                    <div />
                    <div className="flex justify-center">
                      <div className="grid auto-cols-max grid-flow-col gap-2 text-center text-[11px] font-semibold text-zinc-600">
                        {seatRows[0]?.isCoupleRow
                          ? // Nếu hàng đầu là hàng couple, hiển thị số cặp ghế và căn chỉnh
                            (() => {
                              const firstRow = seatRows[0];
                              const standardWidth = seatsPerRow * (standardSeatWidth + 8);
                              const coupleWidth = firstRow.seats.length * (coupleSeatWidth + 8);
                              const diff = standardWidth - coupleWidth;
                              const leftPadding = diff / 2;
                              
                              return (
                                <div
                                  className="grid auto-cols-max grid-flow-col gap-2"
                                  style={{
                                    paddingLeft: leftPadding > 0 ? `${leftPadding}px` : 0,
                                    paddingRight: leftPadding > 0 ? `${leftPadding}px` : 0,
                                  }}
                                >
                                  {Array.from({ length: firstRow.seats.length }, (_, i) => (
                                    <div key={i + 1} className="w-14 text-center">
                                      {i + 1}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()
                          : // Hàng thường, hiển thị số ghế
                            Array.from({ length: seatsPerRow }, (_, i) => (
                              <div key={i + 1} className="w-7 text-center">
                                {i + 1}
                              </div>
                            ))}
                      </div>
                    </div>
                    <div />
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
              <div className="flex flex-wrap items-center gap-5">
                <SeatLegendItem
                  colorClassName="border-zinc-700 bg-zinc-800/40"
                  label="Ghế thường (1 chỗ)"
                />
                <SeatLegendItem
                  colorClassName="border-amber-400 bg-transparent"
                  label="Ghế VIP (1 chỗ)"
                />
                <SeatLegendItem
                  colorClassName="border-fuchsia-400 bg-fuchsia-500/10"
                  label="Ghế Couple (2 chỗ/vé)"
                />
                <SeatLegendItem
                  colorClassName="border-red-500 bg-red-500/25"
                  label="Bảo trì"
                />
              </div>

              <div className="hidden items-center gap-4 sm:flex">
                <div className="text-[11px] font-semibold text-amber-400">
                  VIP
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-fuchsia-400">
                  <span>👥</span>
                  <span>CPL (2 ghế)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}       