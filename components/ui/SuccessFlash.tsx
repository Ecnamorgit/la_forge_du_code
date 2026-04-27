"use client";

import { useEffect, useState } from "react";

interface SuccessFlashProps {
  trigger: number;
}

export default function SuccessFlash({ trigger }: SuccessFlashProps) {
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setFiring(true);
      const t = setTimeout(() => setFiring(false), 700);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[200] ${firing ? "animate-flash-seq" : "opacity-0"}`}
    />
  );
}
