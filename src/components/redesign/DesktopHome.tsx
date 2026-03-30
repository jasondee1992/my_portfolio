"use client";

import Image from "next/image";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import profileData from "@/data/knowledge/profile.json";
import { openChatbot } from "@/lib/chatbot/openChatbot";
import type { ManagedProject } from "@/lib/projects/types";

type AlbumImage = {
  src: string;
  alt: string;
};

type Album = {
  slug: string;
  name: string;
  cover: string | null;
  images: AlbumImage[];
};

type DesktopHomeProps = {
  aboutParagraphs: string[];
  projects: ManagedProject[];
  albums: Album[];
};

type WindowId = "about" | "projects" | "gallery" | "resume" | "contact";
type WindowState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
};

type WindowLayout = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const WINDOW_IDS: WindowId[] = ["about", "projects", "gallery", "resume", "contact"];
const PROFILE_IMAGE_SRC = "/images/profile/profile.jpeg";
const RESUME_URL = "/resume/Jasond_Delos_Santos_Resume.pdf";
const CONTACT_EMAIL = profileData.contact.email;
const QUICK_STATS = ["10 years in IT", "5 years in programming", "5 years in Python"] as const;

const WINDOW_LAYOUTS: Record<WindowId, WindowLayout> = {
  about: { top: 108, left: 158, width: 620, height: 560 },
  projects: { top: 138, left: 314, width: 690, height: 560 },
  gallery: { top: 168, left: 198, width: 640, height: 540 },
  resume: { top: 114, left: 360, width: 560, height: 500 },
  contact: { top: 206, left: 402, width: 470, height: 420 },
};

const DESKTOP_ITEMS: Array<{
  id: WindowId;
  title: string;
  subtitle: string;
  icon: "user" | "folder" | "gallery" | "file" | "mail";
  tint: string;
}> = [
  {
    id: "about",
    title: "About Me",
    subtitle: "Profile, experience, stack",
    icon: "user",
    tint: "from-[#ff9f72]/22 via-[#ff9f72]/10 to-transparent",
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "Enterprise and personal work",
    icon: "folder",
    tint: "from-[#c084fc]/22 via-[#c084fc]/10 to-transparent",
  },
  {
    id: "gallery",
    title: "Gallery",
    subtitle: "Visual snapshots and albums",
    icon: "gallery",
    tint: "from-[#8fb8ff]/22 via-[#8fb8ff]/10 to-transparent",
  },
  {
    id: "resume",
    title: "Resume",
    subtitle: "Summary for recruiters",
    icon: "file",
    tint: "from-[#ffd166]/22 via-[#ffd166]/10 to-transparent",
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "Email, LinkedIn, chatbot",
    icon: "mail",
    tint: "from-[#86efac]/22 via-[#86efac]/10 to-transparent",
  },
];

function createInitialWindowState() {
  return WINDOW_IDS.reduce<Record<WindowId, WindowState>>((accumulator, id) => {
    accumulator[id] = {
      open: false,
      minimized: false,
      maximized: true,
    };
    return accumulator;
  }, {} as Record<WindowId, WindowState>);
}

function formatClock(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });

  return formatter.format(value).toUpperCase();
}

function flattenSkillGroups() {
  const groups = Object.values(profileData.core_skills);
  const items = groups.flatMap((group) => group);
  return items.filter((item, index) => items.indexOf(item) === index);
}

function getPrimarySummary(paragraphs: string[]) {
  return paragraphs.slice(0, 2);
}

