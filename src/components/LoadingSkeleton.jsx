/* components/LoadingSkeleton.jsx - Premium loading skeletons */
import { motion } from 'framer-motion';

export const MovieCardSkeleton = () => (
  <div className="w-[190px] flex flex-col gap-3">
    <div className="aspect-[2/3] rounded-2xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-shimmer bg-[length:200%_100%]" />
    <div className="space-y-2">
      <div className="h-4 bg-zinc-800 rounded-lg w-3/4 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-1/2 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-2/3 animate-pulse" />
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="h-[70vh] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer bg-[length:200%_100%]" />
);