import { useMemo, useEffect, useRef } from "react";
import {
  Monitor,
  AlertTriangle,
  Plus,
  Sparkles
} from "lucide-react";

// Định nghĩa thời gian dọn dẹp theo loại phòng
const CLEANING_TIME_BY_ROOM_TYPE = {
  "2D": 15,
  "3D": 15,
  "4DX": 20,
  "IMAX": 30,
};

// Cấu hình bảng màu đa dạng cho các bộ phim khác nhau (giống trong hình ảnh)
const MOVIE_COLORS = [
  { bg: "bg-[#778beb]", text: "text-white", border: "border-[#6275d8]" }, // Doraemon - Tông tím xanh nhạt
  { bg: "bg-[#3867d6]", text: "text-white", border: "border-[#2653b8]" }, // Lật Mặt 7 - Xanh dương đậm
  { bg: "bg-[#2bcb78]", text: "text-white", border: "border-[#1ca85e]" }, // Inside Out 2 - Xanh lá
  { bg: "bg-[#ffb03b]", text: "text-white", border: "border-[#e09428]" }, // Avengers - Vàng cam
  { bg: "bg-[#2d98da]", text: "text-white", border: "border-[#1b7db8]" }, // Conan - Xanh ngọc
  { bg: "bg-[#a55eea]", text: "text-white", border: "border-[#8a42cf]" }, // Tông Tím sáng
];

