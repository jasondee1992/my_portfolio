"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavIcon({ icon }: { icon: "home" | "user" | "folder" | "gallery" | "file" }) {
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M4.75 10.25 12 4.75l7.25 5.5v8A2 2 0 0 1 17.25 20h-10.5a2 2 0 0 1-2-1.75v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9.25 20v-5.75h5.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.75 20.25c0-3.2 3.24-5.5 7.25-5.5s7.25 2.3 7.25 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "folder") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M3.75 7.75A2.75 2.75 0 0 1 6.5 5h3.18c.55 0 1.07.21 1.46.59l1.11 1.07c.39.38.92.59 1.46.59h3.79a2.75 2.75 0 0 1 2.75 2.75v6.75A2.75 2.75 0 0 1 17.5 19.5h-11A2.75 2.75 0 0 1 3.75 16.75v-9Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (icon === "gallery") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="4.25" y="5" width="15.5" height="14" rx="2.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8 14 2.7-2.95a1 1 0 0 1 1.47 0L16 15.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9.25" r="1.25" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M8 4.75h5.7c.53 0 1.04.21 1.41.59l2.3 2.3c.38.37.59.88.59 1.41V18A2.75 2.75 0 0 1 15.25 20.75H8A2.75 2.75 0 0 1 5.25 18V7.5A2.75 2.75 0 0 1 8 4.75Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 4.75V8.5h3.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/", icon: "home" as const },
    { label: "About", href: "/about", icon: "user" as const },
    { label: "Projects", href: "/projects", icon: "folder" as const },
    { label: "Gallery", href: "/gallery", icon: "gallery" as const },
  ];

  return (
    <header className="container-page sticky top-4 z-40 pt-4 md:pt-6">
      <div className="glass-card mx-auto rounded-[30px] px-5 py-4 md:px-7">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="h-16 w-16 overflow-hidden rounded-[18px]">
              <Image
                src="/icons/logo/logo_page_nav.png"
                alt="Jasond logo"
                width={64}
                height={64}
                sizes="64px"
                className="h-16 w-16 object-cover"
                priority
              />
            </div>

            <div className="hidden md:block">
              <div className="text-sm font-semibold tracking-[0.18em] text-white/85">
                Jasond
              </div>
              <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                Portfolio
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-3 rounded-full border border-white/6 bg-white/[0.03] px-3 py-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative rounded-full px-4 py-2 text-sm font-medium transition"
                  style={{
                    color: active ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.62)",
                    background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute inset-x-4 -bottom-px h-px rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(143,184,255,0.95), transparent)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <a
              href="/resume/Jasond_Delos_Santos_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button"
            >
              Hire Me
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <a
            href="/resume/Jasond_Delos_Santos_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full px-4 text-sm font-medium text-white/88 md:hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            Resume
          </a>
        </div>

        <div
          className="mt-4 border-t pt-4 md:hidden"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="grid grid-cols-4 gap-2">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center justify-center gap-2 rounded-[20px] px-2 py-3 text-center transition"
                  style={{
                    background: active ? "rgba(143,184,255,0.16)" : "rgba(255,255,255,0.03)",
                    color: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.78)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                    <NavIcon icon={link.icon} />
                  </span>
                  <span className="text-[11px] font-medium leading-4">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
