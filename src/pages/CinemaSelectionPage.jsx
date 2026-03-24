import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const CinemaSelectionPage = () => {

  const { movieId } = useParams();
  const navigate = useNavigate();

  // 🔥 FIX QUAN TRỌNG
  const { state } = useLocation();
  const movie = state?.movie;

  const [movieData, setMovieData] = useState(null);
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await fetch(
          `http://localhost:5000/api/movies/${movieId}`,
        );
        const movieJson = await movieRes.json();
        setMovieData(movieJson);

        const showtimeRes = await fetch(
          `http://localhost:5000/api/showtimes/movie/${movieId}`,
        );
        const showtimeJson = await showtimeRes.json();
        setShowtimes(showtimeJson);
      } catch (err) {
        console.error("Load error:", err);
      }
    };

    fetchData();
  }, [movieId]);

  if (!movieData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-zinc-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        <h1 className="text-white text-lg font-bold mb-6">
          Chọn suất chiếu cho phim {movie?.title || movieData?.title}
        </h1>

        {showtimes.length === 0 && (
          <p className="text-zinc-400">Chưa có suất chiếu</p>
        )}

        <div className="grid gap-4">
          {showtimes.map((s) => (
            <div
              key={s.showtime_id}
              className="border border-zinc-800 rounded-xl p-4 bg-[#12121f]"
            >
              <p className="text-white font-semibold">Rạp {s.cinema_name}</p>

              <p className="text-zinc-400 text-sm mb-3">Phòng: {s.room_name}</p>

              <p className="text-zinc-400 text-sm mb-3">
                {new Date(s.start_time).toLocaleString()}
              </p>

              <button
                onClick={() =>
                  navigate(`/seats/${s.showtime_id}`, {
                    state: {
                      movie: movie || movieData, // 🔥 đảm bảo luôn có movie
                    },
                  })
                }
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Chọn suất chiếu
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CinemaSelectionPage;