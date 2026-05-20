import Image from "next/image";
import Link from "next/link";

const OTHER_COURSES = [
  {
    slug: "css",
    title: "CSS",
    subtitle: "Design & mise en forme",
    planet: "/planet-ring.png",
    color: "blue",
    locked: false,
  },
  {
    slug: "javascript",
    title: "JavaScript",
    subtitle: "Logique & interactivité",
    planet: "/planet-dry.png",
    color: "orange",
    locked: false,
  },
];

const COLOR_MAP: Record<string, { border: string; text: string }> = {
  blue: { border: "border-nebula-blue/30", text: "text-nebula-blue" },
  orange: { border: "border-nebula-orange/30", text: "text-nebula-orange" },
};

export default function ExploreSection() {
  return (
    <section className="mt-10 animate-fade-up">
      <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
        {"> "}Autres cursus
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OTHER_COURSES.map((course) => {
          const c = COLOR_MAP[course.color] ?? COLOR_MAP.blue;
          const card = (
            <article
              className={`relative overflow-hidden rounded-sm border ${c.border} bg-nebula-bg-panel/70 p-5 backdrop-blur-md transition-all ${
                course.locked
                  ? ""
                  : "hover:border-opacity-80 hover:bg-nebula-bg-panel/85"
              }`}
            >
              <div className="absolute right-3 top-3 rounded-sm border border-nebula-text-dim/40 bg-nebula-bg-darkest/60 px-2 py-0.5 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
                {course.locked ? "Verrouillé" : "Disponible"}
              </div>

              <div className="flex items-start gap-4">
                <div className={`shrink-0 ${course.locked ? "opacity-60" : ""}`}>
                  <Image
                    src={course.planet}
                    alt=""
                    width={60}
                    height={60}
                    className="object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`mb-1 font-tech text-xl ${c.text} tracking-wider`}>
                    {course.title}
                  </h3>
                  <p className="font-body text-sm text-nebula-text-secondary">
                    {course.subtitle}
                  </p>
                  <p className="mt-3 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
                    {course.locked ? "Bientôt disponible" : "Entrer →"}
                  </p>
                </div>
              </div>
            </article>
          );

          if (course.locked) {
            return <div key={course.slug}>{card}</div>;
          }
          return (
            <Link key={course.slug} href={`/learn/${course.slug}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
