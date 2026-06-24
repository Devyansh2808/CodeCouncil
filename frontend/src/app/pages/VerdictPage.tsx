import { motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Shield, RotateCcw } from 'lucide-react';
import { AgentColumn } from '../components/AgentColumn';
import type { ReviewResponse, ManagerVerdict } from '../types';

interface VerdictPageProps {
  round0: ReviewResponse[];
  round1: ReviewResponse[];
  verdict: ManagerVerdict;
  onReset: () => void;
}

const VERDICT_CONFIG = {
  approve: {
    label:  'APPROVED',
    icon:   <CheckCircle2 className="size-5 text-[#1DB954]" />,
    border: '#1DB954',
    bg:     'rgba(29,185,84,0.06)',
    badge:  { color: '#1DB954', bg: 'rgba(29,185,84,0.15)' },
  },
  approve_with_changes: {
    label:  'CONDITIONAL',
    icon:   <AlertCircle className="size-5 text-[#F59B23]" />,
    border: '#F59B23',
    bg:     'rgba(245,155,35,0.06)',
    badge:  { color: '#F59B23', bg: 'rgba(245,155,35,0.15)' },
  },
  block: {
    label:  'REJECTED',
    icon:   <XCircle className="size-5 text-[#F15E6C]" />,
    border: '#F15E6C',
    bg:     'rgba(241,94,108,0.06)',
    badge:  { color: '#F15E6C', bg: 'rgba(241,94,108,0.15)' },
  },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#F15E6C',
  high:     '#F59B23',
  medium:   '#A7A7A7',
  low:      '#A7A7A7',
};

export function VerdictPage({ round0, round1, verdict, onReset }: VerdictPageProps) {
  const cfg = VERDICT_CONFIG[verdict.verdict] ?? VERDICT_CONFIG.approve;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col px-6 py-10 gap-12">

      {/* Round 1 — After debate */}
      <section className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A7A7A7]">
            Round 1 — After Your Defence
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.03em]">
            Code<span className="text-[#1DB954]">Council</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {round1.map((review, i) => (
            <AgentColumn key={i} review={review} index={i} delay={0.1} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#3E3E3E]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Manager's Verdict</span>
        <div className="flex-1 h-px bg-[#3E3E3E]" />
      </div>

      {/* Manager verdict card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-3xl mx-auto w-full rounded-xl border p-7 space-y-6"
        style={{ borderColor: cfg.border + '66', backgroundColor: cfg.bg }}
      >
        {/* Manager header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#282828] to-[#1A1A1A] border border-[#3E3E3E] flex items-center justify-center flex-shrink-0">
            <Shield className="size-5 text-[#A7A7A7]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white flex items-center gap-2">
              Engineering Manager — Morgan
              {cfg.icon}
            </p>
            <p className="text-xs text-[#A7A7A7] mt-0.5">Final decision across all rounds</p>
          </div>
          <span
            className="text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full flex-shrink-0"
            style={{ color: cfg.badge.color, backgroundColor: cfg.badge.bg, border: `1px solid ${cfg.border}44` }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Rationale */}
        <p className="text-sm text-[#A7A7A7] leading-relaxed">{verdict.rationale}</p>

        {/* Consensus / Dissent */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Consensus</p>
            <p className="text-sm text-white leading-relaxed">{verdict.consensus_summary}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Dissent</p>
            <p className="text-sm text-white leading-relaxed">{verdict.dissent_summary}</p>
          </div>
        </div>

        {/* Action items */}
        {verdict.action_items?.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7A7A7]">Action Items</p>
            <div className="space-y-2">
              {[...verdict.action_items]
                .sort((a, b) => a.priority - b.priority)
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start bg-[#1A1A1A] border border-[#3E3E3E] rounded-lg p-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1DB954] text-black text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            color: SEVERITY_COLOR[item.severity],
                            backgroundColor: SEVERITY_COLOR[item.severity] + '22',
                          }}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[#A7A7A7] mt-0.5 leading-relaxed">{item.action}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Reset */}
      <div className="flex justify-center pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="flex items-center gap-2 border border-[#3E3E3E] hover:border-[#A7A7A7] text-[#A7A7A7] hover:text-white text-sm font-medium px-7 py-3 rounded-full transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Start New Review
        </motion.button>
      </div>

    </div>
  );
}
