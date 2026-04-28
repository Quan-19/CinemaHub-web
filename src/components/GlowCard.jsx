/* components/GlowCard.jsx - Premium card component */
import { motion } from 'framer-motion';

export const GlowCard = ({ children, className, onClick, hoverScale = 1.02 }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden ${className}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Border gradient on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.5), 0 0 20px rgba(229,9,20,0.2)' }}
      />
      
      {children}
    </motion.div>
  );
};