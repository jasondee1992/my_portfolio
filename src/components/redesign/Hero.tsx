const metaItems = [
  "Python Developer",
  "jasond@example.com",
  "Based in Philippines",
  "8+ Projects Completed",
];

const stackTags = ["Python", "Dash", "Snowflake", "Automation", "AI"];

export default function Hero() {
  return (
    <section className="container-page pt-8 md:pt-10">
      <div className="grid gap-8 md:gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div
            className="h-28 w-28 shrink-0 overflow-hidden rounded-full md:h-36 md:w-36"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.02))",
              boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/80">
              JD
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-semibold tracking-tight text-white/95 md:text-6xl">
              Jasond Delos Santos
            </h1>

            <p className="mt-3 text-lg text-white/65 md:text-2xl">
              Python Developer • Data Engineer
            </p>

            <div
              className="mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.30)",
                color: "rgba(126, 231, 135, 0.96)",
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
              className="rounded-2xl px-4 py-4 text-sm"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-[22px] px-7 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 14px 35px rgba(0,0,0,0.38)",
            }}
          >
            View Projects
          </button>

          <button
            className="rounded-[22px] px-7 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 14px 35px rgba(0,0,0,0.38)",
            }}
          >
            Contact Me
          </button>

          <button
            className="rounded-[22px] px-5 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.86)",
            }}
          >
            GitHub
          </button>

          <button
            className="rounded-[22px] px-5 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.86)",
            }}
          >
            LinkedIn
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {stackTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-4 py-2 text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}