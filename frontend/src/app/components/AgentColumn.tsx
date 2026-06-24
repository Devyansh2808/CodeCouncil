import { motion } from 'motion/react';
import type { ReviewResponse } from '../types';

export const PERSONAS: Record<string, { name: string; role: string; color: string; icon: string }> = {
  'Backend Engineer':          { name: 'Alex',   role: 'Backend Engineer',          color: '#3B82F6', icon: '⚙️' },
  'Security Engineer':         { name: 'Sam',    role: 'Security Engineer',          color: '#EF4444', icon: '🔒' },
  'Maintainability Architect': { name: 'Jordan', role: 'Maintainability Architect',  color: '#A855F7', icon: '🏗️' },
};

const STANCE: Record<string, { text: string; bg: string; border: string }> = {
  approve: { text: '#1DB954', bg: 'rgba(29,185,84,0.12)',   border: '#1DB954' },
  changes: { text: '#F59B23', bg: 'rgba(245,155,35,0.12)',  border: '#F59B23' },
  block:   { text: '#F15E6C', bg: 'rgba(241,94,108,0.12)', border: '#F15E6C' },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#F15E6C',
  high:     '#F59B23',
  medium:   '#A7A7A7',
  low:      '#A7A7A7',
};

interface AgentColumnProps {
  review: ReviewResponse;
  index?: number;
  delay?: number;
}

export function AgentColumn({ review, index = 0, delay = 0 }: AgentColumnProps) {
  const persona = PERSONAS[review.persona] ?? { name: review.persona, role: '', color: '#A7A7A7', icon: '🤖' };
  const stance  = STANCE[review.stance]  ?? STANCE.changes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay + index * 0.12 }}
      className="bg-[#1A1A1A] rounded-xl p-5 flex flex-col gap-4 border"
      style={{ borderColor: stance.border + '66' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: persona.color + '22', border: `1px solid ${persona.color}44` }}
        >
          {persona.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white leading-none">{persona.name}</p>
          <p className="text-xs text-[#A7A7A7] mt-0.5">{persona.role}</p>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full flex-shrink-0"
          style={{ color: stance.text, backgroundColor: stance.bg }}
        >
          {review.stance}
        </span>
      </div>

      {/* Bubble */}
      <p className="text-sm text-[#A7A7A7] italic border-l-2 pl-3 leading-relaxed" style={{ borderColor: stance.border + '66' }}>
        "{review.bubble}"
      </p>

      {/* Responding to */}
      {review.responding_to?.length > 0 && (
        <p className="text-xs text-[#A7A7A7] italic">
          Responding to: {review.responding_to.join(', ')}
        </p>
      )}

      {/* Findings */}
      {review.findings?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Findings</p>
          {review.findings.map((f, i) => (
            <div key={i} className="bg-[#282828] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{ color: SEVERITY_COLOR[f.severity], backgroundColor: SEVERITY_COLOR[f.severity] + '22' }}
                >
                  {f.severity}
                </span>
                <span className="text-sm font-medium text-white">{f.title}</span>
              </div>
              <p className="text-xs text-[#A7A7A7] leading-relaxed">{f.explanation}</p>
              <p className="text-xs text-[#1DB954]">→ {f.suggested_fix}</p>
            </div>
          ))}
        </div>
      )}

      {/* Arguments */}
      {review.arguments?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Arguments</p>
          {review.arguments.map((a, i) => (
            <div key={i} className="bg-[#282828] rounded-lg p-3 space-y-1.5">
              <p className="text-sm font-medium text-white">{a.point}</p>
              <p className="text-xs text-[#A7A7A7] leading-relaxed">{a.reasoning}</p>
              {a.condition_for_approval && (
                <p className="text-xs text-[#F59B23]">Green light if: {a.condition_for_approval}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
