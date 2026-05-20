"use client";

import type { StepObjective } from "@/data/courses/html/chapitre-1";

interface ObjectiveListProps {
  objectives: StepObjective[];
  doneObjectives: Set<string>;
}

export default function ObjectiveList({
  objectives,
  doneObjectives,
}: ObjectiveListProps) {
  return (
    <div className="px-4 py-3.5 flex-1 overflow-y-auto bg-[rgba(3,6,13,0.14)]">
      <div className="font-tech text-[10px] text-nebula-text-dim tracking-widest mb-3 uppercase">
        ▸ Objectifs de mission
      </div>
      {objectives.map((o) => {
        const done = doneObjectives.has(o.id);
        return (
          <div
            key={o.id}
            className={`flex items-start gap-2.5 px-2.5 py-2 mb-1.5 border text-sm leading-snug transition-all duration-300 rounded-sm ${
              done
                ? "border-nebula-green-dim text-nebula-green bg-[rgba(0,255,136,0.08)]"
                : "border-nebula-border/70 text-nebula-text-secondary bg-[rgba(5,10,20,0.32)]"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center text-[9px] shrink-0 mt-0.5 transition-all duration-300 ${
                done
                  ? "border-nebula-green text-nebula-green bg-[rgba(0,255,136,0.1)]"
                  : "border-nebula-border-glow"
              }`}
            >
              {done ? "✓" : ""}
            </div>
            <span className="font-body">{o.label}</span>
          </div>
        );
      })}
    </div>
  );
}
