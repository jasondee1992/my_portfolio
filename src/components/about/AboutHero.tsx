import Link from "next/link";
import { aboutParagraphs } from "@/data/aboutContent";

export default function AboutHero() {
  return (
    <section className="container-page pt-10 md:pt-14">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="type-page-title font-semibold tracking-tight text-white/95">
          About JasonD
        </h1>

        <p className="type-page-subtitle mt-4 text-white/70">
          Building systems that simplify work and turn ideas into usable tools.
        </p>

        <div className="type-page-body mx-auto mt-10 max-w-4xl space-y-6 text-left leading-9 text-white/65">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/resume/Jasond_Delos_Santos_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[22px] px-7 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 14px 35px rgba(0,0,0,0.38)",
            }}
          >
            Resume
          </a>

          <Link
            href="/projects"
            className="rounded-[22px] px-7 py-4 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 14px 35px rgba(0,0,0,0.38)",
            }}
          >
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
