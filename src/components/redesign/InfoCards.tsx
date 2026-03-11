"use client";

const techStackRow1 = [
  { name: "AWS", icon: "/icons/skills/AWS.png" },
  { name: "Css3", icon: "/icons/skills/css3.png" },
  { name: "Django", icon: "/icons/skills/Django.png" },
  { name: "Docker", icon: "/icons/skills/Docker.png" },
  { name: "FastAPI", icon: "/icons/skills/FastAPI.png" },
  { name: "Git", icon: "/icons/skills/Git.png" },
  { name: "React", icon: "/icons/skills/react.png" },
  { name: "Snowflakes", icon: "/icons/skills/snowflakes.png" },
  { name: "SQLite", icon: "/icons/skills/SQLite.png" },
  { name: "TypeScript", icon: "/icons/skills/TypeScript.png" },
];

const techStackRow2 = [
  { name: "HTML5", icon: "/icons/skills/HTML5.png" },
  { name: "JavaScript", icon: "/icons/skills/JavaScript.png" },
  { name: "NoSQL", icon: "/icons/skills/NoSQL.png" },
  { name: "Pandas", icon: "/icons/skills/Pandas.png" },
  { name: "plotly", icon: "/icons/skills/plotly.png" },
  { name: "plotly_dash", icon: "/icons/skills/plotly_dash.png" },
  { name: "PostgreSQL", icon: "/icons/skills/PostgreSQL.png" },
  { name: "Python", icon: "/icons/skills/python.png" },

];

export default function InfoCards() {
  return (
    <section className="container-page mt-24 grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)]">
      {/* LEFT - ABOUT */}
      <div className="glass-card soft-hover rounded-3xl p-8 md:p-10">
        <h2 className="mb-4 text-[28px] font-semibold tracking-[-0.02em] text-white/95">
          About Me
        </h2>

        <div className="space-y-4 text-[17px] leading-8 text-white/72">
          <p>
            I’m a Python Developer specializing in building end-to-end internal
            applications for enterprise environments. My work focuses on
            automating business processes by developing full-stack Python
            solutions, from backend APIs to interactive dashboards used by
            internal teams.
          </p>

          <p>
            I design and develop backend services using Python and REST APIs,
            while building frontend applications using Dash and Bootstrap. I
            typically manage the full development lifecycle including
            requirements analysis, API design, UI development, backend logic,
            testing, and deployment to AWS in collaboration with DevOps teams.
          </p>

          <p>
            I also maintain and enhance the applications I build by delivering
            production updates, performance improvements, and new features. This
            hands-on ownership allows me to deeply understand both technical
            systems and business workflows across multiple projects.
          </p>

          <p>
            My experience includes internal automation platforms, monitoring
            dashboards, workflow tools, and data-driven applications that help
            improve efficiency and operational visibility for business users.
          </p>

          <p>
            Currently, I continue to expand my skills in backend architecture,
            data engineering, cloud-based deployment, and AI-driven systems to
            build scalable and impactful automation platforms.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="min-w-0 flex flex-col gap-8">
        {/* ACHIEVEMENTS */}
        <div className="glass-card min-w-0 rounded-3xl p-8">
          <h2 className="mb-6 text-[26px] font-semibold tracking-[-0.02em] text-white/95">
            Achievements
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
              <div>
                <p className="text-[16px] font-semibold text-white/90">
                  Automation Systems Development
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Internal Platform
                </p>
              </div>
              <span className="text-xs font-medium tracking-[0.12em] text-white/35">
                2025
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
              <div>
                <p className="text-[16px] font-semibold text-white/90">
                  Data Engineering Automation
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Enterprise Projects
                </p>
              </div>
              <span className="text-xs font-medium tracking-[0.12em] text-white/35">
                2024
              </span>
            </div>
          </div>
        </div>

        {/* TECH STACK */}
        <div className="glass-card rounded-3xl p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-white/95">
              Tech Stack
            </h2>

            <button className="text-sm text-white/55 transition hover:text-white/80">
              View All →
            </button>
          </div>

          <div className="tech-marquee-wrap">
            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow1, ...techStackRow1].map((tech, index) => (
                <div key={`${tech.name}-row1-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="tech-pill-icon"
                    />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>

            <div className="tech-marquee-row tech-marquee-right">
              {[...techStackRow2, ...techStackRow2].map((tech, index) => (
                <div key={`${tech.name}-row2-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="tech-pill-icon"
                    />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}