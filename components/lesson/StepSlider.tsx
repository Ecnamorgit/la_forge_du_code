"use client";

import { useRef, useEffect } from "react";
import type { Step } from "@/data/courses/html/chapitre-1";
import LessonContent from "./LessonContent";

interface StepSliderProps {
  steps: Step[];
  currentStep: number;
}

export default function StepSlider({ steps, currentStep }: StepSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vw = viewportRef.current?.offsetWidth ?? 0;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentStep * vw}px)`;
    }
  }, [currentStep]);

  useEffect(() => {
    const handleResize = () => {
      const vw = viewportRef.current?.offsetWidth ?? 0;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentStep * vw}px)`;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentStep]);

  return (
    <div
      ref={viewportRef}
      className="shrink-0 overflow-hidden relative border-b border-nebula-border"
    >
      <div
        ref={trackRef}
        className="flex transition-transform duration-[450ms] ease-[cubic-bezier(.4,0,.2,1)]"
      >
        {steps.map((step, i) => (
          <LessonContent key={i} step={step} />
        ))}
      </div>
    </div>
  );
}
