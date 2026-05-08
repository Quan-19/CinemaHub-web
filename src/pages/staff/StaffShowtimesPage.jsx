import { useCallback, useMemo, useState, useRef } from "react";
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
  { value: "scheduled", label: "Sắp chiếu" },
  { value: "ongoing", label: "Đang chiếu" },
  { value: "ended", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
];
const MODAL_STATUS_OPTIONS = [
  { value: "scheduled", label: "Sắp chiếu (Mở bán)" },
  { value: "cancelled", label: "Đã hủy" },
];
const DEFAULT_LANGUAGE_OPTION = { value: "VIETSUB", label: "Phụ đề" };
const STANDARD_LANGUAGES = [
  { value: "VIETSUB", label: "Phụ đề" },
  { value: "DUB", label: "Lồng tiếng" },
];
const STAFF_PAST_DATE_ERROR = "Bạn chỉ được chọn ngày chiếu từ hôm nay trở đi.";

function normalizeStaffStatus(status) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "cancelled") return "cancelled";
  if (normalized === "ended" || normalized === "sold_out") return "ended";
  if (normalized === "ongoing") return "ongoing";
  if (
    normalized === "scheduled" ||
    normalized === "open" ||
    normalized === "available"
  ) {
    return "scheduled";
  }

  return "scheduled";
}

const normalizeMovieStatus = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "coming-soon") return "coming_soon";
  if (normalized === "now-showing") return "now_showing";
  return normalized;
};