function getImageLabel(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function DesktopGlyph({ icon }: { icon: "user" | "folder" | "gallery" | "file" | "mail" | "bot" }) {
  if (icon === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4.75 20.25c0-3.2 3.24-5.5 7.25-5.5s7.25 2.3 7.25 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (icon === "folder") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3.75 7.75A2.75 2.75 0 0 1 6.5 5h3.18c.55 0 1.07.21 1.46.59l1.11 1.07c.39.38.92.59 1.46.59h3.79a2.75 2.75 0 0 1 2.75 2.75v6.75A2.75 2.75 0 0 1 17.5 19.5h-11A2.75 2.75 0 0 1 3.75 16.75v-9Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (icon === "gallery") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="4.25" y="5" width="15.5" height="14" rx="2.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8 14 2.7-2.95a1 1 0 0 1 1.47 0L16 15.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9.25" r="1.25" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "file") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M8 4.75h5.7c.53 0 1.04.21 1.41.59l2.3 2.3c.38.37.59.88.59 1.41V18a2.75 2.75 0 0 1-2.75 2.75H8A2.75 2.75 0 0 1 5.25 18V7.5A2.75 2.75 0 0 1 8 4.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M14 4.75V8.5h3.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 12.25h7M8.5 15.25h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="m5.75 8 5.12 4.15a1.75 1.75 0 0 0 2.26 0L18.25 8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.75 15.25V8.75H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m12.25 12 3 3 3.5-4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DesktopWindow({
  id,
  title,
  subtitle,
  icon,
  isCompact,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
}: {
  id: WindowId;
  title: string;
  subtitle: string;
  icon: "user" | "folder" | "gallery" | "file" | "mail";
  isCompact: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}) {
  const dragControls = useDragControls();
  const layout = WINDOW_LAYOUTS[id];

  function handleDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (isCompact || isMaximized) {
      return;
    }

    dragControls.start(event);
  }

  return (
    <motion.section
      drag={!isCompact && !isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.97, y: 22 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onPointerDown={onFocus}
      className="ubuntu-window"
      style={
        isCompact
          ? {
              position: "fixed",
              inset: "5rem 0.9rem 1rem",
              zIndex,
            }
          : isMaximized
            ? {
                position: "absolute",
                top: 76,
                left: 118,
                right: 26,
                bottom: 26,
                zIndex,
              }
            : {
                position: "absolute",
                top: layout.top,
                left: layout.left,
                width: layout.width,
                height: layout.height,
                zIndex,
              }
      }
    >
      <div className="ubuntu-window-shell flex h-full flex-col overflow-hidden rounded-[26px] border border-white/12 bg-[#151018]/92 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div
          onPointerDown={handleDragStart}
          className={`ubuntu-window-bar flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 ${isCompact || isMaximized ? "" : "cursor-grab active:cursor-grabbing"}`}
        >
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 md:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82">
                <DesktopGlyph icon={icon} />
              </span>
              <div>
                <div className="text-sm font-medium text-white/92">{title}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/36">{subtitle}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Minimize ${title}`}
              onClick={onMinimize}
              className="desktop-window-control"
            >
              -
            </button>
            <button
              type="button"
              aria-label={isMaximized ? `Restore ${title}` : `Maximize ${title}`}
              onClick={onMaximize}
              className="desktop-window-control"
            >
              □
            </button>
            <button
              type="button"
              aria-label={`Close ${title}`}
              onClick={onClose}
              className="desktop-window-control"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">{children}</div>
      </div>
    </motion.section>
  );
}

