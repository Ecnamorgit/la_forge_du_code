import type { Step } from "@/data/courses/html/chapitre-1";

interface LessonContentProps {
  step: Step;
}

export default function LessonContent({ step }: LessonContentProps) {
  return (
    <div className="min-w-full px-7 py-6 overflow-y-auto max-h-[46vh]">
      {/* Mission header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-nebula-bg-panel border border-nebula-cyan flex items-center justify-center shrink-0 rounded-sm shadow-[0_0_14px_rgba(0,240,255,0.2)]">
          {step.missionIcon.startsWith("/") ? (
            <img src={step.missionIcon} alt="Mission" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-xl">{step.missionIcon}</span>
          )}
        </div>
        <div>
          <div className="font-tech text-[10px] text-nebula-cyan tracking-widest mb-1 uppercase">
            {step.missionTag}
          </div>
          <div className="font-tech text-sm text-nebula-text leading-relaxed whitespace-pre-line tracking-wider">
            {step.missionTtl}
          </div>
        </div>
      </div>
    </div>
  );
}
