import { motion } from 'motion/react';

interface LoadingPageProps {
  message: string;
  submessage?: string;
}

export function LoadingPage({ message, submessage }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-8">

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-3 h-3 rounded-full bg-[#1DB954]"
              animate={{ scale: [0.6, 1, 0.6], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <p className="text-white text-base font-medium">{message}</p>
          {submessage && (
            <p className="text-[#A7A7A7] text-sm">{submessage}</p>
          )}
        </motion.div>

        {/* Branding */}
        <p className="text-[#3E3E3E] text-xs tracking-widest uppercase font-bold">
          Code<span className="text-[#1DB954]/40">Council</span>
        </p>
      </div>
    </div>
  );
}
