import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Globe,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import {
  ddmmyyyyToInput,
  inputToDdmmyyyy,
  makeId,
} from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";
import { getAuth } from "firebase/auth";

const GENRE_OPTIONS = [
  "Hành động",
  "Phiêu lưu",
  "Kinh dị",
  "Tâm lý",
  "Tình cảm",
  "Hoạt hình",
  "Gia đình",
  "Chính kịch",
  "Giả tưởng",
  "Khoa học viễn tưởng",
  "Tội phạm",
];

const RATING_OPTIONS = ["P", "T13", "T16", "T18"];
const STATUS_OPTIONS = [
  { label: "Đang chiếu", value: "now_showing" },
  { label: "Sắp chiếu", value: "coming_soon" },
];

const LANGUAGE_OPTIONS = ["Phụ đề Việt", "Lồng tiếng Việt"];
const COUNTRY_OPTIONS = ["Mỹ", "Việt Nam", "Hàn Quốc", "Nhật Bản", "Anh"];

function normalizeMovie(movie) {
  const genreMap = {
    Action: "Hành động",
    Adventure: "Phiêu lưu",
    Horror: "Kinh dị",
    Thriller: "Tâm lý",
    Mystery: "Tâm lý",
    Romance: "Tình cảm",
    Animation: "Hoạt hình",
    Family: "Gia đình",
    Drama: "Chính kịch",
    Fantasy: "Giả tưởng",
    "Sci-Fi": "Khoa học viễn tưởng",
    Crime: "Tội phạm",
  };

  const rawGenres = Array.isArray(movie.genre) ? movie.genre : [];
  const mappedGenres = rawGenres
    .map((g) => (genreMap[g] ? genreMap[g] : g))
    .filter(Boolean);

  return {
    ...movie,
    genre: mappedGenres,
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    director: movie.director || "",
    language: movie.language || "Phụ đề Việt",
    country: movie.country || "Mỹ",
  };
}

function StatusBadge({ status }) {
  const isNowShowing = status === "now_showing";
  return (
    <span
      className={[
        "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
        isNowShowing
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-amber-500/20 text-amber-300",
      ].join(" ")}
    >
      {isNowShowing ? "Đang chiếu" : "Sắp chiếu"}
    </span>
  );
}

function RatingBadge({ rating }) {
  return (
    <span className="rounded-lg bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-200">
      {rating}
    </span>
  );
}

