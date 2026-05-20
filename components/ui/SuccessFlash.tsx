"use client";

interface SuccessFlashProps {
  trigger: number;
}

export default function SuccessFlash({ trigger }: SuccessFlashProps) {
  if (trigger <= 0) return null;

  return (
    <div
      key={trigger}
      className="fixed inset-0 pointer-events-none z-[200] animate-flash-seq"
    />
  );
}
