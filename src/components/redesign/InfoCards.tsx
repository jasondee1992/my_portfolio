"use client";

import { aboutParagraphs } from "@/data/aboutContent";

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

const techStackRow3 = [
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
        <h2 className="type-section-title mb-4 font-semibold tracking-[-0.02em] text-white/95">
          About Me
        </h2>

        <div className="type-page-body space-y-4 leading-8 text-white/72">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="min-w-0 flex flex-col gap-8">
        {/* ACHIEVEMENTS */}
        <div className="glass-card min-w-0 rounded-3xl p-8">
          <h2 className="type-section-title mb-6 font-semibold tracking-[-0.02em] text-white/95">
            Achievements
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
              <div>
                <p className="type-card-title font-semibold text-white/90">
                  Automation Systems Development
                </p>
                <p className="type-card-body mt-1 text-white/50">
                  Internal Platform
                </p>
              </div>
              <span className="type-card-body font-medium tracking-[0.12em] text-white/35">
                2025
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
              <div>
                <p className="type-card-title font-semibold text-white/90">
                  Data Engineering Automation
                </p>
                <p className="type-card-body mt-1 text-white/50">
                  Enterprise Projects
                </p>
              </div>
              <span className="type-card-body font-medium tracking-[0.12em] text-white/35">
                2024
              </span>
            </div>
          </div>
        </div>

        {/* TECH STACK */}
        <div className="glass-card rounded-3xl p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="type-section-title font-semibold tracking-[-0.02em] text-white/95">
              Tech Stack
            </h2>

            <button className="type-card-body text-white/55 transition hover:text-white/50">
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

            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow3, ...techStackRow3].map((tech, index) => (
                <div key={`${tech.name}-row3-${index}`} className="tech-pill">
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
