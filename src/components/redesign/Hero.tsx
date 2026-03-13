import Image from "next/image";

const metaItems = [
  "Python Developer",
  "jasond.worked@gmail.com",
  "Based in Philippines",
];

const socialLinks = [
  {
    name: "Email",
    href: "mailto:jasond.worked@gmail.com",
    icon: "/icons/social/gmail.png",
  },
  {
    name: "GitHub",
    href: "https://https://github.com/jasondee1992",
    icon: "/icons/social/github.png",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/jasond-delos-santos-94978a111/",
    icon: "/icons/social/linkedin.png",
  },
];

const skillIcons = [
  { name: "Python", icon: "/icons/skills/python.png" },
  { name: "Dash", icon: "/icons/skills/dash.svg" },
  { name: "Snowflake", icon: "/icons/skills/snowflake.svg" },
  { name: "Automation", icon: "/icons/skills/automation.svg" },
  { name: "AI", icon: "/icons/skills/ai.svg" },
];

export default function Hero() {
  return (
    <section className="container-page relative overflow-hidden pt-16 pb-8 md:pt-20">
      <div className="hero-glow" />

      <div className="relative z-10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
          {/* Profile image */}
          <div className="shrink-0">
            <div
              className="glass-card overflow-hidden rounded-full"
              style={{
                width: 160,
                height: 160,
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Image
                src="/images/profile/profile.jpeg"
                alt="Jasond Delos Santos"
                width={150}
                height={150}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1">
            {/* 2. Name smaller */}
            <h1 className="section-title text-3xl font-smaller tracking-tight md:text-4xl">
              Jasond Delos Santos
            </h1>

            {/* 4. plain words only, no rounded backgrounds */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/50 md:text-sm">
              {metaItems.map((item, index) => (
                <div key={item} className="flex items-center gap-4">
                  <span>{item}</span>
                  {index !== metaItems.length - 1 && (
                    <span className="hidden text-white/25 md:inline">•</span>
                  )}
                </div>
              ))}
            </div>

            {/* 5. social icons only */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.name === "Email" ? undefined : "_blank"}
                  rel={link.name === "Email" ? undefined : "noopener noreferrer"}
                  className="soft-hover flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  aria-label={link.name}
                  title={link.name}
                >
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={80}
                    height={80}
                    className="object-contain opacity-85"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}