const CustomTimePicker24h = ({ value, onChange, label, activeColorClass = "ring-cinema-primary/30" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hour = value ? value.split(":")[0] : "00";
  const minute = value ? value.split(":")[1] : "00";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }).map((_, i) => String(i).padStart(2, "0"));

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 flex items-center bg-zinc-900/40 border border-zinc-700 rounded-xl px-4 cursor-pointer hover:border-zinc-500 transition-all group ${isOpen ? "ring-2 " + activeColorClass : ""}`}
      >
        <span className="text-sm font-medium text-zinc-100 group-hover:text-cinema-primary transition-colors">
          {hour} : {minute}
        </span>
        <div className="ml-auto text-zinc-500 group-hover:text-zinc-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[63] bottom-full mb-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2 px-2">Giờ</div>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChange(`${h}:${minute}`)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${hour === h ? "bg-cinema-primary/10 text-cinema-primary font-bold" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
              >
                {h}h
              </button>
            ))}
          </div>
          <div className="w-px bg-zinc-100 self-stretch" />
          <div className="flex-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2 px-2">Phút</div>
            {minutes.filter(m => parseInt(m) % 5 === 0).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange(`${hour}:${m}`);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${minute === m ? "bg-cinema-primary/10 text-cinema-primary font-bold" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// StaffShowtimesPage content follows

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
    normalized.includes("PHU DE VIET") ||
    normalized.includes("PHU DE")
  ) {
    return { value: "VIETSUB", label: "Phụ đề" };
  }

  if (normalized === "DUB" || normalized.includes("LONG TIENG")) {
    return { value: "DUB", label: "Lồng tiếng" };
  }

  return DEFAULT_LANGUAGE_OPTION;
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
  // Thêm thời lượng phim + 15 phút dọn dẹp/quảng cáo
  end.setMinutes(start.getMinutes() + duration + 15);

  // Format back to YYYY-MM-DDTHH:MM:00
  const yyyy = end.getFullYear();
  const mm = String(end.getMonth() + 1).padStart(2, "0");
  const dd = String(end.getDate()).padStart(2, "0");
  const hh = String(end.getHours()).padStart(2, "0");
  const min = String(end.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

function getTodayDateInputValue() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function StatusBadge({ status }) {
  const statusStyles = {
    scheduled: {
      label: "Sắp chiếu",
      icon: "🟢",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    },
    ongoing: {
      label: "Đang chiếu",
      icon: "🟡",
      className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    },
    ended: {
      label: "Đã kết thúc",
      icon: "⚫",
      className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    },
    cancelled: {
      label: "Đã hủy",
      icon: "🔴",
      className: "bg-red-500/15 text-red-300 border-red-500/25",
    },
  };

  const style = statusStyles[status] || statusStyles.scheduled;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.className}`}
    >
      <span className="text-[9px]">{style.icon}</span>
      {style.label}
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
  const effectiveStatus = isPast && showtime.status !== 'cancelled' ? 'ended' : showtime.status;
  const isInactive = effectiveStatus === 'ended' || effectiveStatus === 'cancelled';
  const hasBookings = (showtime.bookedCount || 0) > 0;

  return (
    <div className={`rounded-2xl border bg-zinc-950/30 p-4 transition-all ${
      effectiveStatus === 'cancelled'
        ? 'border-red-500/20 opacity-60'
        : effectiveStatus === 'ended'
          ? 'border-zinc-700/50 opacity-50'
          : effectiveStatus === 'ongoing'
            ? 'border-yellow-500/30'
            : 'border-zinc-700'
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock4 className={`h-5 w-5 ${effectiveStatus === 'ongoing' ? 'text-yellow-400' : 'text-cinema-primary'}`} />
            <span>
              {formatTime(showtime.start)} – {formatTime(showtime.end)}
            </span>
            <StatusBadge status={effectiveStatus} />
            {hasBookings && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                🎟️ {showtime.bookedCount} vé đã đặt
              </span>
            )}
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
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span className="font-bold text-cinema-primary">
              Từ {(showtime.prices?.Thường || 0).toLocaleString()}đ
            </span>
          </div>
        </div>

        {isInactive ? (
          <span className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-xs font-semibold text-zinc-400">
            {effectiveStatus === 'cancelled' ? 'Suất chiếu đã hủy' : 'Suất chiếu đã kết thúc'}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {hasBookings ? (
              <span
                title={`Không thể sửa: đã có ${showtime.bookedCount} vé được đặt`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-900/20 px-3 text-sm font-semibold text-zinc-500 cursor-not-allowed"
              >
                <Pencil className="h-4 w-4" />
                🔒 Đã khóa
              </span>
            ) : (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </button>
            )}
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

  // Pricing states
  const [holidayPromos, setHolidayPromos] = useState([]);
  const [selectedPromoId, setSelectedPromoId] = useState(
    initial.promotionId || ""
  );
  const [previewPrices, setPreviewPrices] = useState(null);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [priceError, setPriceError] = useState(null);

  const movieOptions = useMemo(() => {
    return movies.map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.duration,
      status: normalizeMovieStatus(m.status),
      languageOptions:
        m.languageOptions?.length > 0
          ? m.languageOptions
          : [DEFAULT_LANGUAGE_OPTION],
    }));
  }, [movies]);

  const selectedMovie = movieOptions.find(
    (m) => String(m.id) === String(movieId)
  );
  const selectedMovieStatus = normalizeMovieStatus(selectedMovie?.status);
  const isComingSoonMovie = selectedMovieStatus === "coming_soon";
  const effectiveIsSpecial = isComingSoonMovie ? true : isSpecial;
  const durationNumber = Number(duration) || (selectedMovie?.duration ?? 0);

  const modalLanguageOptions = useMemo(() => {
    return STANDARD_LANGUAGES;
  }, []);

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

  const selectedRoom = roomOptions.find(
    (room) => String(room.id) === String(resolvedRoomId)
  );
  const roomType = selectedRoom?.type || "2D";

  // Fetch holiday promotions for the selected date
  useEffect(() => {
    if (!effectiveIsSpecial) {
      setHolidayPromos([]);
      return;
    }

    const fetchHolidayPromos = async () => {
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/pricing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json?.success && Array.isArray(json?.data)) {
          const rules = json.data.filter(
            (r) => r?.pricing_type === "HOLIDAY" || r?.type === "HOLIDAY"
          );

          const applicableRules = rules.filter((rule) => {
            if (!(rule.active ?? rule.is_active ?? false)) return false;

            if (roomType && rule.holiday_room_type && rule.holiday_room_type !== roomType) {
              return false;
            }

            if (date && rule.start_date && rule.end_date) {
              const showDate = new Date(date);
              const start = new Date(rule.start_date);
              start.setHours(0, 0, 0, 0);
              const end = new Date(rule.end_date);
              end.setHours(23, 59, 59, 999);
              if (showDate < start || showDate > end) return false;

              if (Array.isArray(rule.apply_days)) {
                const day = showDate.getDay();
                if (!rule.apply_days.includes(day)) return false;
              }
            }
            return true;
          });

          setHolidayPromos(applicableRules);
          // Auto-select first promo if none selected
          if (!selectedPromoId && applicableRules.length > 0) {
            setSelectedPromoId(applicableRules[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch holiday promos error:", err);
      }
    };

    fetchHolidayPromos();
  }, [date, roomType, effectiveIsSpecial]);

  // Fetch preview prices
  useEffect(() => {
    if (effectiveIsSpecial) {
      const rule = holidayPromos.find((r) => String(r.id) === String(selectedPromoId));
      if (rule) {
        const prices = { Thường: 0, VIP: 0, Couple: 0 };
        const list = Array.isArray(rule?.holiday_prices) ? rule.holiday_prices : [];
        for (const item of list) {
          const seatType = item?.seat_type;
          const price = Number(item?.price);
          if (seatType && Number.isFinite(price) && price > 0) {
            prices[seatType] = price;
          }
        }
        setPreviewPrices(prices);
        setPriceError(null);
      } else {
        setPreviewPrices(null);
        setPriceError("Vui lòng chọn loại giá vé đặc biệt");
      }
      return;
    }

    if (!date || !roomType || !start) {
      setPreviewPrices(null);
      return;
    }

    const fetchPrices = async () => {
      try {
        setIsFetchingPrices(true);
        setPriceError(null);
        const url = new URL("http://localhost:5000/api/pricing/preview-prices");
        url.searchParams.append("type", roomType);
        url.searchParams.append("date", date);
        url.searchParams.append("time", start);
        // Only regular prices here anyway:
        url.searchParams.append("special", "false");

        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.success) {
          const prices = { Thường: 0, VIP: 0, Couple: 0, ...json.data };
          setPreviewPrices(prices);
        } else {
          setPreviewPrices(null);
          setPriceError(json.message);
        }
      } catch (err) {
        console.error("Fetch pricing error:", err);
        setPriceError("Không thể lấy thông tin giá vé");
      } finally {
        setIsFetchingPrices(false);
      }
    };

    // Use a small delay to avoid excessive calls
    const timer = setTimeout(fetchPrices, 300);
    return () => clearTimeout(timer);
  }, [date, roomType, start, effectiveIsSpecial, selectedPromoId]);

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

    if (isPastCalendarDate(date)) {
      setError(STAFF_PAST_DATE_ERROR);
      return;
    }

    // ✅ Validate duration
    if (durationNumber <= 0) {
      setError("Thời lượng phải lớn hơn 0");
      return;
    }

    if (isComingSoonMovie && !effectiveIsSpecial) {
      setError("Phim sắp chiếu chỉ được phép tạo suất chiếu đặc biệt.");
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
      format: roomType || format,
      language: resolvedLanguage,
      languageLabel: normalizeLanguageOption(resolvedLanguage).label,
      isSpecial: effectiveIsSpecial,
      special: effectiveIsSpecial,
      status,
      prices: previewPrices,
    });
  };

  return (
    <StaffCenteredModalShell
      title={mode === "create" ? "Thêm suất chiếu" : "Chỉnh sửa suất chiếu"}
      onClose={onCancel}
      maxWidthClassName="max-w-4xl w-full"
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: Thông tin cơ bản & Lịch chiếu */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-white/70 mb-3">
                Thông tin phim
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Phim *
                  </label>
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40">
                    <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2 text-sm text-zinc-400">
                      <Search className="h-4 w-4" /> Chọn phim
                    </div>
                    <div className="max-h-[160px] overflow-auto">
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
                            if (normalizeMovieStatus(m.status) === "coming_soon") {
                              setIsSpecial(true);
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

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Ngôn ngữ
                  </label>
                  <select
                    value={resolvedLanguage}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                  >
                    {modalLanguageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-white/70 mb-3">
                Lịch chiếu & Phòng
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Phòng chiếu *
                  </label>
                  <select
                    value={resolvedRoomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Ngày chiếu *
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={getTodayDateInputValue()}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setDate(nextDate);

                        if (isPastCalendarDate(nextDate)) {
                          setError(STAFF_PAST_DATE_ERROR);
                          return;
                        }

                        setError((prev) =>
                          prev === STAFF_PAST_DATE_ERROR ? null : prev
                        );
                      }}
                      className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  </div>

                  <CustomTimePicker24h
                    label="Giờ bắt đầu *"
                    value={start || ""}
                    onChange={(val) => setStart(val)}
                    activeColorClass="ring-cinema-primary/30"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Giờ kết thúc
                    </label>
                    <div className="h-11 w-full border rounded-xl px-3 flex items-center text-sm text-white bg-zinc-900/40 border-zinc-700">
                      {date && start && duration ? (
                        (() => {
                          const startIso = `${date}T${start}:00`;
                          const endIso = durationToEnd(startIso, parseInt(duration, 10));
                          const endDateObj = new Date(endIso);
                          const h = endDateObj.getHours().toString().padStart(2, "0");
                          const m = endDateObj.getMinutes().toString().padStart(2, "0");
                          const isNextDay = endDateObj.getDate() !== new Date(startIso).getDate();
                          return `${h}:${m} ${isNextDay ? "(Hôm sau)" : ""}`;
                        })()
                      ) : "Chọn phim và giờ"}
                    </div>
                    {duration ? (
                      <p className="text-[10px] text-blue-400 mt-1">
                        ⏱️ {duration} phút + 15' quảng cáo
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Giá vé & Trạng thái */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-white/70 mb-3">
                Loại & Giá vé
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  <Sparkles className="inline mr-1 h-3.5 w-3.5 text-yellow-400" />
                  Loại suất chiếu *
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isComingSoonMovie) {
                        setIsSpecial(false);
                      }
                    }}
                    disabled={isComingSoonMovie}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isComingSoonMovie
                      ? "bg-zinc-900 text-zinc-500 border border-white/10 cursor-not-allowed"
                      : !effectiveIsSpecial
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "bg-zinc-900 text-gray-400 hover:text-white border border-white/10 hover:bg-zinc-800"
                      }`}
                  >
                    Suất chiếu thường
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSpecial(true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${effectiveIsSpecial
                      ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/30"
                      : "bg-zinc-900 text-gray-400 hover:text-white border border-white/10 hover:bg-zinc-800"
                      }`}
                  >
                    <Sparkles size={12} className="inline mr-1" />
                    Suất chiếu đặc biệt
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {isComingSoonMovie
                    ? "Phim sắp chiếu chỉ được tạo suất chiếu đặc biệt."
                    : effectiveIsSpecial
                      ? "Suất này sẽ được đánh dấu là suất chiếu đặc biệt."
                      : "Suất này là suất chiếu thường."}
                </p>
              </div>

              {effectiveIsSpecial && holidayPromos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <label className="block text-[12px] text-yellow-400 flex items-center gap-1 font-semibold mb-1">
                    <Sparkles size={12} />
                    Nhập giá vé đặc biệt theo từng loại ghế
                  </label>
                  <div>
                    <select
                      value={selectedPromoId}
                      onChange={(e) => setSelectedPromoId(e.target.value)}
                      className="w-full bg-zinc-900 border border-red-500/50 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-red-500/80 transition [&>option]:bg-zinc-900 [&>option]:text-white"
                    >
                      <option value="" className="bg-zinc-900 text-white/70">
                        Chọn loại giá vé đặc biệt
                      </option>
                      {holidayPromos.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-white/40 mt-1.5">
                      Chọn để tự đổ giá vào mục bên dưới.
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-xl border mt-4 ${effectiveIsSpecial
                  ? "border-yellow-500/15 bg-yellow-500/5"
                  : "border-green-500/15 bg-green-500/5"
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3
                      className={`text-sm font-semibold ${effectiveIsSpecial ? "text-yellow-300" : "text-green-300"
                        }`}
                    >
                      {effectiveIsSpecial ? "Giá suất chiếu đặc biệt" : "Giá suất chiếu thường"}
                    </h3>
                    <p className="text-[10px] text-white/40 mt-1">
                      {effectiveIsSpecial
                        ? "Tự động theo loại giá đã chọn"
                        : "Tự động áp dụng từ bảng giá"}
                    </p>
                  </div>
                  {isFetchingPrices ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/45 border border-white/10 animate-pulse">
                      Đang cập nhật...
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/45 border border-white/10">
                      Tự động
                    </span>
                  )}
                </div>

                {priceError ? (
                  <div className="text-xs text-red-500/80 italic mt-2">
                    ✕ {priceError}
                  </div>
                ) : previewPrices ? (
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(previewPrices).map(([seat, price]) => {
                      let color = "text-gray-300";
                      let bg = "bg-gray-500/10";
                      let border = "border-gray-500/20";
                      let desc = "Giá chuẩn";
                      if (seat === "VIP") {
                        color = "text-amber-400";
                        bg = "bg-amber-500/10";
                        border = "border-amber-500/20";
                        desc = "Ghế cao cấp";
                      } else if (seat === "Couple") {
                        color = "text-pink-400";
                        bg = "bg-pink-500/10";
                        border = "border-pink-500/20";
                        desc = "Ghế đôi";
                      }

                      return (
                        <div
                          key={seat}
                          className={`rounded-xl border ${border} ${bg} p-2.5 flex items-center justify-between`}
                        >
                          <div>
                            <label className={`block text-xs font-semibold ${color} leading-5`}>
                              Ghế {seat}
                            </label>
                            <span className="text-[10px] text-white/40">{desc}</span>
                          </div>
                          <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                              ₫
                            </span>
                            <input
                              type="text"
                              value={(price || 0).toLocaleString("en-US")}
                              readOnly
                              className="w-full bg-zinc-900/80 border border-white/5 rounded-lg pl-6 pr-2 py-1.5 text-white text-xs outline-none text-right tabular-nums cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-white/50 italic mt-2">
                    Vui lòng chọn thông tin để xem giá vé
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-white/70 mb-3">
                Cập nhật trạng thái
              </div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Trạng thái suất chiếu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
              >
                {MODAL_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 pb-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition shadow-sm"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20"
          >
            {mode === "create" ? "Thêm suất chiếu" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </StaffCenteredModalShell>
  );
}

export default function StaffShowtimesPage() {
  const { subtitle } = useOutletContext();
  const { user } = useAuth();
  const cinemaName = useMemo(() => {
    const parts = String(subtitle ?? "").split("—");
    return (parts[0] ?? "").trim() || "EbizCinema";
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
      const auth = getAuth();
      const currentToken = await auth.currentUser?.getIdToken();
      if (!currentToken) {
        throw new Error(
          "Không lấy được token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const roomsApiUrl = user?.cinema_id
        ? `http://localhost:5000/api/rooms/cinema/${user.cinema_id}`
        : "http://localhost:5000/api/rooms";

      const [showtimesRes, moviesRes, roomsRes] = await Promise.all([
        fetch("http://localhost:5000/api/showtimes/manage", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }),
        fetch("http://localhost:5000/api/movies?scope=manage"),
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
        status: normalizeMovieStatus(m.status),
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
            prices: s.prices || (isSpecialShowtime ? s.special_prices : null) || { Thường: 50000 },
            bookedCount: Number(s.bookedCount) || 0,
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
    const firstMovieStatus = normalizeMovieStatus(firstMovie?.status);
    const forceSpecialForComingSoon = firstMovieStatus === "coming_soon";
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
      isSpecial: forceSpecialForComingSoon,
      special: forceSpecialForComingSoon,
      languageCode: firstLanguage.value,
      language: firstLanguage.value,
      status: "scheduled",
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
      if (isPastCalendarDate(next.date)) {
        throw new Error(STAFF_PAST_DATE_ERROR);
      }

      // ✅ Kiểm tra chồng lấn suất chiếu (Conflict Detection)
      const conflictingShow = showtimes.find((st) => {
        if (st.id === next.id) return false; // Bỏ qua chính nó khi sửa
        if (String(st.roomId) !== String(next.roomId)) return false;
        if (st.date !== next.date) return false;
        if (st.status === "cancelled") return false;

        const startA = new Date(st.start).getTime();
        const endA = new Date(st.end).getTime();
        const startB = new Date(next.start).getTime();
        const endB = new Date(next.end).getTime();

        return startB < endA && endB > startA;
      });

      if (conflictingShow) {
        throw new Error(
          `Xung đột lịch: Phòng đã có suất "${conflictingShow.movieTitle}" lúc ${conflictingShow.startTime}.`
        );
      }

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
        special_prices: next.isSpecial ? next.prices : null,
        prices: next.prices,
        status: (() => {
          const s = normalizeStaffStatus(next.status);
          if (s === "cancelled") return "cancelled";
          if (s === "ended") return "sold_out";
          return "available";
        })(),
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
          <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-zinc-400">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/40 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sắp chiếu
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/40 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Đang chiếu
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/40 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              Đã kết thúc
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/40 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Đã hủy
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
