import { useCallback, useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Plus,
  Settings,
  Trash2,
  Wrench,
} from "lucide-react";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffIconButton from "../../components/staff/StaffIconButton.jsx";
import { makeId } from "../../components/staff/staffUtils.js";
function Badge({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-semibold",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function StatPill({ count, label, colorClassName }) {
  return (
    <div className="cinema-surface flex items-center gap-3 rounded-2xl border border-zinc-700 px-4 py-3">
      <div
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
          colorClassName,
        ].join(" ")}
      >
        <Layers className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <div className="text-xl font-bold">{count}</div>
        <div className="text-xs font-semibold text-zinc-400">{label}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-zinc-400">{label}</div>
      {children}
      {hint ? <div className="text-xs text-zinc-400">{hint}</div> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "", disabled = false }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/30 px-3 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30 disabled:opacity-60"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/30 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function parseRowList(value) {
  const parts = String(value)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const numbers = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n > 0);
  return Array.from(new Set(numbers)).sort((a, b) => a - b);
}

function buildSeatGrid({ rows, seatsPerRow, vipRows, coupleRow }) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
          seatsCount: 2,
        });
      }
    } else {
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

function SeatMapModal({
  room,
  cinemaName,
  onClose,
  maintenanceSeats,
  onToggleMaintenance,
}) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const seatRows = useMemo(() => {
    return buildSeatGrid({
      rows: room.rows,
      seatsPerRow: room.seatsPerRow,
      vipRows: room.vipRows,
      coupleRow: room.coupleRow,
    });
  }, [room]);

  const actualTotalSeats = useMemo(() => {
    return seatRows.reduce((total, row) => {
      return total + row.seats.reduce((rowTotal, seat) => rowTotal + (seat.seatsCount || 1), 0);
    }, 0);
  }, [seatRows]);

  const standardSeatWidth = 28; // w-7 = 28px
  const coupleSeatWidth = 56;   // w-14 = 56px

  const handleSeatClick = useCallback(
    (seatId) => {
      if (!maintenanceMode) return;
      onToggleMaintenance(room.id, seatId);
    },
    [maintenanceMode, onToggleMaintenance, room.id],
  );

  return (
    <StaffCenteredModalShell
      title={`Sơ đồ ghế — ${room.name}`}
      onClose={onClose}
      maxWidthClassName="max-w-5xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            {cinemaName} · {room.type} · {actualTotalSeats} ghế {room.coupleRow && `(Hàng ${room.coupleRow} là Couple)`}
          </div>

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
        </div>

        {maintenanceMode && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs text-red-300">
            Nhấn vào ghế để đánh dấu / bỏ đánh dấu bảo trì. Ghế bảo trì sẽ không
            thể đặt được.
          </div>
        )}

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4 sm:p-5">
          <div className="relative mb-6 flex items-center justify-center">
            <svg
              className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full text-cyan-400"
              viewBox="0 0 600 80"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="screenGlowBlur"
                  x="-30%"
                  y="-80%"
                  width="160%"
                  height="260%"
                >
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <linearGradient id="screenSpot" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0"
                    stopColor="currentColor"
                    stopOpacity="0.16"
                  />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Soft spotlight under the screen */}
              <path
                d="M 110 52 Q 300 16 490 52 L 520 110 L 80 110 Z"
                fill="url(#screenSpot)"
                opacity="0.9"
              />

              {/* Blurred glow stroke */}
              <path
                d="M 110 52 Q 300 16 490 52"
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.22"
                filter="url(#screenGlowBlur)"
              />
              {/* Crisp arc */}
              <path
                d="M 110 52 Q 300 16 490 52"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
            <div className="pt-6 text-[11px] font-semibold tracking-[0.55em] text-zinc-400">
              SCREEN
            </div>
          </div>

            <div className="overflow-x-auto">
              <div className="mx-auto w-fit">
                <div className="inline-grid gap-2">
                  {seatRows.map((row) => {
                    const isCoupleRow = row.isCoupleRow;
                    const rowSeatsCount = row.seats.length;
                    const standardSeatsCount = room.seatsPerRow;

                    let leftPadding = 0;
                    if (isCoupleRow) {
                      const standardWidth = standardSeatsCount * (standardSeatWidth + 8);
                      const coupleWidth = rowSeatsCount * (coupleSeatWidth + 8);
                      const diff = standardWidth - coupleWidth;
                      leftPadding = Math.max(0, diff / 2);
                    }

                    return (
                      <div
                        key={row.label}
                        className="grid grid-cols-[28px_auto_28px] items-center gap-3"
                      >
                        <div className="text-center text-[11px] font-semibold text-zinc-400">
                          {row.label}
                        </div>

                        <div className="flex justify-center">
                          <div
                            className="grid auto-cols-max grid-flow-col gap-2"
                            style={{
                              paddingLeft: leftPadding > 0 ? `${leftPadding}px` : 0,
                              paddingRight: leftPadding > 0 ? `${leftPadding}px` : 0,
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

                              return (
                                <div
                                  key={seat.id}
                                  className={[base, style, cursor].join(" ")}
                                  title={
                                    isMaintenance
                                      ? `${seat.label} (Bảo trì)`
                                      : seat.isCouple
                                        ? `${seat.label} (Ghế Đôi - 2 chỗ)`
                                        : seat.label
                                  }
                                  aria-label={seat.label}
                                  onClick={() => handleSeatClick(seat.id)}
                                >
                                  {seat.isCouple && (
                                    <>
                                      <span className="text-[10px]">👥</span>
                                      <span className="text-[8px] text-zinc-400">2</span>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-center text-[11px] font-semibold text-zinc-400">
                          {row.label}
                        </div>
                      </div>
                    );
                  })}

                  {/* Column numbers */}
                  <div className="grid grid-cols-[28px_auto_28px] items-center gap-3 pt-2">
                    <div />
                    <div className="flex justify-center">
                      <div className="grid auto-cols-max grid-flow-col gap-2 text-center text-[11px] font-semibold text-zinc-400">
                        {seatRows[0]?.isCoupleRow
                          ? (() => {
                              const firstRow = seatRows[0];
                              const standardWidth = room.seatsPerRow * (standardSeatWidth + 8);
                              const coupleWidth = firstRow.seats.length * (coupleSeatWidth + 8);
                              const diff = standardWidth - coupleWidth;
                              const leftPadding = Math.max(0, diff / 2);
                              
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
                          : Array.from({ length: room.seatsPerRow }, (_, i) => (
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

          <div className="mt-5 flex items-center justify-between border-t border-zinc-700 pt-3">
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
    </StaffCenteredModalShell>
  );
}

function RoomConfigModal({ mode, cinemaName, initialRoom, onClose, onSave }) {
  const [name, setName] = useState(initialRoom?.name ?? "");
  const [type, setType] = useState(initialRoom?.type ?? "2D");
  const [rows, setRows] = useState(String(initialRoom?.rows ?? 10));
  const [seatsPerRow, setSeatsPerRow] = useState(
    String(initialRoom?.seatsPerRow ?? 12),
  );
  const [vipRows, setVipRows] = useState(
    (initialRoom?.vipRows ?? [5, 6]).join(","),
  );
  const [coupleRow, setCoupleRow] = useState(
    String(initialRoom?.coupleRow ?? 10),
  );
  const [status, setStatus] = useState(initialRoom?.status ?? "active");

  const parsedRows = Math.max(1, Number(rows) || 1);
  const parsedSeatsPerRow = Math.max(1, Number(seatsPerRow) || 1);
  const totalSeats = parsedRows * parsedSeatsPerRow;

  const title = mode === "create" ? "Thêm phòng chiếu" : "Cấu hình phòng chiếu";
  const primaryLabel = mode === "create" ? "Thêm phòng" : "Lưu cấu hình";

  return (
    <StaffCenteredModalShell
      title={title}
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <Field label="Tên phòng">
            <TextInput
              value={name}
              onChange={setName}
              placeholder={mode === "create" ? "Nhập tên phòng" : ""}
            />
          </Field>

          <Field label="Số hàng ghế">
            <TextInput value={rows} onChange={setRows} />
          </Field>

          <Field label="Hàng VIP (số hàng, phân cách phẩy)">
            <TextInput value={vipRows} onChange={setVipRows} />
          </Field>

          <Field label="Trạng thái">
            <SelectInput
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Tạm dừng" },
              ]}
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label="Loại phòng">
            <SelectInput
              value={type}
              onChange={setType}
              options={[
                { value: "2D", label: "2D" },
                { value: "3D", label: "3D" },
                { value: "IMAX", label: "IMAX" },
                { value: "4DX", label: "4DX" },
              ]}
            />
          </Field>

          <Field label="Số ghế mỗi hàng">
            <TextInput value={seatsPerRow} onChange={setSeatsPerRow} />
          </Field>

          <Field
            label="Hàng Couple (để trống nếu không có)"
            hint="Nhập số hàng (vd: 10)"
          >
            <TextInput value={coupleRow} onChange={setCoupleRow} />
          </Field>

          <div className="rounded-2xl border border-zinc-700 bg-cinema-primary/10 p-4">
            <div className="text-xs font-semibold text-zinc-400">
              Tổng ghế ước tính
            </div>
            <div className="mt-2 text-3xl font-black text-cinema-primary">
              {totalSeats}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{cinemaName}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-2xl border border-zinc-700 bg-zinc-900/40 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => {
            const payload = {
              ...initialRoom,
              name: name.trim() || initialRoom?.name || "Phòng mới",
              type,
              rows: parsedRows,
              seatsPerRow: parsedSeatsPerRow,
              vipRows: parseRowList(vipRows),
              coupleRow: Number(coupleRow) ? Number(coupleRow) : null,
              status,
            };
            onSave(payload);
          }}
          className="h-11 rounded-2xl bg-cinema-primary text-sm font-semibold text-white hover:opacity-95"
        >
          {primaryLabel}
        </button>
      </div>
    </StaffCenteredModalShell>
  );
}

function MiniSeatPreview({
  rows,
  seatsPerRow,
  vipRows,
  coupleRow,
  maintenanceSeats,
}) {
  const previewRows = Math.min(rows, 6);
  const remaining = Math.max(0, rows - previewRows);
  const grid = useMemo(() => {
    return buildSeatGrid({
      rows: previewRows,
      seatsPerRow,
      vipRows,
      coupleRow,
    });
  }, [previewRows, seatsPerRow, vipRows, coupleRow]);

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950/15 p-3">
      <div className="text-center text-[10px] font-semibold tracking-widest text-zinc-400">
        — Màn hình —
      </div>
      <div className="mt-3 flex justify-center">
        <div className="inline-grid gap-1">
          {grid.map((row) => (
            <div key={row.label} className="flex justify-center gap-1 mb-1">
              {row.seats.map((seat) => {
                const isMaint =
                  maintenanceSeats && maintenanceSeats.has(seat.id);
                const color = isMaint
                  ? "bg-red-500"
                  : seat.type === "vip"
                    ? "bg-amber-500"
                    : seat.type === "couple"
                      ? "bg-fuchsia-500"
                      : "bg-zinc-400/30";
                return (
                  <div
                    key={seat.id}
                    className={[
                      "h-2 rounded-[3px] border border-zinc-700/50",
                      seat.isCouple ? "w-5" : "w-2.5",
                      color,
                    ].join(" ")}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {remaining ? (
        <div className="mt-2 text-center text-[10px] font-semibold text-zinc-400">
          ... {remaining} hàng nữa
        </div>
      ) : null}
    </div>
  );
}

function RoomCard({
  cinemaName,
  room,
  onView,
  onConfig,
  onDelete,
  maintenanceSeats,
}) {
  const total = room.rows * room.seatsPerRow;
  const vipCount = room.vipRows.length;
  const isInactive = room.status !== "active";

  return (
    <div
      className={[
        "cinema-surface rounded-2xl border border-zinc-700 p-4",
        isInactive ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-base font-bold">{room.name}</div>
            <Badge className="border-zinc-700 bg-zinc-900/40 text-zinc-200">
              {room.type}
            </Badge>
          </div>
          <div className="mt-1 truncate text-xs text-zinc-400">
            {cinemaName}
          </div>
        </div>

        <Badge
          className={[
            "border-zinc-700",
            room.status === "active"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400",
          ].join(" ")}
        >
          {room.status === "active" ? "Hoạt động" : "Tạm dừng"}
        </Badge>
      </div>

      <div className="mt-4">
        <MiniSeatPreview
          rows={room.rows}
          seatsPerRow={room.seatsPerRow}
          vipRows={room.vipRows}
          coupleRow={room.coupleRow}
          maintenanceSeats={maintenanceSeats}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/10 p-3 text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-[11px] font-semibold text-zinc-400">
            Tổng ghế
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/10 p-3 text-center">
          <div className="text-lg font-bold">
            {room.rows}×{room.seatsPerRow}
          </div>
          <div className="text-[11px] font-semibold text-zinc-400">
            Hàng × Cột
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/10 p-3 text-center">
          <div className="text-lg font-bold">{vipCount}</div>
          <div className="text-[11px] font-semibold text-zinc-400">
            Hàng VIP
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={isInactive ? undefined : onView}
          disabled={isInactive}
          className={[
            "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-700 text-sm font-semibold",
            isInactive
              ? "cursor-not-allowed bg-zinc-800/30 text-zinc-400"
              : "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15",
          ].join(" ")}
          title={isInactive ? "Phòng đang tạm dừng — không thể xem sơ đồ" : ""}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Xem sơ đồ
        </button>

        <button
          type="button"
          onClick={onConfig}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-sky-500/10 text-sm font-semibold text-sky-300 hover:bg-sky-500/15"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Cấu hình
        </button>

        <StaffIconButton label="Xóa" onClick={onDelete} variant="danger">
          <Trash2 className="h-4 w-4" />
        </StaffIconButton>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900 disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-cinema-primary px-3 text-sm font-bold text-white">
        {page}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900 disabled:opacity-40"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function StaffRoomsPage() {
  const { user } = useAuth();
  // Cố định rạp theo phân quyền của admin
  const selectedCinemaId = useMemo(() => String(user?.cinema_id || ""), [user?.cinema_id]);
  const { subtitle } = useOutletContext();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  // const cinemaName = useMemo(() => {
  //   if (rooms.length > 0) {
  //     return rooms[0].cinemaName || "";
  //   }
  //   return "";
  // }, [rooms]);
  useEffect(() => {
    loadRooms();
  }, []);
  const cinemaList = useMemo(() => {
    const map = new Map();

    rooms.forEach((r) => {
      if (!map.has(r.cinemaId)) {
        map.set(r.cinemaId, {
          value: r.cinemaId,
          label: r.cinemaName,
        });
      }
    });

    return Array.from(map.values());
  }, [rooms]);

  const loadRooms = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/rooms");
      const data = await res.json();

      const roomsData = Array.isArray(data) ? data : data.data || [];

      // ✅ KHÔNG MAP LẠI SAI FIELD NỮA
      const mapped = roomsData.map((r) => ({
        id: r.id,
        cinemaId: r.cinemaId,
        cinemaName: r.cinemaName,
        name: r.name,
        type: r.type,
        rows: r.rows,
        seatsPerRow: r.cols, // 🔥 đổi từ cols
        vipRows: r.vipRows || [],
        coupleRow: r.coupleRow,
        status: r.status,
      }));

      setRooms(mapped);
    } catch (err) {
      console.error("Load rooms error:", err);
    } finally {
      setLoading(false);
    }
  };

  const staffRooms = useMemo(() => {
    if (!selectedCinemaId) return rooms;

    return rooms.filter((r) => String(r.cinemaId) === String(selectedCinemaId));
  }, [rooms, selectedCinemaId]);

  const totals = useMemo(() => {
    const byType = { "2D": 0, "3D": 0, IMAX: 0, "4DX": 0 };
    staffRooms.forEach((r) => {
      if (byType[r.type] != null) byType[r.type] += 1;
    });
    return {
      total: staffRooms.length,
      ...byType,
    };
  }, [staffRooms]);

  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(staffRooms.length / pageSize));
  const pagedRooms = staffRooms.slice((page - 1) * pageSize, page * pageSize);

  const [seatRoom, setSeatRoom] = useState(null);
  const [configRoom, setConfigRoom] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(null);

  // Map of roomId -> Set of maintenance seat IDs
  const [maintenanceMap, setMaintenanceMap] = useState(() => new Map());

  const handleToggleMaintenance = useCallback((roomId, seatId) => {
    setMaintenanceMap((prev) => {
      const next = new Map(prev);
      const seats = new Set(next.get(roomId) ?? []);
      if (seats.has(seatId)) {
        seats.delete(seatId);
      } else {
        seats.add(seatId);
      }
      next.set(roomId, seats);
      return next;
    });
  }, []);
  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Phòng chiếu & Ghế</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tổng: {totals.total} phòng chiếu
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateDraft({
              id: makeId("room"),
              cinemaId: selectedCinemaId || cinemaList[0]?.value,
              name: "",
              type: "2D",
              rows: 10,
              seatsPerRow: 12,
              vipRows: [5, 6],
              coupleRow: 10,
              status: "active",
            });
            setCreateOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-2xl bg-cinema-primary px-4 text-sm font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm phòng
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatPill
          count={totals["2D"]}
          label="2D"
          colorClassName="bg-cyan-500/15 text-cyan-300"
        />
        <StatPill
          count={totals["3D"]}
          label="3D"
          colorClassName="bg-violet-500/15 text-violet-300"
        />
        <StatPill
          count={totals.IMAX}
          label="IMAX"
          colorClassName="bg-amber-500/15 text-amber-300"
        />
        <StatPill
          count={totals["4DX"]}
          label="4DX"
          colorClassName="bg-cinema-primary/15 text-cinema-primary"
        />
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/40 px-4 py-2.5 shadow-sm">
        <Building2 className="h-4 w-4 text-cinema-primary" />
        <span className="text-sm font-bold text-white">
          Rạp: {user?.cinema_name || "Chưa được phân quyền quản lý"}
        </span>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {pagedRooms.map((room) => (
          <RoomCard
            key={room.id}
            cinemaName={room.cinemaName} // ✅ FIX CHUẨN
            room={room}
            maintenanceSeats={maintenanceMap.get(room.id) ?? new Set()}
            onView={() => setSeatRoom(room)}
            onConfig={() => setConfigRoom(room)}
            onDelete={async () => {
              try {
                const token = await getAuth().currentUser?.getIdToken();
                const res = await fetch(
                  `http://localhost:5000/api/rooms/${room.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );

                if (!res.ok) throw new Error("Delete failed");

                await loadRooms();
              } catch (err) {
                console.error(err);
              }
            }}
          />
        ))}
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />

      {seatRoom ? (
        <SeatMapModal
          room={seatRoom}
          cinemaName={seatRoom?.cinemaName}
          maintenanceSeats={maintenanceMap.get(seatRoom.id) ?? new Set()}
          onToggleMaintenance={handleToggleMaintenance}
          onClose={() => setSeatRoom(null)}
        />
      ) : null}

      {configRoom ? (
        <RoomConfigModal
          mode="edit"
          cinemaName={configRoom?.cinemaName}
          initialRoom={configRoom}
          onClose={() => setConfigRoom(null)}
          onSave={async (nextRoom) => {
            try {
              const token = await getAuth().currentUser?.getIdToken();
              const res = await fetch(
                `http://localhost:5000/api/rooms/${nextRoom.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    name: nextRoom.name,
                    type: nextRoom.type,
                    seat_rows: nextRoom.rows,
                    seat_cols: nextRoom.seatsPerRow,
                    vip_rows: JSON.stringify(nextRoom.vipRows || []),
                    couple_row: nextRoom.coupleRow,
                    total_seats: nextRoom.rows * nextRoom.seatsPerRow,
                    status: nextRoom.status,
                  }),
                },
              );

              if (!res.ok) throw new Error("Update failed");

              await loadRooms();
              setConfigRoom(null);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      ) : null}

      {createOpen && createDraft ? (
        <RoomConfigModal
          mode="create"
          cinemaName={
            cinemaList.find((c) => c.value === selectedCinemaId)?.label || ""
          }
          initialRoom={createDraft}
          onClose={() => {
            setCreateOpen(false);
            setCreateDraft(null);
          }}
          onSave={async (nextRoom) => {
            try {
              const token = await getAuth().currentUser?.getIdToken();
              const res = await fetch("http://localhost:5000/api/rooms", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  cinema_id: nextRoom.cinemaId,
                  name: nextRoom.name,
                  type: nextRoom.type,
                  seat_rows: nextRoom.rows,
                  seat_cols: nextRoom.seatsPerRow,
                  vip_rows: JSON.stringify(nextRoom.vipRows),
                  couple_row: nextRoom.coupleRow,
                  total_seats: nextRoom.rows * nextRoom.seatsPerRow,
                  status: nextRoom.status,
                }),
              });

              if (!res.ok) throw new Error("Create failed");

              await loadRooms();
              setCreateOpen(false);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      ) : null}
    </div>
  );
}

export default StaffRoomsPage;
