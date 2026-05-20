"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { unlockAudio } from "@/lib/audio";

interface CourseCardLinkProps {
  href: string;
  children: ReactNode;
}

export default function CourseCardLink({ href, children }: CourseCardLinkProps) {
  return (
    <Link href={href} onClick={() => unlockAudio()}>
      {children}
    </Link>
  );
}
