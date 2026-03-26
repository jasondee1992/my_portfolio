import Image from "next/image";
import Link from "next/link";

const metaItems = ["10 years in IT", "5 years in programming", "5 years in Python"];

const socialLinks = [
  {
    name: "Email",
    href: "mailto:jasond.worked@gmail.com",
    icon: "/icons/social/gmail.svg",
  },
  {
    name: "GitHub",
    href: "https://github.com/jasondee1992",
    icon: "/icons/social/github.svg",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/jasond-delos-santos-94978a111/",
    icon: "/icons/social/linkedin.svg",
  },
];

export default function Hero() {
  return (
    <section className="container-page relative overflow-hidden pt-14 pb-8 md:pt-20">
      <div className="hero-glow" />

      <div className="section-panel relative z-10 px-6 py-8 md:px-10 md:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="section-eyebrow">Python Full-Stack Developer</div>

            <h1 className="section-title gradient-text mt-6 max-w-4xl text-[2rem] font-normal md:text-[2.8rem]">
              Jasond Delos Santos
            </h1>

            <p className="mt-5 max-w-2xl text-[0.96rem] leading-7 text-white/70 md:text-[0.92rem] md:leading-8">
              I build premium internal tools, automation systems, and data-driven
              applications designed to make complex work feel simple, reliable, and efficient.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {metaItems.map((item) => (
                <div key={item} className="glass-chip rounded-full px-4 py-2 text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/resume/Jasond_Delos_Santos_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-button"
              >
                Hire Me
                <span aria-hidden="true">↗</span>
              </a>

              <Link href="/projects" className="premium-button-secondary">
                View Projects
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.name === "Email" ? undefined : "_blank"}
                  rel={link.name === "Email" ? undefined : "noopener noreferrer"}
                  className="soft-hover flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3"
                  aria-label={link.name}
                  title={link.name}
                >
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={28}
                    height={28}
                    className="object-contain opacity-85"
                  />
                  <span className="text-sm font-medium text-white/72">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-5 lg:w-[320px]">
            <div
              className="glass-card overflow-hidden rounded-[36px]"
              style={{
                width: "100%",
                height: 380,
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Image
                src="/images/profile/profile.jpeg"
                alt="Jasond Delos Santos"
                width={420}
                height={520}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="premium-card p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-white/38">Current focus</div>
              <div className="mt-3 text-lg font-normal text-white/92">
                Automation, internal platforms, data workflows, and AI-enabled tooling
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">
                Building practical software that improves workflow visibility, removes manual effort, and keeps systems clean to operate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
