const timeline = [
  {
    year: "2020",
    title: "Curiosity in Technology",
    description:
      "Started becoming more interested in technology, systems, and how software can improve day-to-day work.",
    side: "right",
  },
  {
    year: "2021",
    title: "Learning Foundation",
    description:
      "Built stronger fundamentals in programming, problem solving, and technical thinking through study and practice.",
    side: "left",
  },
  {
    year: "2023",
    title: "Building Practical Projects",
    description:
      "Started creating more useful applications and learning how interfaces, logic, and user experience work together.",
    side: "right",
  },
  {
    year: "2024",
    title: "Dashboards and Automation",
    description:
      "Worked more deeply on dashboards, automation flows, and business process improvements using Python-based tools.",
    side: "left",
  },
  {
    year: "2025",
    title: "Enterprise Python Development",
    description:
      "Focused on internal tools, reporting systems, data workflows, and automation solutions for real operational needs.",
    side: "right",
  },
  {
    year: "2026",
    title: "AI, RAG, and Portfolio Growth",
    description:
      "Expanding into AI-powered tools, retrieval systems, better web experiences, and a stronger professional portfolio.",
    side: "left",
  },
];

export default function JourneyTimeline() {
  return (
    <section className="container-page mt-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-4xl font-semibold text-white/95">
          My Journey
        </h2>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/20 md:block" />

          <div className="space-y-10">
            {timeline.map((item) => (
              <div
                key={item.year}
                className={`flex w-full ${
                  item.side === "left" ? "md:justify-start" : "md:justify-end"
                }`}
              >
                <div
                  className="w-full rounded-[28px] p-7 md:w-[44%]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
                  }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="text-5xl font-semibold text-white/95">
                      {item.year}
                    </div>
                    <div className="pt-2 text-right text-2xl font-semibold text-white/90">
                      {item.title}
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-8 text-white/60">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-white/70 shadow-[0_0_30px_rgba(255,255,255,0.35)] md:block" />
        </div>
      </div>
    </section>
  );
}