import Image from "next/image";
import { aboutParagraphs } from "@/data/aboutContent";
import projectHighlights from "@/data/knowledge/project-highlights.json";
import { SKILL_ICON_MAP } from "@/lib/skillIconPaths";

type ProjectHighlight = {
  title: string;
  year?: string;
  platform?: string;
  summary: string;
};

const techStackRow1 = [
  { name: "AWS", icon: SKILL_ICON_MAP.AWS },
  { name: "Css3", icon: SKILL_ICON_MAP.CSS },
  { name: "Django", icon: SKILL_ICON_MAP.Django },
  { name: "Docker", icon: SKILL_ICON_MAP.Docker },
  { name: "FastAPI", icon: SKILL_ICON_MAP.FastAPI },
  { name: "Git", icon: SKILL_ICON_MAP.Git },
  { name: "React", icon: SKILL_ICON_MAP.React },
  { name: "Snowflakes", icon: SKILL_ICON_MAP.Snowflakes },
  { name: "SQLite", icon: SKILL_ICON_MAP.SQLite },
  { name: "TypeScript", icon: SKILL_ICON_MAP.TypeScript },
];

const techStackRow2 = [
  { name: "HTML5", icon: SKILL_ICON_MAP.HTML },
  { name: "JavaScript", icon: SKILL_ICON_MAP.JavaScript },
  { name: "NoSQL", icon: SKILL_ICON_MAP.NoSQL },
  { name: "Pandas", icon: SKILL_ICON_MAP.Pandas },
  { name: "plotly", icon: SKILL_ICON_MAP.Plotly },
  { name: "plotly_dash", icon: SKILL_ICON_MAP["Plotly Dash"] },
  { name: "PostgreSQL", icon: SKILL_ICON_MAP.PostgreSQL },
  { name: "Python", icon: SKILL_ICON_MAP.Python },
];

const techStackRow3 = [
  { name: "HTML5", icon: SKILL_ICON_MAP.HTML },
  { name: "JavaScript", icon: SKILL_ICON_MAP.JavaScript },
  { name: "NoSQL", icon: SKILL_ICON_MAP.NoSQL },
  { name: "Pandas", icon: SKILL_ICON_MAP.Pandas },
  { name: "plotly", icon: SKILL_ICON_MAP.Plotly },
  { name: "plotly_dash", icon: SKILL_ICON_MAP["Plotly Dash"] },
  { name: "PostgreSQL", icon: SKILL_ICON_MAP.PostgreSQL },
  { name: "Python", icon: SKILL_ICON_MAP.Python },
];

const highlightAccents = [
  {
    eyebrow: "Automation",
    icon: "↗",
    gradient: "from-[#8fb8ff]/30 via-[#8fb8ff]/12 to-transparent",
  },
  {
    eyebrow: "AI Workflow",
    icon: "◇",
    gradient: "from-[#9be7c4]/26 via-[#9be7c4]/10 to-transparent",
  },
  {
    eyebrow: "Mapping",
    icon: "◎",
    gradient: "from-[#ffd08f]/26 via-[#ffd08f]/10 to-transparent",
  },
] as const;

function splitSummaryParagraphs(text: string) {
  return text
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function ExpandableHighlightDescription({
  text,
  platform,
}: {
  text: string;
  platform?: string;
}) {
  const paragraphs = splitSummaryParagraphs(text);

  return (
    <details className="group mt-3">
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          {platform ? (
            <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-white/48 md:text-[10px]">
              {platform}
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex text-[0.72rem] font-normal text-white/58 transition hover:text-white/82 group-open:hidden">
            See more...
          </span>
          <span className="hidden text-[0.72rem] font-normal text-white/58 transition hover:text-white/82 group-open:inline-flex">
            See less
          </span>
        </div>
      </summary>

      <div className="mt-4 rounded-[22px] border border-white/8 bg-black/18 p-4">
        <div className="space-y-3 border-l border-white/10 pl-4">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="type-card-body leading-7 text-white/56">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function InfoCards() {
  const highlights = projectHighlights as ProjectHighlight[];

  return (
    <section className="container-page section-shell grid gap-8 md:grid-cols-[minmax(0,1.58fr)_minmax(0,1.02fr)]">
      <div className="section-panel soft-hover p-8 md:p-10">
        <div className="section-header">
          <div className="section-eyebrow">About</div>
          <h2
            className="section-title font-normal text-white/95"
            style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
          >
            Building useful software with clear outcomes
          </h2>
        </div>

        <div className="type-page-body mt-6 space-y-4 leading-8 text-white/72">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex flex-col gap-8">
        <div className="section-panel min-w-0 p-8">
          <div className="section-header">
            <div className="section-eyebrow">Highlights</div>
            <h2
              className="section-title whitespace-nowrap font-normal tracking-[-0.02em] text-white/95"
              style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
            >
              Project highlights
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {highlights.map((item, index) => {
              const accent = highlightAccents[index % highlightAccents.length];
              const itemKey = `${item.title}-${item.year ?? ""}`;

              return (
                <article
                  key={itemKey}
                  className="premium-card overflow-hidden p-5 transition hover:border-white/15 hover:bg-white/[0.03]"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent.gradient}`}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-[80%]">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm text-white/80">
                          {accent.icon}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                          {accent.eyebrow}
                        </span>
                      </div>

                      <p className="type-card-title font-normal text-white/92">
                        {item.title}
                      </p>
                    </div>

                    {item.year && (
                      <span className="rounded-full border border-[#8fb8ff]/20 bg-[#8fb8ff]/8 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-[#cfe0ff]">
                        {item.year}
                      </span>
                    )}
                  </div>

                  <ExpandableHighlightDescription
                    text={item.summary}
                    platform={item.platform}
                  />
                </article>
              );
            })}
          </div>
        </div>

        <div className="section-panel p-8">
          <div className="mb-6">
            <div className="section-eyebrow">Stack</div>
            <h2
              className="section-title mt-3 font-normal tracking-[-0.02em] text-white/95"
              style={{ fontSize: "1.5rem", lineHeight: 1.05 }}
            >
              Core tools
            </h2>
          </div>

          <div className="tech-marquee-wrap">
            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow1, ...techStackRow1].map((tech, index) => (
                <div key={`${tech.name}-row1-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>

            <div className="tech-marquee-row tech-marquee-right">
              {[...techStackRow2, ...techStackRow2].map((tech, index) => (
                <div key={`${tech.name}-row2-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
                  </div>
                  <span className="tech-pill-label">{tech.name}</span>
                </div>
              ))}
            </div>

            <div className="tech-marquee-row tech-marquee-left">
              {[...techStackRow3, ...techStackRow3].map((tech, index) => (
                <div key={`${tech.name}-row3-${index}`} className="tech-pill">
                  <div className="tech-pill-circle">
                    <Image src={tech.icon} alt={tech.name} width={50} height={50} className="tech-pill-icon" />
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
