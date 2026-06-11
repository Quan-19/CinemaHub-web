import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { normalizeShowtimePricing } from "../utils/showtimePricing";
import BookingSteps from "../components/BookingSteps";

const BRAND_COLORS = {
  EbizCinema: "#e50914",
};

const TYPE_LABELS = {
  "2D": { label: "2D", color: "#52525b" },
  "3D": { label: "3D", color: "#1d4ed8" },
  IMAX: { label: "IMAX", color: "#b45309" },
  "4DX": { label: "4DX", color: "#7c3aed" },
};

const REGION_LABEL_MAP = {
  hanoi: "Hà Nội",
  hcm: "TP.HCM",
};

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const removeDiacritics = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const createRegionOption = (regionId) => {
  const fallbackLabel = regionId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const label = REGION_LABEL_MAP[regionId] || fallbackLabel;
  return {
    id: regionId,
    label,
    desc: `Cụm rạp tại ${label}`,
  };
};

const getRegionIdFromCinema = (cinema = {}) => {
  const city = removeDiacritics(cinema.city || "").toLowerCase();
  const address = removeDiacritics(cinema.address || "").toLowerCase();

  if (
    city.includes("ha noi") ||
    city.includes("hanoi") ||
    address.includes("ha noi") ||
    address.includes("hanoi")
  ) {
    return "hanoi";
  }

  if (
    city.includes("ho chi minh") ||
    city.includes("hcm") ||
    address.includes("ho chi minh") ||
    address.includes("tp.hcm") ||
    address.includes("hcm")
  ) {
    return "hcm";
  }

  if (city) {
    return city.replace(/\s+/g, "-");
  }

  return "";
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeMovie = (movie) => ({
  ...movie,
  id: movie.id ?? movie.movie_id,
  movie_id: movie.movie_id ?? movie.id,
  genre: normalizeList(movie.genre),
  duration: movie.duration ?? 120,
  rating: movie.rating || movie.age_rating || "P",
});

const normalizeCinema = (cinema) => ({
  ...cinema,
  id: String(cinema.id ?? cinema.cinema_id),
  cinema_id: cinema.cinema_id ?? cinema.id,
  brand: cinema.brand || "Cinema",
  name: cinema.name || "Rạp chiếu",
  address: cinema.address || "",
  city: cinema.city || "",
  showtimes: [],
});

const isActiveCinema = (cinema) => {
  const status = String(cinema?.status ?? "")
    .trim()
    .toLowerCase();
  return status === "active" || status === "";
};

const isUserVisibleShowtimeStatus = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) return true;
  return normalized !== "cancelled" && normalized !== "locked";
};

