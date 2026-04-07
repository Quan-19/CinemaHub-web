import { useCallback, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock4,
  Film,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { makeId } from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";

const STATUS_OPTIONS = [
  { value: "open", label: "Mở bán" },
  { value: "locked", label: "Khóa" },
];
const DEFAULT_LANGUAGE_OPTION = { value: "VIETSUB", label: "Phụ đề Việt" };

function normalizeStaffStatus(status) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "open" ||
    normalized === "available" ||
    normalized === "scheduled" ||
    normalized === "ongoing"
  ) {
    return "open";
  }

  if (
    normalized === "locked" ||
    normalized === "cancelled" ||
    normalized === "sold_out" ||
    normalized === "ended"
  ) {
    return "locked";
  }

  return "open";
}

function isPastCalendarDate(dateValue) {
  if (!dateValue) return false;

  const showDate = new Date(dateValue);
  if (Number.isNaN(showDate.getTime())) return false;

  showDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return showDate.getTime() < today.getTime();
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function normalizeLanguageOption(rawValue) {
  const raw = String(rawValue ?? "").trim();
  if (!raw) return DEFAULT_LANGUAGE_OPTION;

  const normalized = normalizeText(raw);

  if (
    normalized === "VI" ||
    normalized === "VIETSUB" ||
    normalized.includes("PHU DE VIET")
  ) {
    return { value: "VIETSUB", label: "Phụ đề Việt" };
  }

  if (normalized === "DUB" || normalized.includes("LONG TIENG VIET")) {
    return { value: "DUB", label: "Lồng tiếng Việt" };
  }

  if (
    normalized === "EN" ||
    normalized === "ENGLISH" ||
    normalized === "ENGSUB" ||
    normalized.includes("PHU DE ANH")
  ) {
    return { value: "ENGLISH", label: "Phụ đề Anh" };
  }

  return { value: raw, label: raw };
}

function extractLanguageOptionsFromMovie(movie = {}) {
  const rawSource = [movie.subtitle, movie.language].filter(Boolean).join(",");
  const tokens = rawSource
    .split(/[,/;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return [DEFAULT_LANGUAGE_OPTION];
  }

  const deduped = new Map();
  tokens.forEach((token) => {
    const option = normalizeLanguageOption(token);
    if (!deduped.has(option.value)) {
      deduped.set(option.value, option);
    }
  });

  return Array.from(deduped.values());
}

function dayRange(numDays = 7) {
  const today = new Date();
  return Array.from({ length: numDays }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const value = `${yyyy}-${mm}-${dd}`;
    const label = `${dd}/${mm}`;
    return { value, label, full: d };
  });
}

function formatTime(dtStr) {
  const d = new Date(dtStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function formatScheduleDateLabel(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return `Hôm nay (${date.toLocaleDateString("vi-VN")})`;
  }

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function durationToEnd(startIso, duration) {
  const [datePart, timePart] = startIso.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  const start = new Date(year, month - 1, day, hour, minute);
  const end = new Date(start);
  end.setMinutes(start.getMinutes() + duration);

  // Format back to YYYY-MM-DDTHH:MM:00
  const yyyy = end.getFullYear();
  const mm = String(end.getMonth() + 1).padStart(2, "0");
  const dd = String(end.getDate()).padStart(2, "0");
  const hh = String(end.getHours()).padStart(2, "0");
  const min = String(end.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

function StatusBadge({ status, isPast }) {
  if (isPast) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-700/30 px-2 py-1 text-[10px] font-semibold text-zinc-300">
        Hoàn thành
      </span>
    );
  }

  const isOpen = status === "open";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold",
        isOpen
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-zinc-600/20 text-zinc-300",
      ].join(" ")}
    >
      {isOpen ? "Mở bán" : "Khóa"}
    </span>
  );
}

function FilterChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-1 text-sm font-semibold transition",
        active
          ? "border-cinema-primary bg-cinema-primary/25 text-white shadow-[0_0_0_1px_rgba(229,9,20,0.5)]"
          : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// Calendar Component
