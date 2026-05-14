import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-dark/90 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Progress Ring */}
        <motion.div
          className="absolute inset-0 border-t-2 border-primary rounded-full shadow-[0_0_15px_rgba(201,162,39,0.3)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center Logo Shimmer */}
        <motion.div
          className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-4 h-4 bg-primary rotate-45" />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-primary"
      >
        Experience Redefined
      </motion.p>
    </div>
  );
};

export default Loader;
