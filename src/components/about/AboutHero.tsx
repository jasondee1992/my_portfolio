import Link from "next/link";
import { aboutParagraphs } from "@/data/aboutContent";

export default function AboutHero() {
  return (
    <section className="container-page relative pt-10 md:pt-14">
      <div className="section-panel mx-auto max-w-5xl px-8 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="section-eyebrow mx-auto">About</div>
          <h1 className="type-page-title section-title gradient-text mt-6 font-semibold">
            About Jasond
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
              className="premium-button"
            >
              Resume
              <span aria-hidden="true">↗</span>
            </a>

            <Link href="/projects" className="premium-button-secondary">
              View Projects
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
