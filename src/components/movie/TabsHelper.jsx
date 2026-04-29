import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  User,
  Heart,
  Info,
  ChevronRight,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ShowtimesTab = ({ showtimes }) => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [expandedCinemas, setExpandedCinemas] = useState({});
  const navigate = useNavigate();

  // Group showtimes by Date -> Cinema
  const groupedDates = (showtimes || []).reduce((acc, st) => {
    if (!acc[st.date]) acc[st.date] = {};
    if (!acc[st.date][st.cinemaName]) acc[st.date][st.cinemaName] = [];
    acc[st.date][st.cinemaName].push(st);
    return acc;
  }, {});

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Object.keys(groupedDates)
      .sort()
      .filter((dateStr) => {
        const parsed = new Date(dateStr);
        if (Number.isNaN(parsed.getTime())) return false;
        parsed.setHours(0, 0, 0, 0);
        return parsed >= today;
      });
  }, [groupedDates]);
  const safeSelectedDate = selectedDate < dates.length ? selectedDate : 0;
  const currentShowtimes = dates[safeSelectedDate]
    ? groupedDates[dates[safeSelectedDate]]
    : {};

  // Formatter for day mapping
  const formatDay = (dateStr) => {
    const d = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      dayOfWeek: days[d.getDay()],
      date: String(d.getDate()).padStart(2, "0"),
      month: String(d.getMonth() + 1).padStart(2, "0"),
    };
  };

  const toggleCinema = (name) => {
    setExpandedCinemas((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-10">
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Chọn ngày</h3>
        <div
          className="flex gap-2 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {dates.length === 0 && (
            <p className="text-zinc-500 text-sm">
              Chưa có lịch chiếu cho phim này.
            </p>
          )}
          {dates.map((d, index) => {
            const { dayOfWeek, date, month } = formatDay(d);
            const active = index === safeSelectedDate;
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(index)}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border transition-all shrink-0 ${
                  active
                    ? "border-red-600 text-white bg-[#18181b]"
                    : "border-zinc-800 text-zinc-500 bg-[#111113] hover:bg-zinc-900"
                }`}
              >
                <div
                  className={`text-xs font-bold mb-1 ${
                    active ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {dayOfWeek}
                </div>
                <div
                  className={`text-2xl font-black mb-1 ${
                    active ? "text-red-500" : "text-zinc-300"
                  }`}
                >
                  {date}
                </div>
                <div
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-zinc-500"
                  }`}
                >
                  T{month}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(currentShowtimes).map((cinemaName) => {
          const isExpanded = expandedCinemas[cinemaName] === true;
          const cinemaShows = currentShowtimes[cinemaName] || [];
          const firstWithAddress =
            cinemaShows.find((s) => s.cinemaAddress || s.address) ||
            cinemaShows[0] ||
            {};
          const displayAddress =
            firstWithAddress.cinemaAddress ||
            firstWithAddress.address ||
            "Đang cập nhật địa chỉ";

          return (
            <div
              key={cinemaName}
              className="bg-[#111113] border border-zinc-800/80 rounded-[20px] p-5 shadow-lg"
            >
              <div
                className="flex items-start justify-between cursor-pointer group"
                onClick={() => toggleCinema(cinemaName)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-white font-black text-sm">
                      {cinemaName.split(" ")[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[15px] group-hover:text-red-500 transition-colors uppercase">
                      {cinemaName}
                    </h4>
                    <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
                      <Info className="w-3 h-3" />
                      <span className="truncate max-w-[200px] sm:max-w-md">
                        {displayAddress}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-semibold whitespace-nowrap">
                  <span className="hidden sm:inline">
                    {cinemaShows.length} suất
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-zinc-800/60 animate-in slide-in-from-top-2 duration-300">
                  {currentShowtimes[cinemaName].map((st) => {
                    const isImax = String(st.type).includes("IMAX");
                    const is3D = String(st.type).includes("3D");

                    let isExpired = false;
                    if (st.date && st.time && st.endTime) {
                      const now = new Date();
                      const startParts = st.time.split(":");
                      const endParts = st.endTime.split(":");

                      const startDateObj = new Date(st.date);
                      startDateObj.setHours(
                        parseInt(startParts[0], 10),
                        parseInt(startParts[1], 10),
                        0,
                        0
                      );

                      const endDateObj = new Date(st.date);
                      endDateObj.setHours(
                        parseInt(endParts[0], 10),
                        parseInt(endParts[1], 10),
                        0,
                        0
                      );

                      // Handle overnight showtimes correctly
                      if (endDateObj < startDateObj) {
                        endDateObj.setDate(endDateObj.getDate() + 1);
                      }

                      if (endDateObj < now) {
                        isExpired = true;
                      }
                    }

                    return (
                      <div
                        key={st.id}
                        onClick={() =>
                          !isExpired && navigate(`/seats/${st.id}`)
                        }
                        className={`border rounded-2xl p-3 min-w-[120px] transition-all text-left group/st relative overflow-hidden ${
                          isExpired
                            ? "border-zinc-800 bg-zinc-900/30 opacity-50 cursor-not-allowed"
                            : "border-zinc-700/80 bg-zinc-900/50 hover:bg-zinc-800 hover:border-red-600/50 hover:scale-[1.02] cursor-pointer"
                        }`}
                      >
                        {isExpired && (
                          <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10">
                            Đã chiếu
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-1.5">
                          <span
                            className={`font-bold text-[17px] transition-colors ${
                              isExpired
                                ? "text-zinc-500"
                                : "text-white group-hover/st:text-red-500"
                            }`}
                          >
                            {st.time}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isExpired
                                ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                : is3D
                                ? "bg-blue-600 text-white"
                                : isImax
                                ? "bg-orange-500 text-white"
                                : "bg-zinc-800 border border-zinc-700 text-white"
                            }`}
                          >
                            {st.type}
                          </span>
                        </div>
                        <div
                          className={`font-semibold text-xs mb-1.5 ${
                            isExpired ? "text-zinc-600" : "text-zinc-300"
                          }`}
                        >
                          {Number(st.prices?.Thường || 0) > 0
                            ? Math.round(
                                Number(st.prices.Thường)
                              ).toLocaleString("vi-VN")
                            : "90.000"}
                          đ
                        </div>
                        <div
                          className={`text-[11px] flex items-center gap-1.5 font-medium ${
                            isExpired ? "text-zinc-600" : "text-zinc-500"
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          {isExpired ? (
                            <span>{st.totalSeats || 45} ghế</span>
                          ) : st.remainingSeats > 0 ? (
                            <span className="text-amber-500">
                              Còn {st.remainingSeats}
                            </span>
                          ) : (
                            <span>{st.totalSeats || 45} ghế</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ReviewsTab = ({ movieId, reviews, onReviewSubmit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notif, setNotif] = useState(null);
  const [filter, setFilter] = useState("newest");

  // Reorder and Sort logic
  const sortedReviews = useMemo(() => {
    let list = [...reviews];

    // 1. Initial Sort based on filter
    if (filter === "newest") {
      list.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    } else if (filter === "rating") {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    // 2. Pin current user review to top
    if (user) {
      const mineIndex = list.findIndex(
        (r) => String(r.user_id) === String(user.user_id)
      );
      if (mineIndex > -1) {
        const [mine] = list.splice(mineIndex, 1);
        list = [mine, ...list];
      }
    }
    return list;
  }, [reviews, user, filter]);

  const existingReview = useMemo(() => {
    return user
      ? reviews.find((r) => String(r.user_id) === String(user.user_id))
      : null;
  }, [reviews, user]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length
        ).toFixed(1)
      : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  const showNotification = (type, msg) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 5000);
  };

  const handleEdit = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsEditing(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const cancelEdit = () => {
    setRating(5);
    setComment("");
    setIsEditing(false);
  };

  const handleLike = async (reviewId) => {
    if (!user)
      return showNotification("error", "Vui lòng đăng nhập để thích bài viết");
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/${reviewId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id }),
        }
      );
      if (res.ok) {
        if (onReviewSubmit) onReviewSubmit();
      }
    } catch {
      console.error("Lỗi like");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)
      return showNotification("error", "Vui lòng đăng nhập để đánh giá");
    if (!comment.trim())
      return showNotification("error", "Vui lòng nhập bình luận");

    if (existingReview && !isEditing) {
      showNotification(
        "warning",
        "Bạn đã đánh giá phim này rồi. Hãy sử dụng nút chỉnh sửa bên dưới."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          movie_id: movieId,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        showNotification(
          "success",
          isEditing
            ? "Cập nhật đánh giá thành công!"
            : "Đã gửi đánh giá của bạn!"
        );
        setComment("");
        setRating(5);
        setIsEditing(false);
        if (onReviewSubmit) onReviewSubmit();
      } else {
        const errData = await res.json().catch(() => ({}));
        showNotification(
          "error",
          `Có lỗi xảy ra: ${errData.message || "Vui lòng thử lại sau"}`
        );
      }
    } catch {
      showNotification("error", "Lỗi kết nối mạng.");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-10">
      {/* NOTIFICATION TOAST */}
      <div className="fixed top-24 right-4 z-[100] space-y-3 pointer-events-none">
        {notif && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4 duration-300 pointer-events-auto ${
              notif.type === "success"
                ? "bg-green-500/90 text-white"
                : notif.type === "warning"
                ? "bg-amber-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {notif.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">{notif.msg}</span>
            <button
              onClick={() => setNotif(null)}
              className="ml-2 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-xl">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="text-5xl font-black text-white">{averageRating}</div>
          <div className="flex mt-2 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-600"
                }`}
              />
            ))}
          </div>
          <div className="text-zinc-500 text-xs">{reviews.length} đánh giá</div>
        </div>

        <div className="flex-1 w-full space-y-1.5 flex flex-col-reverse">
          {[1, 2, 3, 4, 5].map((star) => {
            const pct =
              reviews.length > 0
                ? (ratingCounts[star] / reviews.length) * 100
                : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="text-zinc-400 w-3 text-right">{star}</div>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-zinc-500 w-4 text-xs text-right">
                  {ratingCounts[star]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-4 mt-8">
        <span className="text-zinc-100 font-bold text-base">
          {reviews.length} đánh giá
        </span>
        <div className="flex p-1 bg-zinc-900/90 border border-zinc-800/50 rounded-full shadow-inner">
          <button
            onClick={() => setFilter("helpful")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              filter === "helpful"
                ? "bg-red-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Hữu ích nhất
          </button>
          <button
            onClick={() => setFilter("rating")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              filter === "rating"
                ? "bg-red-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Điểm cao
          </button>
          <button
            onClick={() => setFilter("newest")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              filter === "newest"
                ? "bg-red-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mới nhất
          </button>
        </div>
      </div>

      {/* WRITE REVIEW */}
      <div
        ref={formRef}
        className={`bg-zinc-900/60 border rounded-2xl p-6 mb-4 transition-colors ${
          isEditing ? "border-amber-500/50" : "border-zinc-800"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">
            {isEditing ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá của bạn"}
          </h3>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-bold uppercase transition-colors"
            >
              <X className="w-3 h-3" /> Hủy chỉnh sửa
            </button>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-3 mb-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                {user.displayName?.substring(0, 1).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm">
                {user.displayName || "Thành viên"}
              </p>
              <p className="text-zinc-500 text-xs">
                {isEditing
                  ? "Đang cập nhật đánh giá..."
                  : "Đang viết đánh giá..."}
              </p>
            </div>
          </div>
        ) : null}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wide font-semibold mb-2">
                Điểm đánh giá *
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      i <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-600 hover:text-zinc-400"
                    }`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wide font-semibold mb-2">
                Nhận xét *
              </p>
              <textarea
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-zinc-600"
                rows="4"
                placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2 rounded-xl transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                disabled={submitting}
                type="submit"
                className={`${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white font-bold px-6 py-2 rounded-xl transition-colors disabled:opacity-50 shadow-lg`}
              >
                {submitting
                  ? "Đang gửi..."
                  : isEditing
                  ? "Cập nhật ngay"
                  : "Gửi bài đánh giá"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 border border-zinc-800 rounded-xl bg-zinc-900/30">
            <p className="text-zinc-400 mb-3 text-sm">
              Vui lòng đăng nhập để có thể để lại bài đánh giá cho bộ phim này.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-white text-black font-bold uppercase tracking-wide text-xs px-6 py-2.5 rounded-full shadow-lg"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {sortedReviews.map((r) => {
          const isCurrentUser =
            user && String(user.user_id) === String(r.user_id);
          const finalName =
            r.user_name || (isCurrentUser ? user.displayName : "Thành viên");
          const finalAvatar =
            r.avatar || (isCurrentUser ? user.photoURL : null);

          // Real likes count from DB
          const likeCount = r.likes_count || 0;

          return (
            <div
              key={r.review_id}
              className={`bg-[#111116] border rounded-2xl p-6 transition-all duration-300 ${
                isCurrentUser
                  ? "border-red-600/40 ring-1 ring-red-600/10"
                  : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {finalAvatar ? (
                    <img
                      src={finalAvatar}
                      alt={finalName}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-zinc-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-bold text-lg shrink-0 border-2 border-zinc-800">
                      {finalName
                        ? finalName.substring(0, 1).toUpperCase()
                        : "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-base tracking-tight">
                        {finalName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i <= r.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-zinc-500 text-[11px] font-medium">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("vi-VN")
                      : ""}
                  </div>
                  {isCurrentUser && (
                    <button
                      onClick={handleEdit}
                      className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-zinc-700/50"
                      title="Chỉnh sửa đánh giá"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-zinc-300 text-[14.5px] leading-relaxed mt-2 font-medium">
                {r.comment}
              </p>

              <div className="flex items-center gap-4 pt-3 border-t border-zinc-800/50">
                <button
                  onClick={() => handleLike(r.review_id)}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-colors group"
                >
                  <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">
                    {likeCount} lượt thích
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
