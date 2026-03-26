import Image from "next/image";

type TechItem = {
  name: string;
  icon: string;
};

type TechGroup = {
  title: string;
  description: string;
  items: TechItem[];
};

const SKILL_ICON_MAP = {
  AI: "/icons/skills/ai.svg",
  Automation: "/icons/skills/automation.svg",
  AWS: "/icons/skills/AWS.svg",
  CSS: "/icons/skills/css3.svg",
  ETL: "/icons/skills/data_engineer.svg",
  Django: "/icons/skills/Django.svg",
  Docker: "/icons/skills/Docker.svg",
  FastAPI: "/icons/skills/FastAPI.svg",
  Git: "/icons/skills/Git.svg",
  GitHub: "/icons/skills/github.svg",
  HTML: "/icons/skills/HTML5.svg",
  JavaScript: "/icons/skills/JavaScript.svg",
  Linux: "/icons/skills/linux.svg",
  NoSQL: "/icons/skills/NoSQL.svg",
  Pandas: "/icons/skills/Pandas.svg",
  Dash: "/icons/skills/plotly_dash.svg",
  Plotly: "/icons/skills/plotly.svg",
  PostgreSQL: "/icons/skills/PostgreSQL.svg",
  Postman: "/icons/skills/postman.svg",
  "Python Dev": "/icons/skills/python_developer.svg",
  Python: "/icons/skills/python.svg",
  RAG: "/icons/skills/rag.svg",
  React: "/icons/skills/react.svg",
  Snowflake: "/icons/skills/snowflakes.svg",
  SQL: "/icons/skills/sql.svg",
  SQLite: "/icons/skills/SQLite.svg",
  "Tailwind CSS": "/icons/skills/tailwind.svg",
  TypeScript: "/icons/skills/TypeScript.svg",
  Vercel: "/icons/skills/vercel.svg",
  "Next.js": "/icons/skills/react.svg",
  "Prompt Engineering": "/icons/skills/ai.svg",
  "Vector Search": "/icons/skills/rag.svg",
  FAISS: "/icons/skills/ai.svg",
} as const;

type SkillIconName = keyof typeof SKILL_ICON_MAP;

const groups: TechGroup[] = [
  {
    title: "Frontend",
    description: "Interfaces built for clarity, responsiveness, and practical user workflows.",
    items: [
      { name: "React", icon: SKILL_ICON_MAP.React },
      { name: "Next.js", icon: SKILL_ICON_MAP["Next.js"] },
      { name: "TypeScript", icon: SKILL_ICON_MAP.TypeScript },
      { name: "JavaScript", icon: SKILL_ICON_MAP.JavaScript },
      { name: "HTML", icon: SKILL_ICON_MAP.HTML },
      { name: "CSS", icon: SKILL_ICON_MAP.CSS },
      { name: "Tailwind CSS", icon: SKILL_ICON_MAP["Tailwind CSS"] },
    ],
  },
  {
    title: "Backend & Data",
    description: "Backend services, reporting flows, APIs, and data-heavy internal applications.",
    items: [
      { name: "Python", icon: SKILL_ICON_MAP.Python },
      { name: "FastAPI", icon: SKILL_ICON_MAP.FastAPI },
      { name: "Snowflake", icon: SKILL_ICON_MAP.Snowflake },
      { name: "SQL", icon: SKILL_ICON_MAP.SQL },
      { name: "SQLite", icon: SKILL_ICON_MAP.SQLite },
      { name: "Dash", icon: SKILL_ICON_MAP.Dash },
      { name: "ETL", icon: SKILL_ICON_MAP.ETL },
    ],
  },
  {
    title: "Tools & Platforms",
    description: "Version control, deployment, collaboration, and environment tooling used in real builds.",
    items: [
      { name: "Git", icon: SKILL_ICON_MAP.Git },
      { name: "GitHub", icon: SKILL_ICON_MAP.GitHub },
      { name: "Linux", icon: SKILL_ICON_MAP.Linux },
      { name: "Docker", icon: SKILL_ICON_MAP.Docker },
      { name: "Postman", icon: SKILL_ICON_MAP.Postman },
      { name: "Vercel", icon: SKILL_ICON_MAP.Vercel },
    ],
  },
  {
    title: "AI / Automation",
    description: "Automation patterns, retrieval concepts, and AI-assisted workflows for practical systems.",
    items: [
      { name: "RAG", icon: SKILL_ICON_MAP.RAG },
      { name: "Prompt Engineering", icon: SKILL_ICON_MAP["Prompt Engineering"] },
      { name: "Automation", icon: SKILL_ICON_MAP.Automation },
      { name: "Vector Search", icon: SKILL_ICON_MAP["Vector Search"] },
      { name: "FAISS", icon: SKILL_ICON_MAP.FAISS },
    ],
  },
];

const orbitIcons: SkillIconName[] = [
  "AI",
  "Automation",
  "AWS",
  "CSS",
  "ETL",
  "Django",
  "Docker",
  "FastAPI",
  "Git",
  "GitHub",
  "HTML",
  "JavaScript",
  "Linux",
  "NoSQL",
  "Pandas",
  "Dash",
  "Plotly",
  "PostgreSQL",
  "Postman",
  "Python Dev",
  "Python",
  "RAG",
  "React",
  "Snowflake",
  "SQL",
  "SQLite",
  "Tailwind CSS",
  "TypeScript",
  "Vercel",
];

function OrbitIcon({ name, size = 48 }: { name: SkillIconName; size?: number }) {
  return (
    <Image
      src={SKILL_ICON_MAP[name]}
      alt={name}
      width={size}
      height={size}
      className="about-stack-orbit-icon-image"
    />
  );
}

export default function TechStackSection() {
  const innerCount = 9;
  const innerIcons = orbitIcons.slice(0, innerCount);
  const outerIcons = orbitIcons.slice(innerCount);

  return (
    <section className="container-page section-shell">
      <div className="mx-auto max-w-5xl">
        <div className="section-header items-center text-center">
          <div className="section-eyebrow">Capabilities</div>
          <h2 className="type-section-title section-title font-normal text-white/95">
            Technology stack
          </h2>
        </div>

        <div className="about-stack-orbit-wrap mt-10" aria-hidden="true">
          <div className="about-stack-orbit-outer-points">
            {outerIcons.map((item, index) => (
              <div
                key={`outer-stack-icon-${item}`}
                className="about-stack-orbit-point"
                style={{
                  ["--orbit-angle" as string]: `${(360 / outerIcons.length) * index}deg`,
                  ["--orbit-radius" as string]: "184px",
                }}
              >
                <OrbitIcon name={item} />
              </div>
            ))}
          </div>

          <div className="about-stack-orbit-inner-points">
            {innerIcons.map((item, index) => (
              <div
                key={`inner-stack-icon-${item}`}
                className="about-stack-orbit-point"
                style={{
                  ["--orbit-angle" as string]: `${(360 / innerIcons.length) * index}deg`,
                  ["--orbit-radius" as string]: "112px",
                }}
              >
                <OrbitIcon name={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {groups.map((group) => (
            <article key={group.title}>
              <h3 className="text-[1.08rem] uppercase tracking-[0.18em] text-white/92">
                {group.title}
              </h3>

              <p className="mt-4 max-w-[34rem] text-[0.94rem] leading-8 text-white/60">
                {group.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={`${group.title}-${item.name}`}
                    className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/74"
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                    {item.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
