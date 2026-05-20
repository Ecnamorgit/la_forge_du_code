"use client";

import { AnimatePresence, motion } from "framer-motion";

interface QuestBannerProps {
  show: boolean;
  icon: string;
  title: string;
  subtitle: string;
  xpLabel: string;
  buttonLabel: string;
  onNext: () => void;
  onDimClick: () => void;
}

export default function QuestBanner({
  show,
  icon,
  title,
  subtitle,
  xpLabel,
  buttonLabel,
  onNext,
  onDimClick,
}: QuestBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 bg-[rgba(3,6,13,0.85)] z-[399]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDimClick}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 bg-nebula-bg-panel border border-nebula-cyan px-12 py-8 text-center z-[400] min-w-[340px] rounded-sm shadow-[0_0_60px_rgba(0,240,255,0.15),0_0_120px_rgba(0,240,255,0.05)]"
            initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 animate-float-gentle flex items-center justify-center">
              {icon.startsWith("/") ? (
                <img src={icon} alt="Banner Icon" className="w-full h-full object-contain" />
              ) : (
                <span className="text-5xl block">{icon}</span>
              )}
            </div>
            <div className="font-tech text-lg text-nebula-cyan leading-relaxed mb-2.5 tracking-wider [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">
              {title}
            </div>
            <div className="font-body text-base text-nebula-text-secondary mb-5 leading-normal">
              {subtitle}
            </div>
            <div className="font-tech text-sm text-nebula-green mb-5 tracking-wider">
              {xpLabel}
            </div>
            <button
              onClick={onNext}
              className="font-tech text-xs px-5 py-2 bg-nebula-cyan text-nebula-bg-darkest border-none cursor-pointer relative rounded-sm shadow-[0_4px_0_var(--cyan-dim)] hover:top-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:top-1 active:shadow-none tracking-widest uppercase animate-btn-appear"
            >
              {buttonLabel}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