function CalendarPicker({ selectedDate, onSelectDate, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const changeMonth = (increment) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + increment,
        1
      )
    );
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === new Date(selectedDate).toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleSelectDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onSelectDate(`${year}-${month}-${day}`);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 hover:bg-zinc-800 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="text-white font-semibold">
          {currentMonth.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 hover:bg-zinc-800 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const isSelectedDate = isSelected(date);
          const isTodayDate = isToday(date);
          const dayNumber = date.getDate();

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleSelectDate(date)}
              className={[
                "h-10 rounded-xl text-sm font-medium transition-all",
                isSelectedDate
                  ? "bg-cinema-primary text-white"
                  : isTodayDate
                  ? "bg-cinema-primary/20 text-cinema-primary border border-cinema-primary/30"
                  : "hover:bg-zinc-800 text-zinc-300",
              ].join(" ")}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <button
          onClick={() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            onSelectDate(`${year}-${month}-${day}`);
            onClose();
          }}
          className="w-full py-2 text-sm text-cinema-primary hover:bg-cinema-primary/10 rounded-xl transition"
        >
          Hôm nay
        </button>
      </div>
    </div>
  );
}

function ShowtimeCard({ showtime, onEdit, onDelete }) {
  const isPast = showtime.isPast;
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock4 className="h-5 w-5 text-cinema-primary" />
            <span>
              {formatTime(showtime.start)} – {formatTime(showtime.end)}
            </span>
            <StatusBadge status={showtime.status} isPast={isPast} />
          </div>
          <div className="text-sm font-semibold text-white">
            {showtime.movieTitle}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {showtime.format}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {showtime.room}
            </span>
            <span>{showtime.language}</span>
            <span>{showtime.duration} phút</span>
          </div>
        </div>

        {isPast ? (
          <span className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-xs font-semibold text-zinc-400">
            Suất chiếu đã hoàn thành
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm font-semibold text-cinema-primary hover:bg-zinc-900"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EditShowtimeModal({
  mode = "create",
  initial,
  movies = [],
  rooms = [],
  languageOptions = [],
  onSave,
  onCancel,
}) {
  const [movieId, setMovieId] = useState(initial.movieId);
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.startTime);
  const [duration, setDuration] = useState(initial.duration);
  const [roomId, setRoomId] = useState(initial.roomId || rooms[0]?.id || "");
  const format = initial.format;
  const [language, setLanguage] = useState(
    initial.languageCode ||
      initial.language ||
      languageOptions[0]?.value ||
      DEFAULT_LANGUAGE_OPTION.value
  );
  const [isSpecial, setIsSpecial] = useState(
    Boolean(initial.isSpecial || initial.special || initial.is_special || false)
  );
  const [status, setStatus] = useState(normalizeStaffStatus(initial.status));
  const [error, setError] = useState(null);

  const movieOptions = useMemo(() => {
    return movies.map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
      languageOptions:
        m.languageOptions?.length > 0
          ? m.languageOptions
          : [DEFAULT_LANGUAGE_OPTION],
    }));
  }, [movies]);

  const selectedMovie = movieOptions.find(
    (m) => String(m.id) === String(movieId)
  );
  const durationNumber = Number(duration) || (selectedMovie?.duration ?? 0);

  const modalLanguageOptions = useMemo(() => {
    const source =
      selectedMovie?.languageOptions?.length > 0
        ? selectedMovie.languageOptions
        : languageOptions;

    return source.length > 0 ? source : [DEFAULT_LANGUAGE_OPTION];
  }, [selectedMovie, languageOptions]);

  const roomOptions = useMemo(() => {
    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.type,
      label: room.type ? `${room.name} - ${room.type}` : room.name,
    }));
  }, [rooms]);

  const resolvedRoomId = useMemo(() => {
    const hasSelectedRoom = roomOptions.some(
      (room) => String(room.id) === String(roomId)
    );
    return hasSelectedRoom ? roomId : roomOptions[0]?.id || "";
  }, [roomId, roomOptions]);

  const resolvedLanguage = useMemo(() => {
    const hasSelectedLanguage = modalLanguageOptions.some(
      (option) => String(option.value) === String(language)
    );
    return hasSelectedLanguage
      ? language
      : modalLanguageOptions[0]?.value || DEFAULT_LANGUAGE_OPTION.value;
  }, [language, modalLanguageOptions]);

  // ✅ Validate duration to prevent negative numbers
  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value);
    if (value < 0) {
      setDuration(0);
    } else if (value > 480) {
      setDuration(480); // Max 8 hours
    } else {
      setDuration(value);
    }
  };

  const handleSave = () => {
    if (!movieId || !date || !start || !roomId || !format || !language) {
      setError("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }

    // ✅ Validate duration
    if (durationNumber <= 0) {
      setError("Thời lượng phải lớn hơn 0");
      return;
    }

    const startIso = `${date}T${start}:00`;
    const endIso = durationToEnd(startIso, durationNumber);

    // ✅ Check if end time is on the same day (optional warning)
    const endDate = new Date(endIso);
    const startDate = new Date(startIso);
    if (endDate.getDate() !== startDate.getDate()) {
      // Show warning but still allow
      if (
        !window.confirm(
          "Suất chiếu sẽ kéo dài sang ngày hôm sau. Bạn có chắc không?"
        )
      ) {
        return;
      }
    }

    const selectedRoom = roomOptions.find(
      (room) => String(room.id) === String(resolvedRoomId)
    );

    onSave({
      ...initial,
      movieId,
      movieTitle: selectedMovie?.title || initial.movieTitle,
      date,
      start: startIso,
      end: endIso,
      startTime: start,
      duration: durationNumber,
      roomId: resolvedRoomId,
      room: selectedRoom?.name || initial.room,
      format: selectedRoom?.type || format,
      language: resolvedLanguage,
      languageLabel: normalizeLanguageOption(resolvedLanguage).label,
      isSpecial,
      special: isSpecial,
      status,
    });
  };

  return (
    <StaffCenteredModalShell
      title={mode === "create" ? "Thêm suất chiếu" : "Chỉnh sửa suất chiếu"}
      onClose={onCancel}
      maxWidthClassName="max-w-3xl"
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400">Phim</div>
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40">
              <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2 text-sm text-zinc-400">
                <Search className="h-4 w-4" /> Chọn phim
              </div>
              <div className="max-h-56 overflow-auto">
                {movieOptions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMovieId(m.id);
                      setDuration(m.duration || "");
                      if (m.languageOptions?.length > 0) {
                        setLanguage(m.languageOptions[0].value);
                      }
                    }}
                    className={[
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
                      String(movieId) === String(m.id)
                        ? "bg-cinema-primary/15 text-white"
                        : "hover:bg-zinc-900/60 text-zinc-200",
                    ].join(" ")}
                  >
                    <span className="truncate">{m.title}</span>
                    <span className="text-xs text-zinc-400">{m.duration}p</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-zinc-400">
                Ngày chiếu
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Giờ bắt đầu
                </div>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Thời lượng (phút)
                </div>
                <input
                  type="number"
                  min="30"
                  max="480"
                  step="15"
                  value={duration}
                  onChange={handleDurationChange}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400">Phòng</div>
                <select
                  value={resolvedRoomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                >
                  {roomOptions.length === 0 ? (
                    <option value="" disabled>
                      Không có phòng chiếu
                    </option>
                  ) : null}
                  {roomOptions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-400">
                Ngôn ngữ
              </div>
              <select
                value={resolvedLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
              >
                {modalLanguageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                <Sparkles className="inline mr-1 h-3.5 w-3.5 text-yellow-400" />
                Loại suất chiếu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpecial(false)}
                  className={[
                    "h-10 rounded-xl border text-sm font-semibold transition",
                    !isSpecial
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  Suất thường
                </button>
                <button
                  type="button"
                  onClick={() => setIsSpecial(true)}
                  className={[
                    "h-10 rounded-xl border text-sm font-semibold transition",
                    isSpecial
                      ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-300"
                      : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <Sparkles className="inline mr-1 h-3.5 w-3.5" />
                  Suất đặc biệt
                </button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                {isSpecial
                  ? "Suất này sẽ được đánh dấu là suất chiếu đặc biệt."
                  : "Suất này là suất chiếu thường."}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-400">
                Trạng thái
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-2xl border border-zinc-700 bg-zinc-900/40 px-4 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-11 rounded-2xl bg-cinema-primary px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            {mode === "create" ? "Thêm suất chiếu" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </StaffCenteredModalShell>
  );
}

function StaffShowtimesPage() {
  const { subtitle } = useOutletContext();
  const { user } = useAuth();
  const cinemaName = useMemo(() => {
    const parts = String(subtitle ?? "").split("—");
    return (parts[0] ?? "").trim() || "CGV Vincom Center Bà Triệu";
  }, [subtitle]);

  const dates = useMemo(() => dayRange(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.value ?? "");
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);

  const [showtimes, setShowtimes] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const calendarDateOptions = useMemo(() => {
    if (!selectedDate) return dates;

    const alreadyInQuickRange = dates.some((d) => d.value === selectedDate);
    if (alreadyInQuickRange) return dates;

    const date = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dates;

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    return [
      ...dates,
      {
        value: selectedDate,
        label: `${dd}/${mm}`,
        full: date,
      },
    ];
  }, [dates, selectedDate]);

  const selectedDateDisplay = useMemo(
    () => formatScheduleDateLabel(selectedDate),
    [selectedDate]
  );

  const roomOptions = useMemo(() => {
    return roomsList.map((room) => ({
      id: room.id,
      cinemaId: room.cinemaId,
      name: room.name,
      type: room.type,
    }));
  }, [roomsList]);

  const formatOptions = useMemo(() => {
    const options = new Set();

    roomOptions.forEach((room) => {
      if (room.type) options.add(room.type);
    });

    showtimes.forEach((showtime) => {
      if (showtime.format) options.add(showtime.format);
    });

    return Array.from(options.values());
  }, [roomOptions, showtimes]);

  const roomFilterOptions = useMemo(() => {
    const names = new Set();

    roomOptions.forEach((room) => {
      if (room.name) names.add(room.name);
    });

    showtimes.forEach((showtime) => {
      if (showtime.room) names.add(showtime.room);
    });

    return Array.from(names.values());
  }, [roomOptions, showtimes]);

  const availableLanguageOptions = useMemo(() => {
    const optionsByValue = new Map();

    moviesList.forEach((movie) => {
      (movie.languageOptions || []).forEach((option) => {
        if (!optionsByValue.has(option.value)) {
          optionsByValue.set(option.value, option);
        }
      });
    });

    showtimes.forEach((showtime) => {
      const option = normalizeLanguageOption(
        showtime.languageCode || showtime.language
      );
      if (!optionsByValue.has(option.value)) {
        optionsByValue.set(option.value, option);
      }
    });

    if (optionsByValue.size === 0) {
      optionsByValue.set(
        DEFAULT_LANGUAGE_OPTION.value,
        DEFAULT_LANGUAGE_OPTION
      );
    }

    return Array.from(optionsByValue.values());
  }, [moviesList, showtimes]);

  const loadShowtimes = useCallback(async () => {
    try {
      setLoading(true);
      const roomsApiUrl = user?.cinema_id
        ? `http://localhost:5000/api/rooms/cinema/${user.cinema_id}`
        : "http://localhost:5000/api/rooms";

      const [showtimesRes, moviesRes, roomsRes] = await Promise.all([
        fetch("http://localhost:5000/api/showtimes"),
        fetch("http://localhost:5000/api/movies"),
        fetch(roomsApiUrl),
      ]);

      const [showtimesJson, moviesJson, roomsJson] = await Promise.all([
        showtimesRes.json(),
        moviesRes.json(),
        roomsRes.json(),
      ]);

      const data = Array.isArray(showtimesJson)
        ? showtimesJson
        : showtimesJson?.data || [];
      const moviesData = Array.isArray(moviesJson)
        ? moviesJson
        : moviesJson?.data || [];
      const roomsData = Array.isArray(roomsJson)
        ? roomsJson
        : roomsJson?.data || [];

      const normalizedRooms = roomsData.map((room) => ({
        id: room.room_id || room.id,
        cinemaId: room.cinema_id || room.cinemaId,
        name: room.name,
        type: room.type,
      }));
      setRoomsList(normalizedRooms);

      const roomLookup = new Map(
        normalizedRooms.map((room) => [String(room.id), room])
      );

      const normalizedMovies = moviesData.map((m) => ({
        id: m.movie_id || m.id,
        title: m.title,
        duration: m.duration || 120,
        subtitle: m.subtitle || "",
        language: m.language || "",
        languageOptions: extractLanguageOptionsFromMovie(m),
      }));
      setMoviesList(normalizedMovies);

      const mapped = data
        .map((s) => {
          const cinemaId = s.cinemaId || s.cinema_id;
          const roomId = s.roomId || s.room_id;
          const normalizedLanguage = normalizeLanguageOption(s.language);

          const dObj = new Date(s.date);
          const yyyy = dObj.getFullYear();
          const mm = String(dObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dObj.getDate()).padStart(2, "0");
          const formattedDate = `${yyyy}-${mm}-${dd}`;

          const formattedTime = s.time?.slice(0, 5);
          const formattedEndTime = s.endTime?.slice(0, 5);

          const status = normalizeStaffStatus(s.status);

          let duration = 120;
          if (formattedTime && formattedEndTime) {
            const startDateTime = new Date(`${formattedDate}T${formattedTime}`);
            const endDateTime = new Date(
              `${formattedDate}T${formattedEndTime}`
            );
            duration = (endDateTime - startDateTime) / 60000;
          }

          const roomFromDb = roomLookup.get(String(roomId));
          const isSpecialShowtime = Boolean(
            s.isSpecial ?? s.special ?? s.is_special ?? false
          );

          return {
            id: s.id,
            movieId: s.movieId || s.movie_id,
            movieTitle: s.movieTitle || "",
            cinemaId,
            cinemaName: s.cinemaName,
            roomId,
            room: s.roomName || s.room_name || roomFromDb?.name || "",
            format: s.type,
            isSpecial: isSpecialShowtime,
            special: isSpecialShowtime,
            languageCode: normalizedLanguage.value,
            language: normalizedLanguage.label,
            status: status,
            date: formattedDate,
            start: `${formattedDate}T${formattedTime}:00`,
            end: `${formattedDate}T${formattedEndTime}:00`,
            startTime: formattedTime,
            duration: duration,
          };
        })
        .filter((s) => {
          if (!user?.cinema_id) return true;
          return String(s.cinemaId) === String(user.cinema_id);
        });

      setShowtimes(mapped);
    } catch (err) {
      console.error("Load showtimes error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.cinema_id]);

  useEffect(() => {
    loadShowtimes();
  }, [loadShowtimes]);

  const [editModal, setEditModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    return showtimes
      .filter((st) => {
        if (!selectedDate) return true;
        return String(st.date) === String(selectedDate);
      })
      .filter((st) => {
        if (roomFilter === "all") return true;
        return st.room === roomFilter;
      })
      .filter((st) => {
        if (formatFilter === "all") return true;
        return st.format === formatFilter;
      })
      .filter((st) => {
        if (statusFilter === "all") return true;
        return st.status === statusFilter;
      })
      .filter((st) => {
        if (!search.trim()) return true;
        return st.movieTitle.toLowerCase().includes(search.toLowerCase());
      });
  }, [showtimes, selectedDate, search, roomFilter, formatFilter, statusFilter]);

  const openCreate = () => {
    const firstMovie = moviesList[0];
    const firstRoom = roomOptions[0];
    const firstLanguage =
      firstMovie?.languageOptions?.[0] ||
      availableLanguageOptions[0] ||
      DEFAULT_LANGUAGE_OPTION;

    const initial = {
      id: makeId("st"),
      movieId: firstMovie?.id || "",
      movieTitle: firstMovie?.title || "",
      cinemaId: user?.cinema_id || firstRoom?.cinemaId || null,
      date: selectedDate,
      startTime: "09:00",
      start: `${selectedDate}T09:00:00`,
      end: durationToEnd(
        `${selectedDate}T09:00:00`,
        firstMovie?.duration || 120
      ),
      duration: firstMovie?.duration || 120,
      roomId: firstRoom?.id || "",
      room: firstRoom?.name || "",
      format: firstRoom?.type || formatOptions[0] || "",
      isSpecial: false,
      special: false,
      languageCode: firstLanguage.value,
      language: firstLanguage.value,
      status: "open",
    };
    setEditModal({ mode: "create", data: initial });
  };

  const openEdit = (st) => {
    setEditModal({
      mode: "edit",
      data: {
        ...st,
        date: st.date,
        startTime: formatTime(st.start),
        language: st.languageCode || st.language,
      },
    });
  };

  const handleSave = async (next) => {
    try {
      const auth = getAuth();
      const currentToken = await auth.currentUser?.getIdToken();
      if (!currentToken) {
        throw new Error(
          "Không lấy được token xác thực. Vui lòng thử tải lại trang hoặc đăng nhập lại."
        );
      }

      const cinemaId = user?.cinema_id || next.cinemaId;
      if (!cinemaId) {
        throw new Error("Không xác định được rạp chiếu để lưu suất chiếu.");
      }
      if (!next.roomId) {
        throw new Error("Vui lòng chọn phòng chiếu trước khi lưu.");
      }

      const payload = {
        movieId: next.movieId,
        cinemaId,
        roomId: Number(next.roomId),
        date: next.date,
        time: `${next.startTime}:00`,
        endTime: `${next.end.slice(11, 16)}:00`,
        type: next.format,
        language: next.language || DEFAULT_LANGUAGE_OPTION.value,
        is_special: Boolean(next.isSpecial),
        special_prices: next.isSpecial
          ? {
              Thường: 50000,
            }
          : null,
        prices: {
          Thường: 50000,
        },
        status:
          normalizeStaffStatus(next.status) === "open"
            ? "available"
            : "cancelled",
      };

      console.log("PAYLOAD:", payload);

      let res;
      if (editModal.mode === "create") {
        res = await fetch("http://localhost:5000/api/showtimes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:5000/api/showtimes/${next.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Lỗi từ hệ thống: ${res.status}`);
      }

      await loadShowtimes();
      setEditModal(null);
      setToast({ type: "success", message: "Đã lưu suất chiếu thành công" });
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: err.message || "Lỗi khi lưu suất chiếu",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const auth = getAuth();
      const currentToken = await auth.currentUser?.getIdToken();
      if (!currentToken) {
        throw new Error(
          "Không lấy được token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const res = await fetch(`http://localhost:5000/api/showtimes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Lỗi từ hệ thống: ${res.status}`);
      }

      await loadShowtimes();
      setDeleteTarget(null);
      setToast({ type: "success", message: "Đã xóa suất chiếu" });
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: err.message || "Lỗi khi xóa suất chiếu",
      });
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest(".calendar-container")) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Đang tải suất chiếu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Suất chiếu</h1>
          <p className="mt-1 text-sm text-zinc-400">{cinemaName}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-2xl bg-cinema-primary px-4 text-sm font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Thêm suất chiếu
        </button>
      </div>

      <div className="calendar-container relative flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/40 p-3">
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="p-1 hover:bg-zinc-800 rounded-lg transition"
          title="Chọn ngày"
        >
          <CalendarDays className="h-5 w-5 text-zinc-400 hover:text-white" />
        </button>
        <div className="flex flex-wrap gap-2">
          {calendarDateOptions.map((d) => (
            <FilterChip
              key={d.value}
              label={d.label}
              active={d.value === selectedDate}
              onClick={() => setSelectedDate(d.value)}
            />
          ))}
        </div>
        <div className="ml-auto inline-flex items-center rounded-xl border border-cinema-primary/40 bg-cinema-primary/15 px-3 py-1 text-xs font-semibold text-zinc-100">
          Đang xem lịch: {selectedDateDisplay}
        </div>

        {/* Calendar Picker */}
        {showCalendar && (
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-400 focus:outline-none"
              placeholder="Tìm phim..."
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="all">Tất cả phòng</option>
              {roomFilterOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="all">Tất cả định dạng</option>
              {formatOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Film className="h-4 w-4" />
            <span>Suất chiếu / ngày</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-white">
            {filtered.length}
            <span className="ml-2 text-sm font-semibold text-zinc-400">
              suất
            </span>
          </div>
          <div className="mt-4 space-y-2 text-xs text-zinc-400">
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Mở bán
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
              Khóa
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950/40 p-5 text-center text-sm text-zinc-400">
            Không có suất chiếu trong ngày.
          </div>
        ) : (
          filtered.map((st) => (
            <ShowtimeCard
              key={st.id}
              showtime={{
                ...st,
                isPast: isPastCalendarDate(st.date),
              }}
              onEdit={() => openEdit(st)}
              onDelete={() => setDeleteTarget(st)}
            />
          ))
        )}
      </div>

      {editModal ? (
        <EditShowtimeModal
          mode={editModal.mode}
          initial={editModal.data}
          movies={moviesList}
          rooms={roomOptions}
          languageOptions={availableLanguageOptions}
          onCancel={() => setEditModal(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <StaffConfirmModal
          title={deleteTarget.movieTitle}
          headerTitle="Xóa suất chiếu"
          cancelLabel="Hủy"
          confirmLabel="Xóa"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        >
          <p className="text-sm text-zinc-300">
            Bạn có chắc muốn xóa suất chiếu{" "}
            <span className="font-semibold text-white">
              {deleteTarget.movieTitle}
            </span>{" "}
            lúc {formatTime(deleteTarget.start)}?
          </p>
        </StaffConfirmModal>
      ) : null}

      {toast ? (
        <StaffSuccessToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

export default StaffShowtimesPage;
