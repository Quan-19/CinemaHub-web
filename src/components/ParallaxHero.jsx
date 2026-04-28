/* components/ParallaxHero.jsx - Cinematic hero banner */
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export const ParallaxHero = ({ movie, onBook, onTrailer }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={ref} className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background with parallax */}
      <motion.div
        style={{ y, scale: 1.1 }}
        className="absolute inset-0"
      >
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      </motion.div>

      {/* Cinematic glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(229,9,20,0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">NOW SHOWING</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight"
            >
              {movie.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-zinc-300 text-lg mb-6 line-clamp-2"
            >
              {movie.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={onBook}
                className="px-8 py-4 rounded-full font-bold text-white relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Đặt vé ngay
                </span>
              </button>
              
              <button
                onClick={onTrailer}
                className="px-8 py-4 rounded-full font-bold text-white border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Xem trailer
              </button>
            </motion.div>

            {/* Quick info badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <div className="flex items-center gap-2 text-zinc-300">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{movie.rating}/10</span>
                <span className="text-sm text-zinc-400">({movie.votes} đánh giá)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-5 h-5" />
                <span>{movie.duration} phút</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                movie.ageRating === 'T18' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                movie.ageRating === 'T16' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {movie.ageRating || 'T13'}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-zinc-400 text-xs">
          <span>Kéo xuống để khám phá</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};