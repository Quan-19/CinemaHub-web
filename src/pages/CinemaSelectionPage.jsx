import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { MOVIES, CINEMAS, DATES } from "../data/mockData";
import { useBooking } from "../context/BookingContext";

const BRAND_COLORS = {
  CGV: "#e50914",
  Lotte: "#c41230",
  BHD: "#1e40af",
  Galaxy: "#7c3aed",
};

const TYPE_LABELS = {
  "2D": { label: "2D", color: "#52525b" },
  "3D": { label: "3D", color: "#1d4ed8" },
  IMAX: { label: "IMAX", color: "#b45309" },
  "4DX": { label: "4DX", color: "#7c3aed" },
};

export const CinemaSelectionPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedCinema, setSelectedShowtime, setSelectedDate } = useBooking();

  const movie = MOVIES.find((m) => m.id === movieId);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [expandedCinema, setExpandedCinema] = useState(CINEMAS[0].id);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <p className="text-zinc-400">Không tìm thấy phim</p>
      </div>
    );
  }

  const handleSelectShowtime = (cinemaId, showtimeId) => {
    const cinema = CINEMAS.find((c) => c.id === cinemaId);
    const showtime = cinema.showtimes.find((s) => s.id === showtimeId);
    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(showtime);
    setSelectedDate(DATES[selectedDateIdx].value);
    navigate(`/seats/${movieId}/${cinemaId}/${showtimeId}`);
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div className="border-b border-zinc-800" style={{ background: "#12121f" }}>
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
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
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
                    background: movie.rating === "T18" ? "#ef4444" : movie.rating === "T16" ? "#f97316" : movie.rating === "T13" ? "#f59e0b" : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {movie.rating}
                </span>
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-zinc-500 text-xs">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: "Chọn phim", done: true },
            { n: 2, label: "Chọn rạp & suất", active: true },
            { n: 3, label: "Chọn ghế" },
            { n: 4, label: "Xác nhận" },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step.done
                      ? "bg-green-500 text-white"
                      : step.active
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {step.done ? "✓" : step.n}
                </div>
                <span className={`text-xs hidden sm:block ${step.active ? "text-white" : step.done ? "text-green-400" : "text-zinc-500"}`}>
                  {step.label}
                </span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-zinc-700" />}
            </div>
          ))}
        </div>

        {/* Date selector */}
        <div className="mb-6">
          <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>Chọn ngày</h2>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {DATES.map((d, i) => (
              <button
                key={d.value}
                onClick={() => setSelectedDateIdx(i)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all min-w-[72px] ${
                  selectedDateIdx === i
                    ? "border-red-500 bg-red-500/10 text-white"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                <span className="text-xs mb-0.5" style={{ opacity: 0.7 }}>{d.day}</span>
                <span className="text-lg" style={{ fontWeight: 700 }}>{d.date}</span>
                <span className="text-xs" style={{ opacity: 0.7 }}>T{d.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cinema list */}
        <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>Chọn rạp chiếu</h2>
        <div className="space-y-3">
          {CINEMAS.map((cinema) => (
            <div
              key={cinema.id}
              className="rounded-xl border border-zinc-800 overflow-hidden"
              style={{ background: "#12121f" }}
            >
              {/* Cinema header */}
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                onClick={() => setExpandedCinema(expandedCinema === cinema.id ? null : cinema.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                    style={{ background: BRAND_COLORS[cinema.brand] || "#e50914", fontWeight: 700 }}
                  >
                    {cinema.brand}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>{cinema.name}</p>
                    <p className="text-zinc-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cinema.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs hidden sm:block">
                    {cinema.showtimes.length} suất chiếu
                  </span>
                  {expandedCinema === cinema.id ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Showtimes */}
              {expandedCinema === cinema.id && (
                <div className="px-4 pb-4 border-t border-zinc-800">
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cinema.showtimes.map((st) => {
                      const typeInfo = TYPE_LABELS[st.type];
                      const isFull = st.availableSeats === 0;
                      const isLow = st.availableSeats > 0 && st.availableSeats <= 20;
                      return (
                        <button
                          key={st.id}
                          disabled={isFull}
                          onClick={() => handleSelectShowtime(cinema.id, st.id)}
                          className={`group flex flex-col items-start p-3 rounded-xl border min-w-[110px] transition-all ${
                            isFull
                              ? "border-zinc-800 opacity-40 cursor-not-allowed"
                              : "border-zinc-700 hover:border-red-500 hover:bg-red-500/5 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm" style={{ fontWeight: 700 }}>
                              {st.time}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded text-xs text-white"
                              style={{ background: typeInfo?.color || "#52525b", fontWeight: 600 }}
                            >
                              {st.type}
                            </span>
                          </div>
                          <span className="text-zinc-400 text-xs">
                            {st.price.toLocaleString()}đ
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3 text-zinc-500" />
                            <span
                              className={`text-xs ${
                                isFull ? "text-zinc-600" : isLow ? "text-orange-400" : "text-zinc-500"
                              }`}
                            >
                              {isFull ? "Hết vé" : isLow ? `Còn ${st.availableSeats} ghế` : `${st.availableSeats} ghế trống`}
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
    </div>
  );
};

export default CinemaSelectionPage;
