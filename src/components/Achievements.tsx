import data from "@/data/portfolio.json";

type Achievement = {
  title: string;
  year: string;
};

export default function Achievements() {
  const items = data.achievements as Achievement[];

  return (
    <section id="achievements" className="container-page pb-24 md:pb-40">
      <h2 className="text-2xl md:text-3xl font-semibold text-white/90">
        Achievements & Certifications
      </h2>
      <p className="mt-2 muted max-w-2xl">
        Highlights and learning milestones (dummy for now — we’ll replace with real certs later).
      </p>

      <div className="mt-8 grid gap-4">
        {items.map((a) => (
          <div key={`${a.title}-${a.year}`} className="panel panel-inner hover-lift">
            <div className="flex items-start justify-between gap-4">
              <div className="text-white/85 font-semibold">{a.title}</div>
              <div className="chip" style={{ opacity: 0.9 }}>
                {a.year}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}