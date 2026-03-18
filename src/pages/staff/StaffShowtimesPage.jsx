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
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { MOVIES } from "../../data/mockData.js";
import { makeId } from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";

const NOW_BASELINE = Date.now();

const ROOM_OPTIONS = ["P1", "P2", "P3", "IMAX 1", "4DX 1"];
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
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function durationToEnd(startIso, duration) {
  const start = new Date(startIso);
  const end = new Date(start);
  end.setMinutes(start.getMinutes() + duration);
  return end.toISOString();
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
            <span className="font-semibold text-cinema-primary">
              {showtime.price.toLocaleString()} ₫
            </span>
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
  const [price, setPrice] = useState(initial.price);
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

  const handleSave = () => {
    if (!movieId || !date || !start || !room || !format) {
      setError("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }
    const startIso = `${date}T${start}:00`;
    const endIso = durationToEnd(startIso, durationNumber || 0);
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
      price: Number(price) || 0,
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
                      if (!duration) setDuration(m.duration || "");
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
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Thời lượng (phút)
                </div>
                <input
                  type="number"
                  min="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400">Phòng</div>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
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
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-400">
                  Ngôn ngữ
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
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
                  Giá vé (₫)
                </div>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
                />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-400">
                Trạng thái
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cinema-primary/30"
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

  const [showtimes, setShowtimes] = useState(() => {
    const base = [
      {
        id: makeId("st"),
        movieId: MOVIES[0]?.id || "movie-1",
        movieTitle: MOVIES[0]?.title || "Biệt Đội Chiến Thần",
        date: dates[0]?.value,
        start: `${dates[0]?.value}T09:15:00`,
        end: `${dates[0]?.value}T11:15:00`,
        startTime: "09:15",
        duration: 120,
        room: "P1",
        format: "2D",
        language: "Phụ đề Việt",
        price: 90000,
        status: "open",
      },
      {
        id: makeId("st"),
        movieId: MOVIES[1]?.id || "movie-2",
        movieTitle: MOVIES[1]?.title || "Hành Trình Vũ Trụ",
        date: dates[0]?.value,
        start: `${dates[0]?.value}T12:30:00`,
        end: `${dates[0]?.value}T14:30:00`,
        startTime: "12:30",
        duration: 120,
        room: "P2",
        format: "3D",
        language: "Phụ đề Việt",
        price: 110000,
        status: "open",
      },
      {
        id: makeId("st"),
        movieId: MOVIES[2]?.id || "movie-3",
        movieTitle: MOVIES[2]?.title || "Bóng Đêm Vĩnh Cửu",
        date: dates[0]?.value,
        start: `${dates[0]?.value}T16:00:00`,
        end: `${dates[0]?.value}T18:20:00`,
        startTime: "16:00",
        duration: 140,
        room: "IMAX 1",
        format: "IMAX",
        language: "Phụ đề Việt",
        price: 150000,
        status: "open",
      },
      {
        id: makeId("st"),
        movieId: MOVIES[0]?.id || "movie-1",
        movieTitle: MOVIES[0]?.title || "Biệt Đội Chiến Thần",
        date: dates[1]?.value,
        start: `${dates[1]?.value}T10:00:00`,
        end: `${dates[1]?.value}T12:00:00`,
        startTime: "10:00",
        duration: 120,
        room: "P1",
        format: "2D",
        language: "Phụ đề Việt",
        price: 90000,
        status: "locked",
      },
    ];
    return base;
  });

  const [editModal, setEditModal] = useState(null); // {mode, data}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    return showtimes
      .filter((st) => st.date === selectedDate)
      .filter((st) =>
        search
          ? st.movieTitle.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((st) => (roomFilter === "all" ? true : st.room === roomFilter))
      .filter((st) =>
        formatFilter === "all" ? true : st.format === formatFilter
      )
      .filter((st) =>
        statusFilter === "all" ? true : st.status === statusFilter
      )
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
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
        MOVIES[0]?.duration || 120
      ),
      duration: MOVIES[0]?.duration || 120,
      room: ROOM_OPTIONS[0],
      format: FORMAT_OPTIONS[0],
      language: LANGUAGE_OPTIONS[0],
      price: 90000,
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

  const handleSave = (next) => {
    setShowtimes((prev) => {
      const exists = prev.some((x) => x.id === next.id);
      if (exists) {
        return prev.map((x) => (x.id === next.id ? next : x));
      }
      return [next, ...prev];
    });
    setEditModal(null);
    setToast({ type: "success", message: "Đã lưu suất chiếu" });
  };

  const handleDelete = (id) => {
    setShowtimes((prev) => prev.filter((x) => x.id !== id));
    setDeleteTarget(null);
    setToast({ type: "success", message: "Đã xóa suất chiếu" });
  };

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

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
        <CalendarDays className="h-4 w-4 text-zinc-400" />
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <FilterChip
              key={d.value}
              label={d.label}
              active={d.value === selectedDate}
              onClick={() => setSelectedDate(d.value)}
            />
          ))}
        </div>
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
          <div className="mt-4 space-y-2 text-xs text-zinc-500">
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
