import { X, Calendar, Clock, User, Flag, Star, Ticket, Film, MapPin, Users, Languages, Subtitles, Youtube, Eye, Tag } from "lucide-react";

export default function MovieDetailModal({ show, onClose, movie }) {
  if (!show || !movie) return null;

  // Mảng màu sắc đa dạng cho thể loại trong modal
  const genreColors = [
    { bg: "bg-gradient-to-r from-red-500/20 to-red-600/20", text: "text-red-400", border: "border-red-500/30", hover: "hover:from-red-500/30 hover:to-red-600/30" },
    { bg: "bg-gradient-to-r from-blue-500/20 to-blue-600/20", text: "text-blue-400", border: "border-blue-500/30", hover: "hover:from-blue-500/30 hover:to-blue-600/30" },
    { bg: "bg-gradient-to-r from-green-500/20 to-green-600/20", text: "text-green-400", border: "border-green-500/30", hover: "hover:from-green-500/30 hover:to-green-600/30" },
    { bg: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20", text: "text-yellow-400", border: "border-yellow-500/30", hover: "hover:from-yellow-500/30 hover:to-yellow-600/30" },
    { bg: "bg-gradient-to-r from-purple-500/20 to-purple-600/20", text: "text-purple-400", border: "border-purple-500/30", hover: "hover:from-purple-500/30 hover:to-purple-600/30" },
    { bg: "bg-gradient-to-r from-pink-500/20 to-pink-600/20", text: "text-pink-400", border: "border-pink-500/30", hover: "hover:from-pink-500/30 hover:to-pink-600/30" },
    { bg: "bg-gradient-to-r from-indigo-500/20 to-indigo-600/20", text: "text-indigo-400", border: "border-indigo-500/30", hover: "hover:from-indigo-500/30 hover:to-indigo-600/30" },
    { bg: "bg-gradient-to-r from-teal-500/20 to-teal-600/20", text: "text-teal-400", border: "border-teal-500/30", hover: "hover:from-teal-500/30 hover:to-teal-600/30" },
    { bg: "bg-gradient-to-r from-orange-500/20 to-orange-600/20", text: "text-orange-400", border: "border-orange-500/30", hover: "hover:from-orange-500/30 hover:to-orange-600/30" },
    { bg: "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20", text: "text-cyan-400", border: "border-cyan-500/30", hover: "hover:from-cyan-500/30 hover:to-cyan-600/30" },
    { bg: "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20", text: "text-emerald-400", border: "border-emerald-500/30", hover: "hover:from-emerald-500/30 hover:to-emerald-600/30" },
    { bg: "bg-gradient-to-r from-rose-500/20 to-rose-600/20", text: "text-rose-400", border: "border-rose-500/30", hover: "hover:from-rose-500/30 hover:to-rose-600/30" },
  ];

  const getGenreColor = (genreName) => {
    let hash = 0;
    for (let i = 0; i < genreName.length; i++) {
      hash = ((hash << 5) - hash) + genreName.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % genreColors.length;
    return genreColors[index];
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusText = (status, releaseDate) => {
    const today = new Date();
    const release = new Date(releaseDate);
    
    if (release > today) return "Sắp chiếu";
    if (release <= today && status === "now_showing") return "Đang chiếu";
    return "Đã kết thúc";
  };

  const getStatusColor = (status, releaseDate) => {
    const today = new Date();
    const release = new Date(releaseDate);
    
    if (release > today) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30";
    if (release <= today && status === "now_showing") return "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30";
    return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30";
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const parseGenres = (genre) => {
    if (!genre) return [];
    if (Array.isArray(genre)) return genre;
    if (typeof genre === "string") {
      const cleaned = genre
        .replace(/[\[\]{}]/g, "")
        .replace(/\n/g, ",")
        .replace(/"/g, "")
        .trim();
      return cleaned.split(/[,，]+/).map(g => g.trim()).filter(Boolean);
    }
    return [];
  };

  const youtubeId = extractYouTubeId(movie.trailer);
  const genreList = parseGenres(movie.genre);

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-[900px] max-h-[90vh] overflow-y-auto bg-cinema-surface rounded-2xl border border-white/10 shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 bg-cinema-surface flex justify-between items-center px-6 py-5 border-b border-white/10 z-10">
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Film size={20} className="text-red-500" />
            Chi tiết phim
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* Backdrop */}
          {movie.backdrop && (
            <div className="mb-6 -mt-2 relative group">
              <img
                src={movie.backdrop}
                alt="Backdrop"
                className="w-full h-48 object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl"></div>
            </div>
          )}

          {/* Poster và thông tin chính */}
          <div className="flex gap-6 mb-6">
            {movie.poster ? (
              <div className="relative group">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-48 h-64 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='256' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18'%3E%3C/rect%3E%3Cline x1='8' y1='2' x2='8' y2='22'%3E%3C/line%3E%3Cline x1='16' y1='2' x2='16' y2='22'%3E%3C/line%3E%3Cline x1='2' y1='8' x2='22' y2='8'%3E%3C/line%3E%3Cline x1='2' y1='16' x2='22' y2='16'%3E%3C/line%3E%3C/svg%3E";
                  }}
                />
              </div>
            ) : (
              <div className="w-48 h-64 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                <Film size={48} className="text-gray-500" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
              {movie.originalTitle && (
                <p className="text-gray-400 text-sm mb-4 italic">{movie.originalTitle}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(movie.status, movie.releaseDate)}`}>
                  {getStatusText(movie.status, movie.releaseDate)}
                </span>
                {movie.ageRating && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                    {movie.ageRating}
                  </span>
                )}
                {movie.rating > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Star size={14} className="inline mr-1" />
                    {movie.rating.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                  <Calendar size={16} className="text-red-400" />
                  <span>Khởi chiếu: {formatDate(movie.releaseDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                  <Clock size={16} className="text-blue-400" />
                  <span>Thời lượng: {movie.duration || "N/A"} phút</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                  <MapPin size={16} className="text-green-400" />
                  <span>Quốc gia: {movie.country || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                  <Languages size={16} className="text-purple-400" />
                  <span>Ngôn ngữ: {movie.language || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                  <Subtitles size={16} className="text-cyan-400" />
                  <span>Phụ đề: {movie.subtitle || "N/A"}</span>
                </div>
                {movie.views !== undefined && (
                  <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg">
                    <Eye size={16} className="text-orange-400" />
                    <span>Lượt xem: {movie.views || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thể loại - MÀU SẮC ĐẶC SẮC */}
          {genreList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Tag size={16} className="text-red-400" />
                Thể loại
              </h3>
              <div className="flex flex-wrap gap-2">
                {genreList.map((genre, index) => {
                  const colors = getGenreColor(genre);
                  return (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border} ${colors.hover} transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg`}
                    >
                      {genre}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Đạo diễn */}
          {movie.director && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <User size={16} className="text-blue-400" />
                Đạo diễn
              </h3>
              <p className="text-gray-300 bg-white/5 p-3 rounded-lg">{movie.director}</p>
            </div>
          )}

          {/* Diễn viên */}
          {movie.cast && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users size={16} className="text-green-400" />
                Diễn viên
              </h3>
              <p className="text-gray-300 bg-white/5 p-3 rounded-lg">{movie.cast}</p>
            </div>
          )}

          {/* Mô tả */}
          {movie.description && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Mô tả</h3>
              <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-lg">{movie.description}</p>
            </div>
          )}

          {/* Trailer */}
          {youtubeId && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Youtube size={16} className="text-red-500" />
                Trailer
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="Trailer"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-cinema-surface px-6 py-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full h-[44px] bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all duration-300 font-medium shadow-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}