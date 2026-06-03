import Link from "next/link";

import { COURSES_CATALOG } from "@/lib/courses-catalog";
import CourseIcon from "@/components/ui/CourseIcon";

const COLOR_MAP: Record<string, { border: string; text: string }> = {
  cyan: { border: "border-nebula-cyan/30", text: "text-nebula-cyan" },
  blue: { border: "border-nebula-blue/30", text: "text-nebula-blue" },
  orange: { border: "border-nebula-orange/30", text: "text-nebula-orange" },
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
      <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
        {"> "}Autres cursus
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {otherCourses.map((course) => {
          const c = COLOR_MAP[course.color] ?? COLOR_MAP.cyan;
          return (
            <Link key={course.slug} href={`/learn/${course.slug}`}>
              <article
                className={`relative overflow-hidden rounded-sm border ${c.border} bg-nebula-bg-panel/70 p-5 backdrop-blur-md transition-all hover:border-opacity-80 hover:bg-nebula-bg-panel/85`}
              >
                <div className="absolute right-3 top-3 rounded-sm border border-nebula-text-dim/40 bg-nebula-bg-darkest/60 px-2 py-0.5 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
                  Disponible
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <CourseIcon slug={course.slug} emoji={course.icon} size={32} className="text-3xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`mb-1 font-tech text-xl ${c.text} tracking-wider`}>
                      {course.title}
                    </h3>
                    <p className="font-body text-sm text-nebula-text-secondary">
                      {course.subtitle}
                    </p>
                    <p className="mt-3 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
                      Entrer →
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
