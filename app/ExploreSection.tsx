import Link from "next/link";

import { COURSES_CATALOG } from "@/lib/courses-catalog";
import CourseIcon from "@/components/ui/CourseIcon";

const COLOR_MAP: Record<
  string,
  { border: string; glow: string; text: string; bg: string }
> = {
  cyan: {
    border: "border-nebula-cyan/30 hover:border-nebula-cyan/70",
    glow: "hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]",
    text: "text-nebula-cyan",
    bg: "bg-nebula-cyan-faint",
  },
  blue: {
    border: "border-nebula-blue/30 hover:border-nebula-blue/70",
    glow: "hover:shadow-[0_0_20px_rgba(61,126,255,0.2)]",
    text: "text-nebula-blue",
    bg: "bg-nebula-blue-dim/10",
  },
  orange: {
    border: "border-nebula-orange/30 hover:border-nebula-orange/70",
    glow: "hover:shadow-[0_0_20px_rgba(255,107,44,0.2)]",
    text: "text-nebula-orange",
    bg: "bg-nebula-orange-faint",
  },
};

interface Props {
  /** Slug of the user's currently active course, so we hide it from this grid. */
  activeCourseSlug: string;
}

export default function ExploreSection({ activeCourseSlug }: Props) {
  const otherCourses = COURSES_CATALOG.filter(
    (c) => c.slug !== activeCourseSlug
  );

  return (
    <section className="mt-10 animate-fade-up">
      <h2 className="mb-6 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
        {"> "}Autres cursus
      </h2>

      <div className="flex flex-wrap justify-center sm:justify-start gap-5">
        {otherCourses.map((course, index) => {
          const c = COLOR_MAP[course.color] ?? COLOR_MAP.cyan;

          // Prevent tooltips from overflowing the screen edges
          const isLeftAligned = index < 3;
          const isRightAligned = index > otherCourses.length - 4;

          let tooltipAlignClass = "left-1/2 -translate-x-1/2";
          let arrowAlignClass = "left-1/2 -translate-x-1/2";

          if (isLeftAligned) {
            tooltipAlignClass = "left-0";
            arrowAlignClass = "left-10 -translate-x-1/2";
          } else if (isRightAligned) {
            tooltipAlignClass = "right-0";
            arrowAlignClass = "right-10 translate-x-1/2";
          }

          return (
            <Link key={course.slug} href={`/learn/${course.slug}`} className="group relative">
              {/* Badge/Écusson container */}
              <div
                className={`
                  flex h-20 w-20 cursor-pointer items-center justify-center rounded-full
                  border bg-nebula-bg-panel/80 backdrop-blur-md transition-all duration-300
                  hover:-translate-y-1 hover:scale-110 ${c.border} ${c.glow}
                `}
              >
                <CourseIcon
                  slug={course.slug}
                  emoji={course.icon}
                  size={48}
                  className="text-4xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Hover Tooltip/Popup */}
              <div
                className={`
                  pointer-events-none absolute bottom-full z-50 mb-3 w-64 ${tooltipAlignClass}
                  rounded-sm border ${c.border.split(" ")[0]} bg-nebula-bg-panel/95 p-4
                  invisible opacity-0 shadow-[0_0_24px_rgba(0,240,255,0.12)] backdrop-blur-md
                  transition-all duration-300 group-hover:translate-y-[-4px] group-hover:visible group-hover:opacity-100
                `}
              >
                {/* Arrow pointing to the badge */}
                <div className={`absolute top-full border-x-[6px] border-t-[6px] border-x-transparent border-t-nebula-bg-panel ${arrowAlignClass}`} />
                
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-tech text-[9px] uppercase tracking-widest text-nebula-text-dim">
                    Disponible
                  </span>
                </div>
                
                <h3 className={`font-tech text-lg tracking-wider ${c.text} mb-0.5`}>
                  {course.title}
                </h3>
                
                <p className="font-body text-xs text-nebula-text-secondary mb-2 leading-tight">
                  {course.subtitle}
                </p>
                
                <div className={`h-px w-full ${c.bg} mb-2`} />
                
                <p className="font-body text-[11px] leading-relaxed text-nebula-text-dim">
                  {course.description}
                </p>
                
                <div className="mt-2 text-right">
                  <span className={`font-tech text-[10px] uppercase tracking-widest ${c.text}`}>
                    Entrer →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

