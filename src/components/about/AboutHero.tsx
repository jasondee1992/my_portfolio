export default function AboutHero() {
  return (
    <section className="container-page pt-10 md:pt-14">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-white/95 md:text-7xl">
          About JasonD
        </h1>

        <p className="mt-4 text-2xl text-white/70 md:text-3xl">
          Building systems that simplify work and turn ideas into usable tools.
        </p>

        <p className="mx-auto mt-10 max-w-4xl text-left text-lg leading-9 text-white/65">
          I’m a Python Developer and Data Engineer focused on automation,
          dashboards, and internal tools. I enjoy solving operational problems,
          reducing manual work, and building systems that are practical,
          maintainable, and useful for real teams.
          <br />
          <br />
          My experience includes Python development, Dash dashboards,
          Snowflake-based reporting, ETL automation, and process improvement.
          I’m also expanding into AI, RAG systems, and portfolio projects that
          combine backend engineering with clean user experiences.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            className="rounded-[22px] px-7 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 14px 35px rgba(0,0,0,0.38)",
            }}
          >
            Resume
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
            View Projects
          </button>
        </div>
      </div>
    </section>
  );
}