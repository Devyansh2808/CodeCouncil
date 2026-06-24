import { useState } from 'react';
import { motion } from 'motion/react';
import { AgentColumn } from '../components/AgentColumn';
import type { ReviewResponse } from '../types';

interface PanelPageProps {
  reviews: ReviewResponse[];
  onDefend: (arg: string) => void;
}

export function PanelPage({ reviews, onDefend }: PanelPageProps) {
  const [userArg, setUserArg] = useState('');

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col px-6 py-10 gap-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center space-y-1"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A7A7A7]">
          Round 0 — Independent Review
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.03em]">
          Code<span className="text-[#1DB954]">Council</span>
        </h1>
      </motion.div>

      {/* Three-column agent grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {reviews.map((review, i) => (
          <AgentColumn key={i} review={review} index={i} />
        ))}
      </div>

      {/* Defense section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55 }}
        className="max-w-2xl mx-auto w-full bg-[#1A1A1A] border border-[#3E3E3E] rounded-xl p-6 space-y-4"
      >
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Your Turn</h3>
          <p className="text-[#A7A7A7] text-sm leading-relaxed">
            Counter-argue with the panel. Explain your intent, justify your decisions, or push back against their findings.
          </p>
        </div>

        <textarea
          value={userArg}
          onChange={(e) => setUserArg(e.target.value)}
          placeholder="e.g. The SQL query only receives validated enum values from a frontend dropdown — user_id is always an integer decoded from our JWT token..."
          className="w-full h-28 bg-[#282828] border border-[#3E3E3E] focus:border-[#1DB954] rounded-lg text-sm text-white placeholder:text-[#A7A7A7]/60 p-3 resize-none outline-none transition-colors duration-200"
        />

        <div className="flex items-center justify-between">
          <p className="text-[#A7A7A7] text-xs">
            {userArg.trim() ? 'Argument ready' : 'Skip to let the panel decide without your input'}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDefend(userArg)}
            className="bg-[#1DB954] hover:bg-[#1ED760] text-black font-bold text-sm px-8 py-3 rounded-full transition-colors duration-150 cursor-pointer"
          >
            Send Argument →
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
}
