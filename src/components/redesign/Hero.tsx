const metaItems = [
  "Python Developer",
  "jasond@example.com",
  "Based in Philippines",
  "8+ Projects Completed",
];

const stackTags = ["Python", "Dash", "Snowflake", "Automation", "AI"];

export default function Hero() {
  return (
    <section className="container-page relative pt-16 pb-10 md:pt-20 overflow-hidden">
    <div className="hero-glow" />
      <div className="relative z-10 grid gap-8 md:gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div
            className="glass-card flex h-28 w-28 shrink-0 items-center justify-center rounded-full md:h-36 md:w-36"
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 58%)",
            }}
          >
            <span className="text-3xl font-semibold tracking-tight text-white/85">
              JD
            </span>
          </div>

          <div className="flex-1">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Jasond Delos Santos
            </h1>

            <p className="mt-3 max-w-2xl text-xl text-white/68 md:text-3xl">
              Python Developer • Data Engineer
            </p>

            <div
              className="mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.28)",
                color: "rgba(134,239,172,0.96)",
              }}
            >
              Open to work
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {metaItems.map((item) => (
            <div
              key={item}
              className="glass-card soft-hover rounded-[24px] px-5 py-5 text-sm"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          {["View Projects", "Contact Me", "GitHub", "LinkedIn"].map((label, i) => (
            <button
              key={label}
              className="soft-hover rounded-[22px] px-7 py-4 text-sm font-semibold"
              style={{
                background: i < 2 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.94)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {stackTags.map((tag) => (
            <span
              key={tag}
              className="glass-chip soft-hover rounded-full px-4 py-2 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}