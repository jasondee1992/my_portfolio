"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
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

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-12 w-12 items-center justify-center rounded-full md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <span className="flex flex-col gap-1.5">
              <span
                className="block h-0.5 w-5 rounded-full transition-transform duration-200"
                style={{
                  background: "currentColor",
                  transform: mobileMenuOpen ? "translateY(8px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-opacity duration-200"
                style={{
                  background: "currentColor",
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-transform duration-200"
                style={{
                  background: "currentColor",
                  transform: mobileMenuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="mt-4 space-y-2 border-t pt-4 md:hidden"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium transition"
                  style={{
                    background: active ? "rgba(143,184,255,0.16)" : "rgba(255,255,255,0.03)",
                    color: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href="/resume/Jasond_Delos_Santos_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button mt-3 flex w-full"
            >
              Hire Me
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