function EditMovieModal({
  movie,
  onCancel,
  onSave,
  title = "Chỉnh sửa phim",
  submitLabel = "Lưu thay đổi",
  mode = "edit",
}) {
  const isAdd = mode === "add";
  const [errors, setErrors] = useState({});
  const scrollRef = useRef(null);
  const posterRef = useRef(null);
  const backdropRef = useRef(null);

  const [form, setForm] = useState(() => {
    const m = normalizeMovie(movie);
    return {
      poster: m.poster || "",
      backdrop: m.backdrop || "",
      title: m.title || "",
      originalTitle: m.originalTitle || "",
      genre: [...(m.genre || [])],
      rating: m.rating || "T16",
      duration: m.duration ?? "",
      status: m.status || "now_showing",
      releaseDate: ddmmyyyyToInput(m.releaseDate) || "",
      director: m.director || "",
      castText: (m.cast || []).join(", "),
      description: m.description || "",
      language: m.language || "Phụ đề Việt",
      country: m.country || "Mỹ",
    };
  });

  const toggleGenre = (g) => {
    setForm((prev) => {
      const has = prev.genre.includes(g);
      return {
        ...prev,
        genre: has ? prev.genre.filter((x) => x !== g) : [...prev.genre, g],
      };
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, [field]: url }));
    }
  };

  const save = (e) => {
    e.preventDefault();

    if (isAdd) {
      const nextErrors = {};
      if (!form.poster.trim()) nextErrors.poster = "Vui lòng nhập URL Poster";
      if (!form.backdrop.trim())
        nextErrors.backdrop = "Vui lòng nhập URL Backdrop";
      if (!form.title.trim())
        nextErrors.title = "Vui lòng nhập tên phim (tiếng Việt)";
      if (!form.originalTitle.trim())
        nextErrors.originalTitle = "Vui lòng nhập tên gốc";
      if (!Array.isArray(form.genre) || form.genre.length === 0)
        nextErrors.genre = "Vui lòng chọn ít nhất 1 thể loại";
      if (!String(form.duration ?? "").trim() || Number(form.duration) <= 0)
        nextErrors.duration = "Vui lòng nhập thời lượng hợp lệ";
      if (!form.releaseDate)
        nextErrors.releaseDate = "Vui lòng chọn ngày ra mắt";
      if (!form.director.trim()) nextErrors.director = "Vui lòng nhập đạo diễn";

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const updated = {
      id: movie.id,
    };

    // chỉ add nếu có giá trị
    if (form.poster.trim()) updated.poster = form.poster.trim();
    if (form.backdrop.trim()) updated.backdrop = form.backdrop.trim();
    if (form.title.trim()) updated.title = form.title.trim();
    if (form.originalTitle.trim())
      updated.originalTitle = form.originalTitle.trim();

    if (form.genre.length > 0) updated.genre = form.genre;

    if (form.rating) updated.rating = form.rating;

    if (form.duration) updated.duration = Number(form.duration);

    if (form.status) updated.status = form.status;

    if (form.releaseDate) {
      updated.releaseDate = inputToDdmmyyyy(form.releaseDate);
    }

    if (form.director.trim()) updated.director = form.director.trim();

    if (form.castText.trim()) {
      updated.cast = form.castText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    if (form.description.trim()) updated.description = form.description.trim();

    if (form.language) updated.language = form.language;
    if (form.country) updated.country = form.country;
    onSave(updated);
  };

  const inputBase =
    "mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cinema-primary";
  const labelBase = "text-xs font-semibold text-zinc-400";
  const errorText = "mt-1 text-xs font-semibold text-cinema-primary";

  return (
    <StaffCenteredModalShell
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1"
        >
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="w-full sm:w-36">
              <label className={labelBase}>Poster phim</label>
              <div
                onClick={() => posterRef.current?.click()}
                className={[
                  "relative mt-1.5 flex aspect-[2/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all hover:border-cinema-primary/50 hover:bg-zinc-900/60",
                  errors.poster
                    ? "border-cinema-primary/50 bg-cinema-primary/5"
                    : "border-zinc-800 bg-zinc-900/40",
                ].join(" ")}
              >
                {form.poster ? (
                  <>
                    <img
                      src={form.poster}
                      alt="Poster"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-5 w-5 text-white" />
                        <span className="text-[10px] font-bold text-white">
                          Thay đổi
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                    <div className="text-xs font-semibold text-zinc-300">
                      Tải poster
                    </div>
                  </div>
                )}
                <input
                  ref={posterRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "poster")}
                  className="hidden"
                />
              </div>
              {errors.poster ? (
                <div className={errorText}>{errors.poster}</div>
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <label className={labelBase}>Backdrop (Ảnh nền)</label>
              <div
                onClick={() => backdropRef.current?.click()}
                className={[
                  "relative mt-1.5 flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all hover:border-cinema-primary/50 hover:bg-zinc-900/60",
                  errors.backdrop
                    ? "border-cinema-primary/50 bg-cinema-primary/5"
                    : "border-zinc-800 bg-zinc-900/40",
                ].join(" ")}
              >
                {form.backdrop ? (
                  <>
                    <img
                      src={form.backdrop}
                      alt="Backdrop"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-5 w-5 text-white" />
                        <span className="text-[10px] font-bold text-white">
                          Thay đổi
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                    <div className="text-xs font-semibold text-zinc-300">
                      Tải backdrop
                    </div>
                  </div>
                )}
                <input
                  ref={backdropRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "backdrop")}
                  className="hidden"
                />
              </div>
              {errors.backdrop ? (
                <div className={errorText}>{errors.backdrop}</div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelBase}>Tên phim (tiếng Việt)</label>
              <input
                className={[
                  inputBase,
                  errors.title ? "border-cinema-primary" : "",
                ].join(" ")}
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              {errors.title ? (
                <div className={errorText}>{errors.title}</div>
              ) : null}
            </div>
            <div>
              <label className={labelBase}>Tên gốc</label>
              <input
                className={[
                  inputBase,
                  errors.originalTitle ? "border-cinema-primary" : "",
                ].join(" ")}
                value={form.originalTitle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, originalTitle: e.target.value }))
                }
              />
              {errors.originalTitle ? (
                <div className={errorText}>{errors.originalTitle}</div>
              ) : null}
            </div>
          </div>

          <div>
            <div className={labelBase}>Thể loại</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => {
                const active = form.genre.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      active
                        ? "bg-cinema-primary text-white"
                        : "border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
                    ].join(" ")}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            {errors.genre ? (
              <div className={errorText}>{errors.genre}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelBase}>Phân loại</label>
              <select
                className={inputBase}
                value={form.rating}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rating: e.target.value }))
                }
              >
                {RATING_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Thời lượng (phút)</label>
              <input
                className={[
                  inputBase,
                  errors.duration ? "border-cinema-primary" : "",
                ].join(" ")}
                value={form.duration}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration: e.target.value }))
                }
                inputMode="numeric"
              />
              {errors.duration ? (
                <div className={errorText}>{errors.duration}</div>
              ) : null}
            </div>
            <div>
              <label className={labelBase}>Trạng thái</label>
              <select
                className={inputBase}
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Ngày ra mắt</label>
              <input
                type="date"
                className={[
                  inputBase,
                  errors.releaseDate ? "border-cinema-primary" : "",
                ].join(" ")}
                value={form.releaseDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, releaseDate: e.target.value }))
                }
              />
              {errors.releaseDate ? (
                <div className={errorText}>{errors.releaseDate}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className={labelBase}>Đạo diễn</label>
            <input
              className={[
                inputBase,
                errors.director ? "border-cinema-primary" : "",
              ].join(" ")}
              value={form.director}
              onChange={(e) =>
                setForm((p) => ({ ...p, director: e.target.value }))
              }
            />
            {errors.director ? (
              <div className={errorText}>{errors.director}</div>
            ) : null}
          </div>

          <div>
            <label className={labelBase}>
              Diễn viên (cách nhau bằng dấu phẩy)
            </label>
            <input
              className={inputBase}
              value={form.castText}
              onChange={(e) =>
                setForm((p) => ({ ...p, castText: e.target.value }))
              }
            />
          </div>

          <div>
            <label className={labelBase}>Mô tả</label>
            <textarea
              className={[inputBase, "min-h-[92px] resize-none"].join(" ")}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelBase}>Ngôn ngữ</label>
              <select
                className={inputBase}
                value={form.language}
                onChange={(e) =>
                  setForm((p) => ({ ...p, language: e.target.value }))
                }
              >
                {LANGUAGE_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Quốc gia</label>
              <select
                className={inputBase}
                value={form.country}
                onChange={(e) =>
                  setForm((p) => ({ ...p, country: e.target.value }))
                }
              >
                {COUNTRY_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-800 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="h-11 rounded-xl bg-cinema-primary text-sm font-semibold text-white hover:opacity-95"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </StaffCenteredModalShell>
  );
}

function StaffMovieCard({ movie, onEdit, onDelete }) {
  const genres = Array.isArray(movie.genre) ? movie.genre : [];
  const director = movie.director || "";

  return (
    <article className="group cinema-surface overflow-hidden">
      <div className="px-3 pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1 text-yellow-400">
            <Star className="h-3.5 w-3.5" />
            <span className="font-semibold text-yellow-300">
              {movie.rating || "N/A"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <Clock className="h-3.5 w-3.5" />
            {movie.duration ? `${movie.duration} phút` : "—"}
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <Globe className="h-3.5 w-3.5" />
            {movie.subtitle || "Phụ đề Việt"}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-full bg-cinema-primary/15 px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              {g}
            </span>
          ))}
          {genres.length > 2 ? (
            <span className="rounded-full bg-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
              +{genres.length - 2}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3 h-40 overflow-hidden sm:h-44">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={movie.status} />
        </div>
        <div className="absolute right-3 top-3">
          <RatingBadge rating={movie.ageRating || "T16"} />
        </div>

        <div className="absolute inset-0 z-10 hidden items-center justify-center gap-3 opacity-0 pointer-events-none transition duration-200 [@media(hover:hover)]:flex [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-blue-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <Pencil className="h-4 w-4" />
            Sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-cinema-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:opacity-95 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cinema-primary/40"
          >
            <Trash2 className="h-4 w-4" />
            Xoá
          </button>
        </div>
      </div>

      <div className="px-3 pt-3 sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 active:scale-95"
          >
            <Pencil className="h-4 w-4" />
            Sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-cinema-primary text-sm font-semibold text-white hover:opacity-95 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            Xoá
          </button>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-white sm:text-base">
          {movie.title}
        </div>
        <div className="text-xs text-zinc-400">{movie.originalTitle}</div>
        {director ? (
          <div className="mt-2 text-xs text-zinc-500">Đạo diễn: {director}</div>
        ) : null}
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          {movie.releaseDate || "—"}
        </div>
      </div>
    </article>
  );
}

function StaffMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        setMovies(data);
      } catch (err) {
        console.error("Fetch movies error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
    if (loading) {
      return <div className="text-white p-6">Loading movies...</div>;
    }
  }, []);

  const showSuccess = (message) => {
    setToast({ message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const closeEdit = () => setEditing(null);
  const closeDelete = () => setConfirmDelete(null);
  const closeAdd = () => setAdding(false);

  const onSave = async (updated) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await fetch(`http://localhost:5000/api/movies/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      // reload lại
      const res = await fetch("http://localhost:5000/api/movies");
      const data = await res.json();
      setMovies(data);

      closeEdit();
      showSuccess("Cập nhật phim thành công");
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMovies((prev) => prev.filter((m) => m.id !== id));
      closeDelete();
    } catch (err) {
      console.error(err);
    }
  };

  const onAdd = async (created) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch("http://localhost:5000/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...created,
          genre: created.genre, // array OK
        }),
      });

      const result = await res.json();

      // reload lại list
      const newRes = await fetch("http://localhost:5000/api/movies");
      const newData = await newRes.json();
      setMovies(newData);

      closeAdd();
      showSuccess("Thêm phim thành công");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((m) => {
      if (tab !== "all" && m.status !== tab) return false;
      if (!q) return true;
      const director = (m.director || "").toLowerCase();
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.originalTitle || "").toLowerCase().includes(q) ||
        director.includes(q)
      );
    });
  }, [movies, query, tab]);

  const addTemplate = useMemo(() => {
    if (!adding) return null;
    return normalizeMovie({
      id: makeId(),
      title: "",
      originalTitle: "",
      status: "now-showing",
      genre: [],
      score: 0,
      votes: 0,
      duration: 0,
      rating: "P",
      description: "",
      backdrop: "",
      poster: "",
      releaseDate: "",
      director: "",
      language: "Phụ đề Việt",
      country: "Mỹ",
      cast: [],
    });
  }, [adding]);

  return (
    <div className="space-y-5">
      <StaffSuccessToast message={toast?.message} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Quản lý phim</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {filteredMovies.length} phim trong hệ thống
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-cinema-primary px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Thêm phim
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên phim, đạo diễn..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cinema-primary focus:bg-zinc-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {[
              { label: "Tất cả", value: "all" },
              { label: "Đang chiếu", value: "now_showing" },
              { label: "Sắp chiếu", value: "coming_soon" },
            ].map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={[
                    "h-11 rounded-2xl px-4 text-sm font-semibold transition",
                    active
                      ? "bg-cinema-primary text-white"
                      : "border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filteredMovies.map((movie) => (
          <StaffMovieCard
            key={movie.id}
            movie={movie}
            onEdit={() => setEditing(movie)}
            onDelete={() => setConfirmDelete(movie)}
          />
        ))}
      </section>

      {editing ? (
        <EditMovieModal
          movie={editing}
          onCancel={closeEdit}
          onSave={onSave}
          title="Chỉnh sửa phim"
          submitLabel="Lưu thay đổi"
          mode="edit"
        />
      ) : null}

      {adding ? (
        <EditMovieModal
          movie={addTemplate}
          onCancel={closeAdd}
          onSave={onAdd}
          title="Thêm phim"
          submitLabel="Thêm phim"
          mode="add"
        />
      ) : null}

      {confirmDelete ? (
        <StaffConfirmModal
          shell="centered"
          headerTitle="Xác nhận xoá"
          title={confirmDelete.title}
          onCancel={closeDelete}
          onConfirm={() => onDelete(confirmDelete.id)}
          cancelLabel="Huỷ"
          confirmLabel="Xoá"
          maxWidthClassName="max-w-md"
          buttonRadiusClassName="rounded-xl"
        >
          <p className="text-sm text-zinc-300">
            Bạn chắc chắn muốn xoá phim{" "}
            <span className="font-semibold text-white">
              {confirmDelete.title}
            </span>
            ?
          </p>
        </StaffConfirmModal>
      ) : null}
    </div>
  );
}

export default StaffMoviesPage;
