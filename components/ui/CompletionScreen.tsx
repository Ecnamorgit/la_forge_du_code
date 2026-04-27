"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CompletionScreenProps {
  show: boolean;
  totalXp: number;
  badgeIcon: string;
  badgeLabel: string;
  onClose: () => void;
}

export default function CompletionScreen({
  show,
  totalXp,
  badgeIcon,
  badgeLabel,
  onClose,
}: CompletionScreenProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-[rgba(3,6,13,0.97)] z-[500] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-nebula-bg-panel border border-nebula-cyan px-16 py-12 text-center max-w-[520px] rounded-sm shadow-[0_0_80px_rgba(0,240,255,0.15),0_0_160px_rgba(0,240,255,0.05)]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            <span className="text-7xl block mb-5 animate-orbit-spin">
              🛸
            </span>
            <div className="font-tech text-xl text-nebula-cyan leading-relaxed mb-3.5 tracking-widest [text-shadow:0_0_30px_rgba(0,240,255,0.4)]">
              PROTOCOLE 01
              <br />
              COMPLÉTÉ
            </div>
            <div className="font-body text-lg text-nebula-text-secondary mb-6 leading-relaxed">
              Station opérationnelle. Les systèmes de défense sont en ligne.
              Les aliens ne passeront pas.
            </div>
            <div className="font-tech text-base text-nebula-green mb-4 tracking-wider">
              ⚡ +100 XP — TOTAL : {totalXp} XP
            </div>
            <div className="inline-flex items-center gap-2 bg-nebula-bg-dark border border-nebula-blue px-4 py-2 mb-7 font-tech text-xs text-nebula-blue tracking-wider rounded-sm">
              {badgeIcon.startsWith("/") ? (
                <img src={badgeIcon} alt="Badge" className="w-5 h-5 object-contain" />
              ) : (
                <span>{badgeIcon}</span>
              )}
              BADGE : {badgeLabel}
            </div>
            <br />
            <button
              onClick={onClose}
              className="font-tech text-xs px-5 py-2 bg-nebula-cyan text-nebula-bg-darkest border-none cursor-pointer relative rounded-sm shadow-[0_4px_0_var(--cyan-dim)] hover:top-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:top-1 active:shadow-none tracking-widest uppercase"
            >
              PROTOCOLE 02 →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
