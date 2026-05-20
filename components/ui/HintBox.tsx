"use client";

import { AnimatePresence, motion } from "framer-motion";

interface HintBoxProps {
  show: boolean;
  html: string;
}

export default function HintBox({ show, html }: HintBoxProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-5 left-1/2 bg-nebula-bg-panel border border-nebula-cyan-dim border-l-2 border-l-nebula-cyan px-4 py-3 max-w-[460px] w-[calc(100%-40px)] z-[250] rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.1)]"
          initial={{ opacity: 0, x: "-50%", y: 16 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, x: "-50%", y: 16 }}
        >
          <div className="font-tech text-[10px] text-nebula-cyan mb-1.5 tracking-widest uppercase">
            📡 Transmission d&apos;ARIA
          </div>
          <div
            className="font-body text-sm text-nebula-text leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
