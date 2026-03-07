"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <header className="container-page sticky top-4 z-40 pt-4 md:pt-6">
      <div
        className="glass-card mx-auto flex items-center justify-between rounded-[28px] px-5 py-4 md:px-7"
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="soft-hover flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
              color: "rgba(255,255,255,0.96)",
              letterSpacing: "-0.03em",
            }}
          >
            JD
          </div>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium transition"
                style={{
                  color: active
                    ? "rgba(255,255,255,0.96)"
                    : "rgba(255,255,255,0.62)",
                }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                    style={{ background: "rgba(255,255,255,0.85)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <a
          href="/resume/Jasond_Delos_Santos_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="soft-hover rounded-full px-5 py-3 text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.92)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.30)",
          }}
        >
          Hire Me →
        </a>
      </div>
    </header>
  );
}