export default function DesktopHome({ aboutParagraphs, projects, albums }: DesktopHomeProps) {
  const [windowState, setWindowState] = useState<Record<WindowId, WindowState>>(createInitialWindowState);
  const [windowOrder, setWindowOrder] = useState<WindowId[]>([]);
  const [isCompact, setIsCompact] = useState(false);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [selectedGalleryAlbumSlug, setSelectedGalleryAlbumSlug] = useState<string | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{ albumSlug: string; index: number } | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactSenderEmail, setContactSenderEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("Portfolio inquiry");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContactMessage, setIsSendingContactMessage] = useState(false);
  const [contactSendFeedback, setContactSendFeedback] = useState<string | null>(null);

  const skillItems = useMemo(() => flattenSkillGroups().slice(0, 12), []);
  const introParagraphs = useMemo(() => getPrimarySummary(aboutParagraphs), [aboutParagraphs]);
  const selectedGalleryAlbum = useMemo(
    () => albums.find((album) => album.slug === selectedGalleryAlbumSlug) ?? null,
    [albums, selectedGalleryAlbumSlug]
  );
  const selectedGalleryPreview =
    selectedGalleryImage && selectedGalleryAlbum?.slug === selectedGalleryImage.albumSlug
      ? selectedGalleryAlbum.images[selectedGalleryImage.index] ?? null
      : null;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    function updateCompactMode() {
      setIsCompact(mediaQuery.matches);
    }

    updateCompactMode();
    mediaQuery.addEventListener("change", updateCompactMode);
    return () => {
      mediaQuery.removeEventListener("change", updateCompactMode);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  function focusWindow(id: WindowId) {
    setWindowOrder((current) => [...current.filter((item) => item !== id), id]);
  }

  function openWindow(id: WindowId) {
    setWindowState(() => {
      const nextState = createInitialWindowState();
      nextState[id] = {
        open: true,
        minimized: false,
        maximized: isCompact ? false : true,
      };
      return nextState;
    });

    setWindowOrder([id]);

    if (id === "gallery") {
      setSelectedGalleryImage(null);
    }
  }

  function closeWindow(id: WindowId) {
    setWindowState((current) => ({
      ...current,
      [id]: {
        ...current[id],
        open: false,
        minimized: false,
        maximized: true,
      },
    }));
    setWindowOrder((current) => current.filter((item) => item !== id));

    if (id === "gallery") {
      setSelectedGalleryImage(null);
    }
  }

  function minimizeWindow(id: WindowId) {
    setWindowState((current) => ({
      ...current,
      [id]: {
        ...current[id],
        open: false,
        minimized: true,
      },
    }));
    setWindowOrder((current) => current.filter((item) => item !== id));
  }

  function maximizeWindow(id: WindowId) {
    setWindowState((current) => ({
      ...current,
      [id]: {
        ...current[id],
        open: true,
        minimized: false,
        maximized: !current[id].maximized,
      },
    }));
    focusWindow(id);
  }

  async function sendContactMessage() {
    const trimmedEmail = contactSenderEmail.trim();
    const trimmedSubject = contactSubject.trim();
    const trimmedMessage = contactMessage.trim();

    if (!trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setContactSendFeedback("Email, subject, and message are required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setContactSendFeedback("Please enter a valid email address.");
      return;
    }

    setIsSendingContactMessage(true);
    setContactSendFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactName.trim(),
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to send message right now.");
      }

      setContactSendFeedback(`Message sent to ${CONTACT_EMAIL}.`);
      setContactName("");
      setContactSenderEmail("");
      setContactSubject("Portfolio inquiry");
      setContactMessage("");
    } catch (error) {
      setContactSendFeedback(
        error instanceof Error ? error.message : "Unable to send message right now."
      );
    } finally {
      setIsSendingContactMessage(false);
    }
  }

  useEffect(() => {
    function handleOpenWindow(event: Event) {
      const detail =
        event instanceof CustomEvent &&
        event.detail &&
        typeof event.detail === "object" &&
        !Array.isArray(event.detail)
          ? event.detail
          : null;
      const windowId =
        detail && "windowId" in detail && typeof detail.windowId === "string"
          ? detail.windowId
          : null;

      if (
        windowId === "about" ||
        windowId === "projects" ||
        windowId === "gallery" ||
        windowId === "resume" ||
        windowId === "contact"
      ) {
        openWindow(windowId);
      }
    }

    window.addEventListener("open-desktop-window", handleOpenWindow);
    return () => {
      window.removeEventListener("open-desktop-window", handleOpenWindow);
    };
  });

  return (
    <main className="ubuntu-desktop relative min-h-screen overflow-hidden">
      <div className="ubuntu-wallpaper absolute inset-0" aria-hidden="true" />
      <div className="ubuntu-grid absolute inset-0" aria-hidden="true" />

      <header className="ubuntu-shell-bar relative z-30 px-3 pt-3 md:px-6 md:pt-5">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between rounded-[20px] border border-white/10 bg-black/35 px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/84">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.45)]" />
              <span>JasonD Workstation</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/76">
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/72 md:inline-flex">
              Asia/Manila, Philippines
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/92">
              {clock} PHT
            </span>
          </div>
        </div>
      </header>

      <aside className="ubuntu-dock fixed left-3 top-1/2 z-40 hidden w-[76px] -translate-y-1/2 rounded-[28px] border border-white/10 bg-black/30 px-2 py-3 shadow-[0_22px_56px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:left-5 md:flex md:flex-col md:gap-2">
        {DESKTOP_ITEMS.map((item) => {
          const active = windowState[item.id].open;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openWindow(item.id)}
              className="group relative flex flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-white/72 transition hover:bg-white/[0.06] hover:text-white"
              aria-label={item.title}
              title={item.title}
            >
              <span className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full ${active ? "bg-[#ff9f72]" : "bg-transparent"} transition`} />
              <span className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05]">
                <DesktopGlyph icon={item.icon} />
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">{item.title.split(" ")[0]}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => openChatbot()}
          className="mt-2 flex flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-white/72 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Open AI terminal"
          title="Open AI terminal"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-[#ff9f72]/10 text-[#ffd4bf]">
            <DesktopGlyph icon="bot" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">AI</span>
        </button>
      </aside>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1500px] flex-col px-4 pb-24 pt-6 md:px-6 lg:pl-[7.4rem] lg:pt-8">
        <div className="relative hidden min-h-[calc(100vh-10rem)] overflow-hidden lg:block">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="h-[420px] w-[420px] rounded-full border border-white/6 bg-white/[0.01]" />
              <div className="absolute inset-[3.25rem] rounded-full border border-white/5" />
              <div className="absolute inset-[7rem] rounded-full border border-white/4" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <div className="text-[11px] uppercase tracking-[0.42em] text-white/24">JasonD Workspace</div>
                <div className="mt-4 text-sm text-white/18">Click an icon to open a window</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid gap-4 lg:hidden">
          {DESKTOP_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openWindow(item.id)}
              className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/24 px-5 py-4 text-left text-white/82 backdrop-blur-xl"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05]">
                  <DesktopGlyph icon={item.icon} />
                </span>
                <span>
                  <span className="block text-base font-medium text-white/94">{item.title}</span>
                  <span className="block text-sm text-white/52">{item.subtitle}</span>
                </span>
              </span>
              <span>→</span>
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {windowOrder.map((id, index) => {
          const state = windowState[id];

          if (!state.open) {
            return null;
          }

          if (id === "about") {
            return (
              <DesktopWindow
                key={id}
                id={id}
                title="About Me"
                subtitle="Profile, experience, and stack"
                icon="user"
                isCompact={isCompact}
                isMaximized={state.maximized}
                zIndex={50 + index}
                onClose={() => closeWindow(id)}
                onMinimize={() => minimizeWindow(id)}
                onMaximize={() => maximizeWindow(id)}
                onFocus={() => focusWindow(id)}
              >
                <div className="space-y-5">
                  <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                      <div className="overflow-hidden rounded-[20px] border border-white/10">
                        <Image
                          src={PROFILE_IMAGE_SRC}
                          alt="Jasond Delos Santos"
                          width={320}
                          height={400}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                      <div className="mt-4 text-lg font-medium text-white/95">{profileData.name}</div>
                      <div className="mt-1 text-sm leading-6 text-white/56">{profileData.public_location}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_STATS.map((item) => (
                          <span key={item} className="rounded-full border border-white/8 bg-black/24 px-3 py-1.5 text-xs text-white/68">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Overview</div>
                        <div className="mt-3 space-y-4 text-sm leading-7 text-white/66">
                          {introParagraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Core tools</div>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {skillItems.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/8 bg-black/26 px-3 py-2 text-sm text-white/72"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Recruiter note</div>
                        <p className="mt-3 text-sm leading-7 text-white/60">
                          Open to thoughtful roles in software development, data engineering, and AI-enabled product work, with hands-on experience across backend systems, frontend delivery, automation, and production support.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="premium-button">
                            Open resume
                            <span aria-hidden="true">↗</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => openChatbot("Tell me about yourself", { resetConversation: true })}
                            className="premium-button-secondary"
                          >
                            Ask AI
                            <span aria-hidden="true">$</span>
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>

                  <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
                    <JourneyTimeline variant="embedded" />
                  </section>
                </div>
              </DesktopWindow>
            );
          }

          if (id === "projects") {
            return (
              <DesktopWindow
                key={id}
                id={id}
                title="Projects"
                subtitle="Selected enterprise and personal work"
                icon="folder"
                isCompact={isCompact}
                isMaximized={state.maximized}
                zIndex={50 + index}
                onClose={() => closeWindow(id)}
                onMinimize={() => minimizeWindow(id)}
                onMaximize={() => maximizeWindow(id)}
                onFocus={() => focusWindow(id)}
              >
                <div className="space-y-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Projects</div>
                    <h2 className="mt-2 text-2xl font-medium text-white/94">Production-minded builds with clear operational value</h2>
                  </div>

                  {projects.length === 0 ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-white/58">
                      No public projects are available yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {projects.map((project, projectIndex) => {
                        const section = getOptionalText(project.section);
                        const title = getOptionalText(project.title);
                        const role = getOptionalText(project.role);
                        const projectType = getOptionalText(project.projectType);
                        const summary = getOptionalText(project.summaryDescription);
                        const techStack = project.techStack
                          .map((item) => item.trim())
                          .filter((item) => item.length > 0);

                        return (
                          <article key={project.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                                  {section
                                    ? `${String(projectIndex + 1).padStart(2, "0")} · ${section}`
                                    : String(projectIndex + 1).padStart(2, "0")}
                                </div>
                                {title ? <h3 className="mt-2 text-lg font-medium leading-7 text-white/92">{title}</h3> : null}
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${project.visibility === "internal" ? "border-[#ff9f72]/20 bg-[#ff9f72]/10 text-[#ffd0bb]" : "border-[#86efac]/18 bg-[#86efac]/10 text-[#d6fce2]"}`}>
                                {project.visibility}
                              </span>
                            </div>

                            {role || projectType ? (
                              <div className="mt-4 space-y-1 text-sm text-white/56">
                                {role ? (
                                  <div>
                                    <span className="text-white/84">Role:</span> {role}
                                  </div>
                                ) : null}
                                {projectType ? (
                                  <div>
                                    <span className="text-white/84">Type:</span> {projectType}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {summary ? <p className="mt-4 text-sm leading-7 text-white/60">{summary}</p> : null}

                            {techStack.length > 0 ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {techStack.map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-full border border-white/8 bg-black/24 px-3 py-1.5 text-xs text-white/70"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </DesktopWindow>
            );
          }

          if (id === "gallery") {
            return (
              <DesktopWindow
                key={id}
                id={id}
                title="Gallery"
                subtitle="Album previews and visual snapshots"
                icon="gallery"
                isCompact={isCompact}
                isMaximized={state.maximized}
                zIndex={50 + index}
                onClose={() => closeWindow(id)}
                onMinimize={() => minimizeWindow(id)}
                onMaximize={() => maximizeWindow(id)}
                onFocus={() => focusWindow(id)}
              >
                <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
                  <aside className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Gallery folders</div>
                    <div className="mt-4 space-y-2">
                      {albums.length === 0 ? (
                        <div className="rounded-[20px] border border-white/10 bg-black/24 px-4 py-4 text-sm text-white/58">
                          No gallery folders found yet.
                        </div>
                      ) : (
                        albums.map((album) => {
                          const active = selectedGalleryAlbumSlug === album.slug;

                          return (
                            <button
                              key={album.slug}
                              type="button"
                              onClick={() => {
                                setSelectedGalleryAlbumSlug(album.slug);
                                setSelectedGalleryImage(null);
                              }}
                              className={`flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition ${
                                active
                                  ? "border-[#8fb8ff]/20 bg-[#8fb8ff]/10 text-white"
                                  : "border-white/8 bg-black/24 text-white/72 hover:border-white/12 hover:bg-white/[0.05] hover:text-white"
                              }`}
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-[#ffd166]/10 text-[#ffe1a0]">
                                <DesktopGlyph icon="folder" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium capitalize text-inherit">{album.name}</span>
                                <span className="block text-xs text-white/46">{album.images.length} images</span>
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </aside>

                  <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 md:p-5">
                    {selectedGalleryAlbum ? (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Folder</div>
                            <h2 className="mt-2 text-2xl font-medium capitalize text-white/94">{selectedGalleryAlbum.name}</h2>
                            <div className="mt-2 text-sm text-white/52">
                              Home / Gallery / {selectedGalleryAlbum.name}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGalleryAlbumSlug(null);
                              setSelectedGalleryImage(null);
                            }}
                            className="premium-button-secondary"
                          >
                            Back to folders
                            <span aria-hidden="true">←</span>
                          </button>
                        </div>

                        {selectedGalleryAlbum.images.length === 0 ? (
                          <div className="rounded-[20px] border border-white/10 bg-black/24 px-5 py-8 text-sm text-white/58">
                            This folder has no images yet.
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {selectedGalleryAlbum.images.map((image, imageIndex) => (
                              <button
                                key={image.src}
                                type="button"
                                onClick={() =>
                                  setSelectedGalleryImage({
                                    albumSlug: selectedGalleryAlbum.slug,
                                    index: imageIndex,
                                  })
                                }
                                className="overflow-hidden rounded-[20px] border border-white/8 bg-black/24 text-left transition hover:border-white/12 hover:bg-white/[0.04]"
                              >
                                <div className="relative aspect-[4/3] bg-black/30">
                                  <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                                </div>
                                <div className="border-t border-white/8 px-4 py-3">
                                  <div className="truncate text-sm font-medium text-white/88">{getImageLabel(image.alt)}</div>
                                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">Image file</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-black/18 px-6 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-[#ffd166]/10 text-[#ffe1a0]">
                          <DesktopGlyph icon="folder" />
                        </span>
                        <div className="mt-5 text-lg font-medium text-white/92">Open a gallery folder</div>
                        <p className="mt-2 max-w-md text-sm leading-7 text-white/52">
                          Select a folder on the left to browse the same albums and images from your gallery inside this Ubuntu-style workspace.
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                {selectedGalleryPreview && selectedGalleryAlbum ? (
                  <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/82 p-4"
                    onClick={() => setSelectedGalleryImage(null)}
                  >
                    <div
                      className="relative w-full max-w-6xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#161019]/96 shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
                        <div className="flex items-center justify-between border-b border-white/8 bg-black/25 px-4 py-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white/88">
                              {selectedGalleryAlbum.name} / {getImageLabel(selectedGalleryPreview.alt)}
                            </div>
                            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/38">
                              Image Viewer
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedGalleryImage(null)}
                            className="desktop-window-control"
                            aria-label="Close image preview"
                          >
                            ×
                          </button>
                        </div>

                        <div className="relative aspect-[16/10] w-full bg-black/50">
                          <Image
                            src={selectedGalleryPreview.src}
                            alt={selectedGalleryPreview.alt}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1280px) 100vw, 1200px"
                            priority
                          />
                        </div>

                        {selectedGalleryAlbum.images.length > 1 ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedGalleryImage((current) =>
                                  current
                                    ? {
                                        albumSlug: current.albumSlug,
                                        index:
                                          (current.index - 1 + selectedGalleryAlbum.images.length) %
                                          selectedGalleryAlbum.images.length,
                                      }
                                    : current
                                )
                              }
                              className="premium-button-secondary absolute left-4 top-1/2 -translate-y-1/2"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedGalleryImage((current) =>
                                  current
                                    ? {
                                        albumSlug: current.albumSlug,
                                        index: (current.index + 1) % selectedGalleryAlbum.images.length,
                                      }
                                    : current
                                )
                              }
                              className="premium-button-secondary absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              →
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </DesktopWindow>
            );
          }

          if (id === "resume") {
            return (
              <DesktopWindow
                key={id}
                id={id}
                title="Resume"
                subtitle="Fast recruiter summary"
                icon="file"
                isCompact={isCompact}
                isMaximized={state.maximized}
                zIndex={50 + index}
                onClose={() => closeWindow(id)}
                onMinimize={() => minimizeWindow(id)}
                onMaximize={() => maximizeWindow(id)}
                onFocus={() => focusWindow(id)}
              >
                <div className="space-y-5">
                  <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-black/22 px-5 py-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Resume Viewer</div>
                        <h2 className="mt-2 text-xl font-medium text-white/94">Jasond Delos Santos Resume</h2>
                      </div>

                      <a
                        href={RESUME_URL}
                        download
                        className="premium-button-secondary"
                        aria-label="Download resume PDF"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M12 4.75v9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="m8.75 11.75 3.25 3.5 3.25-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5.75 18.25h12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        Download
                      </a>
                    </div>

                    <div className="bg-black/26 p-3 md:p-4">
                      <div className="overflow-hidden rounded-[20px] border border-white/8 bg-white">
                        <iframe
                          src={`${RESUME_URL}#view=FitH`}
                          title="Jasond Delos Santos Resume PDF"
                          className="h-[72vh] min-h-[640px] w-full bg-white"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </DesktopWindow>
            );
          }

          return (
            <DesktopWindow
              key={id}
              id={id}
              title="Contact"
              subtitle="Email, LinkedIn, and AI chat"
              icon="mail"
              isCompact={isCompact}
              isMaximized={state.maximized}
              zIndex={50 + index}
              onClose={() => closeWindow(id)}
              onMinimize={() => minimizeWindow(id)}
              onMaximize={() => maximizeWindow(id)}
              onFocus={() => focusWindow(id)}
            >
              <div className="space-y-5">
                <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                  <div className="border-b border-white/8 bg-black/22 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-medium text-white/94">Compose message</h2>
                      </div>
                      <div className="rounded-full border border-[#86efac]/18 bg-[#86efac]/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#d6fce2]">
                        Draft
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-5 py-5">
                    <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
                      <label htmlFor="contact-name" className="text-sm font-medium text-white/62">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="Your name"
                        className="h-12 rounded-[16px] border border-white/8 bg-black/22 px-4 text-sm text-white/90 outline-none transition focus:border-[#8fb8ff]/24 focus:bg-black/28"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
                      <label htmlFor="contact-email" className="text-sm font-medium text-white/62">
                        From
                      </label>
                      <input
                        id="contact-email"
                        value={contactSenderEmail}
                        onChange={(event) => setContactSenderEmail(event.target.value)}
                        placeholder="your@email.com"
                        className="h-12 rounded-[16px] border border-white/8 bg-black/22 px-4 text-sm text-white/90 outline-none transition focus:border-[#8fb8ff]/24 focus:bg-black/28"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
                      <label htmlFor="contact-subject" className="text-sm font-medium text-white/62">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        value={contactSubject}
                        onChange={(event) => setContactSubject(event.target.value)}
                        placeholder="Portfolio inquiry"
                        className="h-12 rounded-[16px] border border-white/8 bg-black/22 px-4 text-sm text-white/90 outline-none transition focus:border-[#8fb8ff]/24 focus:bg-black/28"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)]">
                      <label htmlFor="contact-message" className="pt-3 text-sm font-medium text-white/62">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        value={contactMessage}
                        onChange={(event) => setContactMessage(event.target.value)}
                        placeholder="Hi Jasond, I'd like to talk about a role, project, or collaboration."
                        rows={12}
                        className="min-h-[280px] rounded-[18px] border border-white/8 bg-black/22 px-4 py-3 text-sm leading-7 text-white/90 outline-none transition focus:border-[#8fb8ff]/24 focus:bg-black/28"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                      <div className="text-sm text-white/48">
                        Messages send directly to {CONTACT_EMAIL} from the portfolio app.
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setContactName("");
                            setContactSenderEmail("");
                            setContactSubject("Portfolio inquiry");
                            setContactMessage("");
                            setContactSendFeedback(null);
                          }}
                          className="premium-button-secondary"
                        >
                          Clear draft
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendContactMessage()}
                          disabled={isSendingContactMessage}
                          className="premium-button"
                        >
                          {isSendingContactMessage ? "Sending..." : "Send"}
                          <span aria-hidden="true">↗</span>
                        </button>
                      </div>
                    </div>

                    {contactSendFeedback ? (
                      <div className="rounded-[16px] border border-white/8 bg-black/18 px-4 py-3 text-sm text-white/72">
                        {contactSendFeedback}
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            </DesktopWindow>
          );
        })}
      </AnimatePresence>
    </main>
  );
}
