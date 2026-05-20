"use client";

import { AnimatePresence, motion } from "framer-motion";

interface XPPopupProps {
  show: boolean;
  label: string;
}

export default function XPPopup({ show, label }: XPPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-[70px] right-7 bg-nebula-bg-panel border border-nebula-cyan px-5 py-3 font-tech text-sm text-nebula-cyan z-[300] pointer-events-none rounded-sm shadow-[0_0_28px_rgba(0,240,255,0.2)] flex items-center gap-2.5 tracking-wider"
          initial={{ opacity: 0, y: -14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.9 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          ⚡ {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