export const CinemaSelectionPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiMovie, setApiMovie] = useState(null);
  const [apiCinemas, setApiCinemas] = useState([]);
  const [apiShowtimes, setApiShowtimes] = useState([]);
  const [movieLoading, setMovieLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const {
    selectedDate: cachedDate,
    selectedCinema: cachedCinema,
    setSelectedMovie,
    setSelectedCinema,
    setSelectedShowtime,
    setSelectedDate,
  } = useBooking();

  const preferredCinemaId = searchParams.get("cinemaId");
  const hasPreferredCinema = Boolean(
    preferredCinemaId &&
      apiCinemas.some((c) => String(c.id) === String(preferredCinemaId))
  );
  const preferredCinema = hasPreferredCinema
    ? apiCinemas.find(
        (cinema) => String(cinema.id) === String(preferredCinemaId)
      )
    : null;

  const dateOptions = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    const uniqueDateKeys = Array.from(
      new Set(
        apiShowtimes
          .map((showtime) => formatDateKey(showtime.date))
          .filter(Boolean)
      )
    )
      .filter((dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 13;
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return uniqueDateKeys.map((value) => {
      const currentDate = new Date(value);
      const dayLabel =
        value === todayKey
          ? "Hôm nay"
          : currentDate
              .toLocaleDateString("vi-VN", { weekday: "short" })
              .replace("thứ", "T")
              .replace("Thứ", "T");

      return {
        value,
        day: dayLabel,
        date: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
      };
    });
  }, [apiShowtimes]);

  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const selectedDateValue = dateOptions[selectedDateIdx]?.value || "";

  const cinemasWithShowtimes = useMemo(() => {
    const byCinema = new Map(
      apiCinemas.map((cinema) => [String(cinema.id), cinema])
    );
    const groupedShowtimes = new Map();

    apiShowtimes.forEach((showtime) => {
      const showDate = formatDateKey(showtime.date);

      if (!showDate || showDate !== selectedDateValue) return;

      const cinemaKey = String(showtime.cinemaId);

      if (!groupedShowtimes.has(cinemaKey)) {
        groupedShowtimes.set(cinemaKey, []);
      }

      const pricing = normalizeShowtimePricing(showtime);

      // Check if showtime is expired
      let isExpired = false;
      let isOngoing = false;
      if (showtime.date && showtime.time && showtime.endTime) {
        const now = new Date();
        const startParts = showtime.time.split(":");
        const endParts = showtime.endTime.split(":");

        const startDateObj = new Date(showtime.date);
        startDateObj.setHours(
          parseInt(startParts[0], 10),
          parseInt(startParts[1], 10),
          0,
          0
        );

        const endDateObj = new Date(showtime.date);
        endDateObj.setHours(
          parseInt(endParts[0], 10),
          parseInt(endParts[1], 10),
          0,
          0
        );

        // Handle overnight showtimes
        if (endDateObj < startDateObj) {
          endDateObj.setDate(endDateObj.getDate() + 1);
        }

        if (endDateObj < now) {
          isExpired = true;
        } else if (startDateObj <= now && endDateObj >= now) {
          isOngoing = true;
        }
      }

      groupedShowtimes.get(cinemaKey).push({
        ...showtime,
        id: String(showtime.id),
        showtime_id: showtime.id,
        time: showtime.time?.slice(0, 5),
        type: showtime.type || "2D",
        price: pricing.basePrice,
        base_price: Number(showtime.base_price) || pricing.basePrice,
        regularPrices: pricing.regularPrices,
        specialPrices: pricing.specialPrices,
        prices: pricing.prices,
        isSpecial: pricing.isSpecial,
        isExpired,
        isOngoing,
        availableSeats: showtime.availableSeats,
      });
    });
    return Array.from(groupedShowtimes.entries())
      .map(([cinemaId, showtimes]) => {
        const cinema = byCinema.get(String(cinemaId));
        if (!cinema) return null;

        return {
          ...cinema,
          showtimes: showtimes.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      })
      .filter(Boolean);
  }, [apiCinemas, apiShowtimes, selectedDateValue]);

  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (preferredCinema) return getRegionIdFromCinema(preferredCinema);
    if (cachedCinema) return getRegionIdFromCinema(cachedCinema);
    return "";
  });

  const [expandedCinema, setExpandedCinema] = useState(
    hasPreferredCinema ? preferredCinemaId : null
  );

  const regionOptions = useMemo(() => {
    const regionIds = Array.from(
      new Set(
        cinemasWithShowtimes
          .map((cinema) => getRegionIdFromCinema(cinema))
          .filter(Boolean)
      )
    );
    return regionIds.map(createRegionOption);
  }, [cinemasWithShowtimes]);
  // Restore selected date index from cache
  useEffect(() => {
    if (dateOptions.length > 0) {
      if (cachedDate) {
        const cachedIdx = dateOptions.findIndex((d) => d.value === cachedDate);
        if (cachedIdx !== -1) {
          setSelectedDateIdx(cachedIdx);
          return;
        }
      }
      // If not found in cache or no cache, stay at 0 but ensure it's in bounds
      if (selectedDateIdx >= dateOptions.length) {
        setSelectedDateIdx(0);
      }
    }
  }, [dateOptions, cachedDate, selectedDateIdx]);

  // Restore expanded cinema from cache
  useEffect(() => {
    if (cachedCinema && !expandedCinema && apiCinemas.length > 0) {
      const cinemaId = String(cachedCinema.id || cachedCinema.cinema_id);
      if (apiCinemas.some((c) => String(c.id) === cinemaId)) {
        setExpandedCinema(cinemaId);
      }
    }
  }, [cachedCinema, expandedCinema, apiCinemas]);

  useEffect(() => {
    let active = true;

    const fetchSchedules = async () => {
      setScheduleLoading(true);
      try {
        const [cinemaRes, showtimeRes] = await Promise.all([
          fetch("http://localhost:5000/api/cinemas"),
          fetch("http://localhost:5000/api/showtimes"),
        ]);

        if (!cinemaRes.ok || !showtimeRes.ok) {
          throw new Error("Failed to load schedule data");
        }

        const [cinemaData, showtimeData] = await Promise.all([
          cinemaRes.json(),
          showtimeRes.json(),
        ]);

        if (!active) return;

        const normalizedCinemas = (cinemaData || [])
          .filter(isActiveCinema)
          .map(normalizeCinema);
        const showtimesByMovie = (showtimeData || []).filter(
          (showtime) =>
            String(showtime.movieId) === String(movieId) &&
            isUserVisibleShowtimeStatus(showtime.status)
        );

        setApiCinemas(normalizedCinemas);
        setApiShowtimes(showtimesByMovie);
      } catch {
        if (!active) return;
        setApiCinemas([]);
        setApiShowtimes([]);
      } finally {
        if (active) setScheduleLoading(false);
      }
    };

    if (!movieId) {
      setApiCinemas([]);
      setApiShowtimes([]);
      setScheduleLoading(false);
      return () => {
        active = false;
      };
    }

    fetchSchedules();
    return () => {
      active = false;
    };
  }, [movieId]);

  useEffect(() => {
    if (!hasPreferredCinema && !selectedRegion) return;
    if (selectedRegion) return;
    setSelectedRegion(getRegionIdFromCinema(preferredCinema));
  }, [hasPreferredCinema, preferredCinema, selectedRegion]);

  useEffect(() => {
    if (!hasPreferredCinema || expandedCinema) return;
    setExpandedCinema(preferredCinemaId);
  }, [hasPreferredCinema, preferredCinemaId, expandedCinema]);
  useEffect(() => {
    let active = true;

    const fetchMovieById = async () => {
      setMovieLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/${movieId}`);
        if (!res.ok) throw new Error("Movie not found in API");
        const data = await res.json();
        if (active && data) {
          setApiMovie(normalizeMovie(data));
        }
      } catch {
        if (active) setApiMovie(null);
      } finally {
        if (active) setMovieLoading(false);
      }
    };

    if (!movieId) {
      setApiMovie(null);
      setMovieLoading(false);
      return () => {
        active = false;
      };
    }

    fetchMovieById();
    return () => {
      active = false;
    };
  }, [movieId]);

  const movie = apiMovie;

  const regionCinemas = useMemo(
    () =>
      cinemasWithShowtimes.filter(
        (cinema) => getRegionIdFromCinema(cinema) === selectedRegion
      ),
    [cinemasWithShowtimes, selectedRegion]
  );

  const orderedCinemas = useMemo(() => {
    if (!hasPreferredCinema || !preferredCinemaId) return regionCinemas;
    const preferred = regionCinemas.find(
      (cinema) => cinema.id === preferredCinemaId
    );
    if (!preferred) return regionCinemas;
    return [
      preferred,
      ...regionCinemas.filter((cinema) => cinema.id !== preferredCinemaId),
    ];
  }, [hasPreferredCinema, preferredCinemaId, regionCinemas]);

  if (movieLoading || scheduleLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <p className="text-zinc-400">Đang tải lịch chiếu...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <p className="text-zinc-400">Không tìm thấy phim</p>
      </div>
    );
  }

  const handleSelectShowtime = (cinemaId, showtimeId) => {
    const cinema = cinemasWithShowtimes.find(
      (c) => String(c.id) === String(cinemaId)
    );
    if (!cinema) return;

    const showtime = cinema.showtimes.find((s) => s.id === showtimeId);
    if (!showtime) return;

    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(showtime);
    setSelectedDate(selectedDateValue);
    navigate(`/seats/${showtimeId}`);
  };

  const handleSelectRegion = (regionId) => {
    setSelectedRegion(regionId);
    const cinemasInRegion = cinemasWithShowtimes.filter(
      (cinema) => getRegionIdFromCinema(cinema) === regionId
    );
    const defaultExpanded =
      hasPreferredCinema &&
      cinemasInRegion.some((cinema) => cinema.id === preferredCinemaId)
        ? preferredCinemaId
        : cinemasInRegion[0]?.id || null;
    setExpandedCinema(defaultExpanded);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cinema-bg)" }}
    >
      {/* Header synchronized with CinemaSelectionPage */}
      <div className="bg-zinc-950/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-0">
          <BookingSteps currentStep={2} />
        </div>
      </div>

      {/* Header */}
      <div
        className="border-b border-zinc-700"
        style={{ background: "var(--color-cinema-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>

          {/* Movie summary */}
          <div className="flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div>
              <h1
                className="text-white"
                style={{ fontWeight: 700, fontSize: "1.1rem" }}
              >
                {movie.title}
              </h1>
              <p className="text-zinc-400 text-sm">{movie.originalTitle}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-zinc-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {movie.duration} phút
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-xs text-white"
                  style={{
                    background:
                      movie.rating === "T18"
                        ? "#ef4444"
                        : movie.rating === "T16"
                        ? "#f97316"
                        : movie.rating === "T13"
                        ? "#f59e0b"
                        : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {movie.rating}
                </span>
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-zinc-400 text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mt-6 mb-6">
          <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>
            Chọn ngày
          </h2>
          {dateOptions.length === 0 ? (
            <p className="text-zinc-400 text-sm mt-3">
              Phim này hiện chưa có lịch chiếu.
            </p>
          ) : (
            <div className="relative">
              {/* Mobile: scroll ngang 1 hàng */}
              <div
                className="flex sm:hidden gap-2 overflow-x-auto pb-2"
                style={{
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {dateOptions.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDateIdx(i)}
                    className={`flex flex-col items-center justify-center shrink-0 w-[68px] py-3 rounded-2xl border transition-all duration-300 ${
                      selectedDateIdx === i
                        ? "border-red-600 bg-red-600/10 text-white ring-1 ring-red-600/20"
                        : "border-zinc-800 bg-[#111113] text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold mb-1 ${selectedDateIdx === i ? "text-white/80" : "text-zinc-500"}`}
                    >
                      {d.day}
                    </span>
                    <span
                      className={`text-xl font-black mb-1 ${selectedDateIdx === i ? "text-red-500" : "text-zinc-300"}`}
                    >
                      {d.date}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${selectedDateIdx === i ? "text-white/80" : "text-zinc-500"}`}
                    >
                      Tháng {d.month}
                    </span>
                  </button>
                ))}
              </div>
              {/* Gradient fade phải - chỉ mobile */}
              {dateOptions.length > 4 && (
                <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none sm:hidden -z-10" />
              )}

              {/* Desktop/Tablet: grid 7 cột × 2 hàng */}
              <div className="hidden sm:grid sm:grid-cols-7 gap-2">
                {dateOptions.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDateIdx(i)}
                    className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300 ${
                      selectedDateIdx === i
                        ? "border-red-600 bg-red-600/10 text-white ring-1 ring-red-600/20 shadow-[0_0_15px_rgba(229,9,20,0.1)]"
                        : "border-zinc-800 bg-[#111113] text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold mb-1 ${selectedDateIdx === i ? "text-white/80" : "text-zinc-500"}`}
                    >
                      {d.day}
                    </span>
                    <span
                      className={`text-xl font-black mb-1 ${selectedDateIdx === i ? "text-red-500" : "text-zinc-300"}`}
                    >
                      {d.date}
                    </span>
                    <span
                      className={`text-xs font-bold ${selectedDateIdx === i ? "text-white/80" : "text-zinc-500"}`}
                    >
                      Tháng {d.month}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Region + Cinema list */}
        <div className="mt-10 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Khu vực
            </h2>
            {selectedRegion && (
              <span className="text-zinc-500 text-xs font-medium">
                Tìm thấy {orderedCinemas.length} cụm rạp
              </span>
            )}
          </div>

          {/* Region Chips Selector - Luôn hiển thị để dễ dàng tùy chỉnh */}
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {regionOptions.map((region) => {
              const isActive = selectedRegion === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => handleSelectRegion(region.id)}
                  className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 ${
                    isActive
                      ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-[#111113] border-white/5 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <span className={`text-sm font-bold ${isActive ? "text-white" : "text-zinc-300"}`}>
                    {region.label}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>

          {!selectedRegion ? (
            <div className="py-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
              <MapPin className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Vui lòng chọn khu vực bạn muốn xem lịch chiếu</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mt-4">
                <h2 className="text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Chọn rạp chiếu tại {regionOptions.find(r => r.id === selectedRegion)?.label}
                </h2>
              </div>
            
            {hasPreferredCinema &&
              orderedCinemas.some(
                (cinema) => cinema.id === preferredCinemaId
              ) && (
                <p className="text-zinc-400 text-xs mb-3">
                  Đã ưu tiên rạp bạn vừa chọn từ trang rạp chiếu.
                </p>
              )}

            <div className="space-y-3">
              {orderedCinemas.length === 0 && (
                <div className="rounded-xl border border-zinc-700 px-4 py-5 text-zinc-400 text-sm">
                  Không có suất chiếu ở khu vực này cho ngày đã chọn.
                </div>
              )}
              {orderedCinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                  style={{ background: "#111115" }}
                >
                  {/* Cinema header */}
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all"
                    onClick={() =>
                      setExpandedCinema(
                        expandedCinema === cinema.id ? null : cinema.id
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo Ebiz */}
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-[13px] shrink-0"
                        style={{
                          background: "#e50914",
                          fontWeight: 800,
                        }}
                      >
                        {cinema.brand === "EbizCinema" ? "Ebiz" : cinema.brand}
                      </div>

                      <div className="text-left">
                        <p
                          className="text-[#e50914] text-sm uppercase"
                          style={{ fontWeight: 800, letterSpacing: "0.025em" }}
                        >
                          {cinema.name}
                        </p>
                        <p className="text-zinc-500 text-[11px] mt-0.5">
                          {cinema.address}
                        </p>
                        {preferredCinemaId === cinema.id && (
                          <div className="mt-1">
                            <span
                              className="inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                              style={{
                                background: "rgba(229,9,20,0.15)",
                                color: "#ef4444",
                              }}
                            >
                              Rạp đã chọn
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className="text-zinc-400 text-xs">
                        {cinema.showtimes.length} suất
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                          expandedCinema === cinema.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Showtimes */}
                  {expandedCinema === cinema.id && (
                    <div className="px-4 segment-separator sm:px-5 pb-5 border-t border-white/5 bg-black/20">
                      <div className="flex flex-wrap gap-3 mt-5">
                        {cinema.showtimes.map((st) => {
                          const typeInfo = TYPE_LABELS[st.type];
                          const hasSeatInfo =
                            typeof st.availableSeats === "number";
                          const isFull = hasSeatInfo && st.availableSeats === 0;
                          const isExpired = st.isExpired;
                          const isOngoing = st.isOngoing;
                          const isDisabled = isFull || isExpired || isOngoing;
                          const isLow =
                            hasSeatInfo &&
                            st.availableSeats > 0 &&
                            st.availableSeats <= 20;
                          return (
                    <button
                      key={st.id}
                      disabled={isDisabled}
                      onClick={() => handleSelectShowtime(cinema.id, st.id)}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border min-w-[110px] transition-all duration-300 ${
                        isOngoing
                          ? "border-amber-600/30 bg-amber-600/10 opacity-75 cursor-not-allowed"
                          : isExpired
                          ? "bg-zinc-900/50 border-white/5 opacity-50 cursor-not-allowed"
                          : isFull
                          ? "bg-red-900/10 border-red-900/30 opacity-70 cursor-not-allowed"
                          : "border-zinc-700 hover:border-red-500 hover:bg-red-500/5 cursor-pointer shadow-lg hover:shadow-red-500/10"
                      }`}
                    >
                      {isOngoing && (
                        <div className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10">
                          Đang chiếu
                        </div>
                      )}
                      
                      <div className="text-sm font-bold mb-1 text-white group-hover:text-red-500 transition-colors">
                        {st.time}
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <span
                          className={`px-1 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter ${
                            isDisabled
                              ? "bg-zinc-800 text-zinc-500"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {st.language === "DUB" ? "Lồng tiếng" : "Phụ đề"}
                        </span>
                        <span
                          className="px-1 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter"
                          style={{
                            background: isDisabled ? "#27272a" : typeInfo?.color || "#52525b",
                            color: isDisabled ? "#71717a" : "white",
                          }}
                        >
                          {st.type}
                        </span>
                      </div>

                      <div className={`text-[11px] font-medium mb-1 ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}>
                        {Math.round(Number(st.price || 0)).toLocaleString("vi-VN")}đ
                      </div>

                      <div className="flex items-center gap-1 mt-auto pt-1 border-t border-white/5 w-full justify-center">
                        <Users className={`w-2.5 h-2.5 ${isDisabled ? "text-zinc-600" : "text-zinc-500"}`} />
                        <span
                          className={`text-[9px] ${
                            isOngoing || isExpired || isFull
                              ? "text-zinc-500 font-medium"
                              : isLow
                              ? "text-orange-500 font-semibold"
                              : "text-zinc-500"
                          }`}
                        >
                          {isExpired
                            ? "Đã chiếu"
                            : isOngoing
                            ? "Đang chiếu"
                            : isFull
                            ? "Hết vé"
                            : isLow
                            ? `Còn ${st.availableSeats}`
                            : `${st.availableSeats} chỗ`}
                        </span>
                      </div>
                    </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CinemaSelectionPage;
