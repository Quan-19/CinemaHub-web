/* components/PremiumMovieCard.jsx - Premium movie card with 3D hover effect */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export const PremiumMovieCard = ({ movie, index }) => {
  const isNowShowing = movie.status === 'now-showing' || movie.status === 'now_showing';
  const movieId = movie.movie_id ?? movie.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative w-[200px] md:w-[220px]"
    >
      <Link to={`/movies/${movieId}`} className="block">
        {/* Movie poster with 3D tilt effect */}
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
          <motion.img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md ${
              isNowShowing 
                ? 'bg-red-500/90 text-white' 
                : 'bg-yellow-500/90 text-black'
            }`}>
              {isNowShowing ? 'Đang chiếu' : 'Sắp chiếu'}
            </span>
          </div>

          {/* Rating badge */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-white text-xs font-bold">{movie.score || '8.5'}</span>
          </div>

          {/* Quick action overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
            <button className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-bold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform">
              <Ticket className="w-4 h-4" />
              {isNowShowing ? 'Đặt vé' : 'Chi tiết'}
            </button>
          </div>
        </div>

        {/* Movie info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-white font-bold text-base line-clamp-1 group-hover:text-red-500 transition-colors">
            {movie.title}
          </h3>
          <p className="text-zinc-500 text-xs line-clamp-1">
            {movie.originalTitle || movie.title}
          </p>
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{movie.duration} phút</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <div className="flex items-center gap-1">
              <span>{movie.genre?.slice(0, 1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};