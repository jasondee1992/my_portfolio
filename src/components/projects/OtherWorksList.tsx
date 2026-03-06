const otherWorks = [
  {
    no: "01",
    title: "My Own Time",
    description:
      "A simple personal productivity concept featuring a customized timer workflow and focus-friendly layout.",
    tags: ["HTML", "CSS", "JavaScript"],
  },
  {
    no: "02",
    title: "Weather App",
    description:
      "A weather concept project built for API integration practice and clean data presentation.",
    tags: ["HTML", "CSS", "JavaScript", "OpenWeatherMap"],
  },
  {
    no: "03",
    title: "First Portfolio",
    description:
      "An early portfolio project built while learning frontend structure, responsive layout, and interface design.",
    tags: ["HTML", "SCSS", "JavaScript"],
  },
];

export default function OtherWorksList() {
  return (
    <section className="container-page mt-14">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/35">
        Other Works
      </div>

      <div className="space-y-5">
        {otherWorks.map((work) => (
          <div
            key={work.no}
            className="rounded-[28px] p-6 md:p-7"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3 text-xs text-white/30">{work.no}</div>

                <h3 className="text-2xl font-semibold text-white/95">
                  {work.title}
                </h3>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">
                  {work.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1.5 text-xs"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:pt-10">
                <button
                  className="rounded-full px-5 py-3 text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  Source
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}