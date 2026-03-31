import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock4,
  Film,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { MOVIES } from "../../data/mockData.js";
import { makeId } from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
const NOW_BASELINE = Date.now();

const ROOM_OPTIONS = ["Room 1", "Room 2", "Room 3", "IMAX 1", "4DX 1"];
const FORMAT_OPTIONS = ["2D", "3D", "IMAX", "4DX"];
const LANGUAGE_OPTIONS = ["Phụ đề Việt", "Lồng tiếng Việt"];
const STATUS_OPTIONS = [
  { value: "open", label: "Mở bán" },
  { value: "locked", label: "Khóa" },
];

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
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function durationToEnd(startIso, duration) {
  // ✅ FIX: Parse date properly to avoid timezone issues
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
          ? "border-cinema-primary/40 bg-cinema-primary/10 text-white"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
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
        1,
      ),
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            <Pencil className="h-4 w-4" />
            Sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm font-semibold text-cinema-primary hover:bg-zinc-900"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function EditShowtimeModal({ mode = "create", initial, onSave, onCancel }) {
  const [movieId, setMovieId] = useState(initial.movieId);
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.startTime);
  const [duration, setDuration] = useState(initial.duration);
  const [room, setRoom] = useState(initial.room);
  const [format, setFormat] = useState(initial.format);
  const [language, setLanguage] = useState(initial.language);
  const [status, setStatus] = useState(initial.status);
  const [error, setError] = useState(null);

  const movieOptions = useMemo(() => {
    return MOVIES.map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
    }));
  }, []);

  const selectedMovie = movieOptions.find((m) => m.id === movieId);
  const durationNumber = Number(duration) || (selectedMovie?.duration ?? 0);

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
    if (!movieId || !date || !start || !room || !format) {
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
          "Suất chiếu sẽ kéo dài sang ngày hôm sau. Bạn có chắc không?",
        )
      ) {
        return;
      }
    }

    onSave({
      ...initial,
      movieId,
      movieTitle: selectedMovie?.title || initial.movieTitle,
      date,
      start: startIso,
      end: endIso,
      startTime: start,
      duration: durationNumber,
      room,
      format,
      language,
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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-sm text-zinc-400">
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
                    }}
                    className={[
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
                      movieId === m.id
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
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
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
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
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
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400">Phòng</div>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
                >
                  {ROOM_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Định dạng
                </div>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
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
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-400">
                Trạng thái
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
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
            className="h-11 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowtimes();
  }, []);

  const loadShowtimes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/showtimes");
      const data = await res.json();

      const mapped = data.map((s) => {
        const formattedDate = s.date.slice(0, 10);
        const formattedTime = s.time?.slice(0, 5);
        const formattedEndTime = s.endTime?.slice(0, 5);

        let status = s.status;
        if (status === "available") status = "open";
        if (status === "cancelled") status = "locked";

        let duration = 120;
        if (formattedTime && formattedEndTime) {
          const startDateTime = new Date(`${formattedDate}T${formattedTime}`);
          const endDateTime = new Date(`${formattedDate}T${formattedEndTime}`);
          duration = (endDateTime - startDateTime) / 60000;
        }

        return {
          id: s.id,
          movieId: s.movieId,
          movieTitle: s.movieTitle || "",
          cinemaId: s.cinemaId,
          cinemaName: s.cinemaName,
          room: s.roomName,
          format: s.type,
          language:
            s.language === "VIETSUB"
              ? "Phụ đề Việt"
              : s.language === "English"
                ? "Phụ đề Anh"
                : s.language === "DUB"
                  ? "Lồng tiếng Việt"
                  : s.language || "Phụ đề Việt",
          status: status,
          date: formattedDate,
          start: `${formattedDate}T${formattedTime}:00`,
          end: `${formattedDate}T${formattedEndTime}:00`,
          startTime: formattedTime,
          duration: duration,
        };
      });

      setShowtimes(mapped);

      if (mapped.length > 0) {
        const datesWithShowtimes = [...new Set(mapped.map((s) => s.date))];
        if (!datesWithShowtimes.includes(selectedDate)) {
          setSelectedDate(datesWithShowtimes[0]);
        }
      }
    } catch (err) {
      console.error("Load showtimes error:", err);
    } finally {
      setLoading(false);
    }
  };

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
    const initial = {
      id: makeId("st"),
      movieId: MOVIES[0]?.id || "",
      movieTitle: MOVIES[0]?.title || "",
      date: selectedDate,
      startTime: "09:00",
      start: `${selectedDate}T09:00:00`,
      end: durationToEnd(
        `${selectedDate}T09:00:00`,
        MOVIES[0]?.duration || 120,
      ),
      duration: MOVIES[0]?.duration || 120,
      room: ROOM_OPTIONS[0],
      format: FORMAT_OPTIONS[0],
      language: LANGUAGE_OPTIONS[0],
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
      },
    });
  };

  const handleSave = async (next) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        movieId: next.movieId,
        cinemaId: next.cinemaId || 1,
        roomId: next.roomId || 1,
        date: next.date,
        time: `${next.startTime}:00`,
        endTime: `${next.end.slice(11, 16)}:00`,
        type: next.format,
        language:
          next.language === "Phụ đề Việt"
            ? "VIETSUB"
            : next.language === "Lồng tiếng Việt"
              ? "DUB"
              : "VIETSUB",
        prices: {
          Thường: 50000,
        },
        status: next.status === "open" ? "available" : "cancelled",
      };

      console.log("PAYLOAD:", payload);

      if (editModal.mode === "create") {
        await fetch("http://localhost:5000/api/showtimes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`http://localhost:5000/api/showtimes/${next.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      await loadShowtimes();
      setEditModal(null);
      setToast({ type: "success", message: "Đã lưu suất chiếu" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Lỗi khi lưu suất chiếu" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/showtimes/${id}`, {
        method: "DELETE",
      });
      await loadShowtimes();
      setDeleteTarget(null);
      setToast({ type: "success", message: "Đã xóa suất chiếu" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Lỗi khi xóa suất chiếu" });
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

      {/* Calendar Section with Date Picker */}
      <div className="relative calendar-container">
        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3 cursor-pointer hover:bg-zinc-900/40 transition"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarDays className="h-4 w-4 text-zinc-400" />
          <div className="flex flex-wrap gap-2 items-center">
            {dates.map((d) => (
              <FilterChip
                key={d.value}
                label={d.label}
                active={d.value === selectedDate}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(d.value);
                  setShowCalendar(false);
                }}
              />
            ))}
          </div>
          <div className="ml-auto text-sm text-zinc-400">
            {formatDate(selectedDate)}
          </div>
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              placeholder="Tìm phim..."
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="all">Tất cả phòng</option>
              {ROOM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="all">Tất cả định dạng</option>
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none"
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Film className="h-4 w-4" />
            <span>Suất chiếu / ngày</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-white">
            {filtered.length}
            <span className="ml-2 text-sm font-semibold text-zinc-500">
              suất
            </span>
          </div>
          <div className="mt-4 space-x-2 text-xs text-zinc-500">
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Mở bán
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
              Khóa
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 text-center text-sm text-zinc-400">
            Không có suất chiếu trong ngày.
          </div>
        ) : (
          filtered.map((st) => (
            <ShowtimeCard
              key={st.id}
              showtime={{
                ...st,
                isPast: new Date(st.end || st.start).getTime() < NOW_BASELINE,
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
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

export default StaffShowtimesPage;