// Hàm hash tên phim để gán màu cố định cho phim đó
function getMovieColor(movieId, movieTitle) {
  const str = String(movieId || movieTitle || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MOVIE_COLORS.length;
  return MOVIE_COLORS[index];
}

// Khung thời gian từ 06:00 sáng đến 02:00 sáng hôm sau (20 tiếng = 1200 phút)
const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 26; // 02:00 sáng hôm sau quy đổi thành 26h
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60; // 1200 phút
const HOUR_WIDTH_PX = 120; // Mỗi tiếng rộng 100px (gọn gàng hơn)
const ROOM_COL_WIDTH_PX = 200; // Cột phòng rộng 200px
const TOTAL_TIMELINE_WIDTH_PX = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_WIDTH_PX;

// Chuyển đổi HH:MM thành số phút từ TIMELINE_START_HOUR
function timeToMinutesOffset(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  let hour = h;
  if (h < TIMELINE_START_HOUR) {
    hour = h + 24; // Qua ngày mới
  }
  const totalMinutes = hour * 60 + m;
  return Math.max(0, totalMinutes - TIMELINE_START_HOUR * 60);
}

export default function StaffShowtimeTimeline({
  showtimes = [],
  rooms = [],
  selectedDate,
  onEditShowtime,
  onAddShowtimeAtTime,
}) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handleRightScroll = (e) => {
    if (leftRef.current) {
      leftRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleLeftWheel = (e) => {
    if (rightRef.current) {
      rightRef.current.scrollTop += e.deltaY;
    }
  };



  // 2. Tạo thước đo thời gian cách mỗi 1 tiếng (06:00, 07:00, 08:00, ...)
  const hoursRuler = useMemo(() => {
    const hours = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      const displayHour = h >= 24 ? h - 24 : h;
      hours.push({
        label: `${String(displayHour).padStart(2, "0")}:00`,
        offsetMinutes: (h - TIMELINE_START_HOUR) * 60,
      });
    }
    return hours;
  }, []);

  // 3. Phân nhóm và phát hiện xung đột
  const processedShowtimes = useMemo(() => {
    const dateShowtimes = showtimes.filter((st) => st.date === selectedDate);
    const roomGroups = {};

    dateShowtimes.forEach((st) => {
      if (!roomGroups[st.roomId]) roomGroups[st.roomId] = [];
      roomGroups[st.roomId].push({ ...st });
    });

    Object.keys(roomGroups).forEach((roomId) => {
      const sorted = roomGroups[roomId].sort(
        (a, b) => timeToMinutesOffset(a.startTime) - timeToMinutesOffset(b.startTime)
      );

      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const startOffset = timeToMinutesOffset(current.startTime);
        const duration = Number(current.duration) || 120;

        current.timelineLeft = (startOffset / TOTAL_MINUTES) * 100;
        current.timelineWidth = (duration / TOTAL_MINUTES) * 100;

        const roomType = current.format || "2D";
        const requiredCleaning = CLEANING_TIME_BY_ROOM_TYPE[roomType] || 15;
        current.requiredCleaning = requiredCleaning;
        current.timelineCleaningWidth = (requiredCleaning / TOTAL_MINUTES) * 100;

        if (i < sorted.length - 1) {
          const next = sorted[i + 1];
          const currentEndOffset = startOffset + duration;
          const nextStartOffset = timeToMinutesOffset(next.startTime);
          const gap = nextStartOffset - currentEndOffset;

          if (gap < 0) {
            next.conflictType = "overlap";
          } else if (gap < requiredCleaning) {
            next.conflictType = "cleaning_shortage";
            next.actualGap = gap;
            next.requiredCleaning = requiredCleaning;
          }
        }
      }
    });

    return roomGroups;
  }, [showtimes, selectedDate]);

  // Cuộn đến suất chiếu đầu tiên
  useEffect(() => {
    if (rightRef.current) {
      const allOffsets = showtimes
        .filter((st) => st.date === selectedDate)
        .map((st) => timeToMinutesOffset(st.startTime));
      if (allOffsets.length > 0) {
        const firstOffset = Math.min(...allOffsets);
        const scrollTarget = (firstOffset / TOTAL_MINUTES) * TOTAL_TIMELINE_WIDTH_PX - 200;
        rightRef.current.scrollLeft = Math.max(0, scrollTarget);
      }
    }
  }, [selectedDate, showtimes]);

  return (
    <div className="flex flex-col text-zinc-100 font-sans space-y-6">

      {/* ================= THANH ĐẦU TRANG (HEADER BAR) ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Tiêu đề & Chọn ngày */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-sm">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {(() => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const dd = String(today.getDate()).padStart(2, "0");
                const todayStr = `${yyyy}-${mm}-${dd}`;

                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
                const yyyyY = yesterday.getFullYear();
                const mmY = String(yesterday.getMonth() + 1).padStart(2, "0");
                const ddY = String(yesterday.getDate()).padStart(2, "0");
                const yesterdayStr = `${yyyyY}-${mmY}-${ddY}`;

                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
                const yyyyT = tomorrow.getFullYear();
                const mmT = String(tomorrow.getMonth() + 1).padStart(2, "0");
                const ddT = String(tomorrow.getDate()).padStart(2, "0");
                const tomorrowStr = `${yyyyT}-${mmT}-${ddT}`;

                const parts = (selectedDate || todayStr).split("-");
                const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;

                if (selectedDate === todayStr) {
                  return `Lịch Suất Chiếu Hôm Nay - ${formattedDate}`;
                } else if (selectedDate === yesterdayStr) {
                  return `Lịch Suất Chiếu Hôm Qua - ${formattedDate}`;
                } else if (selectedDate === tomorrowStr) {
                  return `Lịch Suất Chiếu Ngày Mai - ${formattedDate}`;
                } else {
                  return `Lịch Suất Chiếu Ngày ${formattedDate}`;
                }
              })()}
            </h2>
          </div>
        </div>
      </div>
      <div
        className="flex border border-slate-200 rounded-3xl bg-white shadow-lg overflow-hidden"
        style={{ maxHeight: "550px" }}
      >
        {/* CỘT PHÒNG CHIẾU CỐ ĐỊNH (LEFT PANE) */}
        <div
          ref={leftRef}
          onWheel={handleLeftWheel}
          className="w-[200px] shrink-0 overflow-hidden border-r border-slate-200 flex flex-col bg-white select-none"
        >
          {/* Tiêu đề góc phòng chiếu */}
          <div className="h-14 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs tracking-wider uppercase">
            Phòng chiếu
          </div>
          {/* Danh sách phòng */}
          <div className="divide-y divide-slate-100 flex-1">
            {rooms.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs italic px-2 text-center">
                Không có phòng
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="h-24 px-4 py-3 flex items-center bg-white"
                >
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mr-3 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-sm font-bold text-slate-800 tracking-tight truncate">
                      {room.name}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {room.total_seats || room.capacity || 100} ghế
                    </span>
                    <span className="inline-flex w-fit items-center rounded-lg bg-indigo-50/80 px-1.5 py-0.5 text-[9px] font-bold text-indigo-500 border border-indigo-100/50 mt-1 uppercase">
                      {room.type || "2D"}
                    </span>
                  </div>

                  {/* Nút cộng suất chiếu nhỏ ẩn bên trong */}
                  <button
                    onClick={() => onAddShowtimeAtTime(room.id, "09:00")}
                    className="p-1 rounded-lg border border-slate-200 hover:border-indigo-200 bg-white ml-auto hover:bg-indigo-50 transition shrink-0"
                    title="Thêm suất chiếu"
                  >
                    <Plus className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DÒNG THỜI GIAN CUỘN NGANG & DỌC (RIGHT PANE) */}
        <div
          ref={rightRef}
          onScroll={handleRightScroll}
          className="flex-1 overflow-auto custom-scrollbar relative bg-white"
        >
          <div
            className="relative flex flex-col bg-white"
            style={{ width: `${TOTAL_TIMELINE_WIDTH_PX}px` }}
          >
            {/* Thước đo giờ */}
            <div className="h-14 bg-[#f8fafc] border-b border-slate-200 relative flex sticky top-0 z-30">
              {hoursRuler.map((hour) => {
                const leftPx = (hour.offsetMinutes / TOTAL_MINUTES) * TOTAL_TIMELINE_WIDTH_PX;
                return (
                  <div
                    key={hour.label}
                    className="absolute top-0 bottom-0 border-l border-slate-200/50 flex items-center justify-center"
                    style={{ left: `${leftPx}px`, width: `${HOUR_WIDTH_PX}px` }}
                  >
                    <span className="text-[12px] font-bold text-slate-700">{hour.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Lưới nền kẻ dọc */}
            <div
              className="absolute top-14 bottom-0 left-0 right-0 pointer-events-none"
            >
              {hoursRuler.map((hour) => {
                const leftPos = (hour.offsetMinutes / TOTAL_MINUTES) * 100;
                return (
                  <div
                    key={`grid-line-${hour.label}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-slate-200"
                    style={{ left: `${leftPos}%` }}
                  />
                );
              })}
            </div>

            {/* Danh sách suất chiếu tương ứng với các phòng */}
            <div className="divide-y divide-slate-100 bg-white relative z-10">
              {rooms.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm italic">
                  Chưa cấu hình phòng chiếu nào cho rạp này.
                </div>
              ) : (
                rooms.map((room, roomIdx) => {
                  const roomShowtimes = processedShowtimes[room.id] || [];
                  const isFirstOrSecondRoom = roomIdx < 2;
                  return (
                    <div
                      key={room.id}
                      className="h-24 relative flex items-center cursor-pointer hover:bg-slate-50/10 hover:z-20 transition-colors"
                      style={{ width: `${TOTAL_TIMELINE_WIDTH_PX}px` }}
                      onDoubleClick={(e) => {
                        if (e.target !== e.currentTarget) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickPercent = clickX / rect.width;
                        const clickMinutes = clickPercent * TOTAL_MINUTES;
                        const totalTargetMinutes = TIMELINE_START_HOUR * 60 + clickMinutes;

                        const roundedMinutes = Math.round(totalTargetMinutes / 15) * 15;
                        const finalHours = Math.floor(roundedMinutes / 60) % 24;
                        const finalMinutes = roundedMinutes % 60;

                        const timeStr = `${String(finalHours).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
                        onAddShowtimeAtTime(room.id, timeStr);
                      }}
                    >
                      {/* Suất chiếu */}
                      {roomShowtimes.map((st) => {
                        const isCancelled = st.status === "cancelled";
                        const movieColor = getMovieColor(st.movieId, st.movieTitle);

                        const hasOverlap = st.conflictType === "overlap";
                        const hasCleaningAlert = st.conflictType === "cleaning_shortage";

                        let borderStyle = movieColor.border;
                        if (hasOverlap) {
                          borderStyle = "border-red-500 ring-2 ring-red-300 animate-pulse";
                        }

                        return (
                          <div key={st.id} className="absolute inset-y-0 flex items-center z-10 hover:z-30">
                            {/* KHỐI SUẤT CHIẾU CHÍNH */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditShowtime(st);
                              }}
                              className={`absolute h-14 z-10 hover:z-20 rounded-2xl border px-3 py-2 text-xs transition-all duration-200 cursor-pointer flex flex-col justify-center shadow-sm group/card hover:scale-[1.02] hover:shadow-md ${movieColor.bg} ${movieColor.text} ${borderStyle}`}
                              style={{
                                  left: `${(st.timelineLeft / 100) * TOTAL_TIMELINE_WIDTH_PX}px`,
                                  width: `${(st.timelineWidth / 100) * TOTAL_TIMELINE_WIDTH_PX}px`,
                              }}
                            >
                              <div className="font-bold truncate text-[12px] flex items-center gap-1">
                                {st.isSpecial && <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />}
                                {st.movieTitle}
                              </div>
                              <div className="text-[10px] text-white/80 font-medium flex justify-between items-center mt-1">
                                <span>{st.startTime} - {st.end?.slice(11, 16)} ({st.duration}p)</span>
                                {st.bookedCount > 0 && (
                                  <span className="bg-white/20 px-1 rounded text-[8px] font-bold">
                                    🎟️{st.bookedCount}
                                  </span>
                                )}
                              </div>

                              {/* HOVER TOOLTIP CARD */}
                              <div className={`pointer-events-none absolute invisible group-hover/card:visible z-[60] bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-2xl w-64 shadow-xl text-xs left-1/2 -translate-x-1/2 whitespace-normal leading-relaxed ${
                                isFirstOrSecondRoom ? "top-[68px]" : "-top-[170px]"
                              }`}>
                                <div className="font-bold text-white text-sm mb-1">{st.movieTitle}</div>
                                <div className="space-y-0.5 mt-2 text-slate-300">
                                  <div>⏱️ Suất chiếu: <strong>{st.startTime} - {st.end?.slice(11, 16)}</strong> ({st.duration}p)</div>
                                  <div>🚪 Phòng chiếu: <strong>{room.name} ({room.type || "2D"})</strong></div>
                                  <div>🎟️ Vé đã đặt: <strong>{st.bookedCount} vé</strong></div>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                                  <span className="text-slate-500">Trạng thái:</span>
                                  <span className={`font-bold ${isCancelled ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {st.status === "scheduled" ? "Sắp chiếu" : st.status === "ongoing" ? "Đang chiếu" : isCancelled ? "Đã hủy" : "Đã xong"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* KHỐI DỌN DẸP PHÒNG */}
                            {!isCancelled && (
                              <div
                                className={`absolute h-14 z-0 rounded-xl flex flex-col items-center justify-center font-bold text-[9px] leading-tight text-center py-1 px-0.5 overflow-hidden transition-colors ${hasCleaningAlert
                                  ? "bg-amber-100 border border-amber-300 text-amber-600 animate-pulse"
                                  : "bg-[#fff1f2] border border-[#ffe4e6] text-[#ef4444]"
                                  }`}
                                style={{
                                  left: `${((st.timelineLeft + st.timelineWidth) / 100) * TOTAL_TIMELINE_WIDTH_PX}px`,
                                  width: `${(st.timelineCleaningWidth / 100) * TOTAL_TIMELINE_WIDTH_PX}px`,
                                }}
                                title={
                                  hasCleaningAlert
                                    ? `⚠️ Cảnh báo: Thiếu giờ dọn phòng! Yêu cầu: ${st.requiredCleaning}p, Thực tế: ${Math.round(st.actualGap)}p.`
                                    : `Dọn phòng quy định: ${st.requiredCleaning} phút.`
                                }
                              >
                                {st.timelineCleaningWidth < 2 ? (
                                  <div className="scale-[0.85] flex flex-col items-center justify-center leading-none">
                                    <span className="text-[8.5px]">Dọn</span>
                                    <span className="text-[7.5px] mt-0.5 font-extrabold">
                                      {hasCleaningAlert ? `${Math.round(st.actualGap)}p` : `${st.requiredCleaning}p`}
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <span>Dọn</span>
                                    <span>phòng</span>
                                    <span className="text-[8px] mt-0.5 font-bold">
                                      {hasCleaningAlert ? `${Math.round(st.actualGap)}p` : `${st.requiredCleaning}p`}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* CARD CẢNH BÁO OVERLAP */}
                            {hasOverlap && (
                              <div
                                className="absolute h-7 rounded-lg bg-red-600 border border-red-500 text-white flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold z-30 animate-bounce shadow-md"
                                style={{
                                  left: `${(st.timelineLeft / 100) * TOTAL_TIMELINE_WIDTH_PX}px`,
                                  top: "-20px",
                                }}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>TRÙNG GIỜ CHIẾU</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>



    </div>
  );
}
