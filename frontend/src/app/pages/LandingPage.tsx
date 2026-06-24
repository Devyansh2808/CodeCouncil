import { motion } from 'motion/react';

const AGENTS = [
  { name: 'Alex',   role: 'Backend Engineer',          icon: '⚙️', color: '#3B82F6' },
  { name: 'Sam',    role: 'Security Engineer',          icon: '🔒', color: '#EF4444' },
  { name: 'Jordan', role: 'Maintainability Architect',  icon: '🏗️', color: '#A855F7' },
];

const STEPS = [
  { n: '01', label: 'Submit your code',          desc: 'Paste it directly or upload a file.' },
  { n: '02', label: 'Three AI engineers review', desc: 'Independent analysis across three disciplines.' },
  { n: '03', label: 'You argue back',            desc: 'Counter their findings with your context.' },
  { n: '04', label: 'Manager delivers verdict',  desc: 'A final decision with prioritised action items.' },
];

export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-6 py-16 gap-14">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center space-y-5 max-w-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1DB954]">
          AI Code Review
        </p>
        <h1 className="text-[56px] leading-[1.05] font-bold tracking-[-0.03em]">
          Code<span className="text-[#1DB954]">Council</span>
        </h1>
        <p className="text-[#A7A7A7] text-base leading-relaxed max-w-lg mx-auto">
          Three AI engineers independently debate your code — then you get the chance to argue back — before a manager delivers the final verdict.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="mt-2 inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ED760] text-black font-bold text-sm px-10 py-4 rounded-full transition-colors duration-150 cursor-pointer"
        >
          Start Review →
        </motion.button>
      </motion.div>

      {/* Agent cards */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-3 gap-4 w-full max-w-xl"
      >
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="bg-[#1A1A1A] border border-[#3E3E3E] rounded-xl p-5 text-center space-y-3"
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl"
              style={{ backgroundColor: agent.color + '18', border: `1px solid ${agent.color}44` }}
            >
              {agent.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{agent.name}</p>
              <p className="text-xs text-[#A7A7A7] mt-0.5 leading-tight">{agent.role}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl"
      >
        {STEPS.map((step) => (
          <div key={step.n} className="space-y-2">
            <p className="text-[#1DB954] text-xs font-bold">{step.n}</p>
            <p className="text-white text-sm font-semibold leading-tight">{step.label}</p>
            <p className="text-[#A7A7A7] text-xs leading-snug">{step.desc}</p>
          </div>
        ))}
      </motion.div>

    </div>
  );
}
