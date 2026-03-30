"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Msg } from "@/components/ChatbotPanel";

const ChatbotPanel = dynamic(() => import("@/components/ChatbotPanel"), {
  ssr: false,
});

const INITIAL_CHAT_MESSAGES: Msg[] = [
  {
    role: "assistant",
    text:
      "Hi. I’m Jasond. You can ask me about my work, projects, skills, experience, or anything you’d like to know from my portfolio.",
  },
];

const CHAT_HIGHLIGHT_PROMPTS = [
  {
    label: "Tech stack",
    prompt: "What’s your tech stack?",
  },
  {
    label: "Best project",
    prompt: "What project are you most proud of?",
  },
  {
    label: "Availability",
    prompt: "Are you open to work?",
  },
  {
    label: "Background",
    prompt: "Tell me about yourself",
  },
] as const;

const HOMEPAGE_COMMANDS = new Set(["about", "projects", "gallery", "resume", "contact"]);

function dispatchDesktopWindow(windowId: string) {
  window.dispatchEvent(
    new CustomEvent("open-desktop-window", {
      detail: { windowId },
    })
  );
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(INITIAL_CHAT_MESSAGES);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalStatus, setTerminalStatus] = useState("Type help, a section name, or ask a normal question.");
  const [isTerminalPreviewMinimized, setIsTerminalPreviewMinimized] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isHomepage = pathname === "/";
  const activeTeaser = CHAT_HIGHLIGHT_PROMPTS[teaserIndex] ?? CHAT_HIGHLIGHT_PROMPTS[0];

  useEffect(() => {
    function handleOpenChatbot(event: Event) {
      const detail =
        event instanceof CustomEvent &&
        event.detail &&
        typeof event.detail === "object" &&
        !Array.isArray(event.detail)
          ? event.detail
          : null;
      const prompt =
        detail && "prompt" in detail && typeof detail.prompt === "string" ? detail.prompt : null;
      const resetConversation =
        detail &&
        "resetConversation" in detail &&
        typeof detail.resetConversation === "boolean"
          ? detail.resetConversation
          : false;

      if (resetConversation) {
        setMessages(INITIAL_CHAT_MESSAGES);
      }

      if (prompt) {
        setPendingPrompt(prompt);
      }

      setOpen(true);
    }

    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => {
      window.removeEventListener("open-chatbot", handleOpenChatbot);
    };
  }, []);

  useEffect(() => {
    if (open) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTeaserIndex((current) => (current + 1) % CHAT_HIGHLIGHT_PROMPTS.length);
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [open]);

  function openChat(prompt?: string, options?: { resetConversation?: boolean }) {
    if (options?.resetConversation) {
      setMessages(INITIAL_CHAT_MESSAGES);
    }

    if (prompt) {
      setPendingPrompt(prompt);
    }

    setOpen(true);
  }

  function handleTerminalSubmit() {
    const normalized = terminalInput.trim();

    if (!normalized) {
      openChat();
      return;
    }

    const command = normalized.toLowerCase();

    if (command === "help") {
      setTerminalStatus("Commands: about, projects, gallery, resume, contact. Normal questions still open AI chat.");
      setTerminalInput("");
      return;
    }

    if (HOMEPAGE_COMMANDS.has(command)) {
      dispatchDesktopWindow(command);
      setTerminalStatus(`Opened ./${command}`);
      setTerminalInput("");
      return;
    }

    openChat(normalized);
    setTerminalStatus(`Sent prompt: ${normalized}`);
    setTerminalInput("");
  }

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {!open && isHomepage ? (
        <div
          className="homepage-terminal-shell"
          style={{
            position: "fixed",
            bottom: 20,
            zIndex: 2147483647,
            width: "min(500px, calc(100vw - 24px))",
          }}
        >
          <div className="homepage-linux-launcher overflow-hidden rounded-[14px] border border-black/60 text-[#f6efe9] backdrop-blur-xl">
            <div className="homepage-linux-launcher-bar flex items-center justify-between px-4 py-2.5">
              <button
                type="button"
                onClick={() => openChat()}
                className="font-mono text-[12px] text-white/84 transition hover:text-white"
              >
                jasond@portfolio: ~
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsTerminalPreviewMinimized((current) => !current)}
                  className="homepage-linux-control"
                  aria-label={isTerminalPreviewMinimized ? "Restore terminal preview" : "Minimize terminal preview"}
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="homepage-linux-control"
                  aria-label="Maximize terminal preview"
                >
                  □
                </button>
              </div>
            </div>
            <div className="relative border-t border-[#e95420]/80 bg-[#300a24] px-4 py-4">
              {!isTerminalPreviewMinimized ? (
                <div className="relative font-mono text-[13px] leading-6 text-[#f6efe9]">
                  <div>
                    <span className="text-[#33d17a]">jasond@portfolio:~$</span>{" "}
                    <span className="text-white/92">help</span>
                  </div>
                  <div className="text-[#33d17a]">about projects gallery resume contact</div>
                  <div className="mt-2 text-white/82">{terminalStatus}</div>
                  <div className="mt-1 text-white/56">Tip: ask &quot;{activeTeaser.prompt}&quot;</div>
                </div>
              ) : null}

              <div className={`relative flex items-end gap-3 ${isTerminalPreviewMinimized ? "" : "mt-4"}`}>
                <label className="flex flex-1 items-center gap-2 rounded-[8px] border border-white/8 bg-black/18 px-3 py-2.5 font-mono text-[13px] text-[#fff2eb]">
                  <span className="shrink-0 text-[#33d17a]">jasond@portfolio:~$</span>
                  <input
                    value={terminalInput}
                    onChange={(event) => setTerminalInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleTerminalSubmit();
                      }
                    }}
                    placeholder="help"
                    className="min-w-0 flex-1 bg-transparent text-[#fff7f2] outline-none placeholder:text-white/24"
                  />
                  {!terminalInput ? <span className="ubuntu-cursor" aria-hidden="true" /> : null}
                </label>

                <button
                  type="button"
                  onClick={handleTerminalSubmit}
                  className="rounded-[8px] border border-white/8 bg-white/6 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-white/84 transition hover:bg-white/10"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!open && !isHomepage ? (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 2147483647,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => openChat(activeTeaser.prompt, { resetConversation: true })}
            className="chatbot-teaser"
            style={{
              maxWidth: 290,
              padding: "14px 16px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(25,34,45,0.94), rgba(10,13,18,0.95))",
              color: "rgba(245,247,250,0.96)",
              textAlign: "left",
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 22px 54px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 9999,
                background: "rgba(143,184,255,0.10)",
                border: "1px solid rgba(143,184,255,0.14)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(223,233,255,0.86)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 9999,
                  background: "rgba(143,184,255,0.95)",
                  boxShadow: "0 0 14px rgba(143,184,255,0.55)",
                }}
              />
              Portfolio AI
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 15,
                lineHeight: 1.5,
                color: "rgba(245,247,250,0.96)",
              }}
            >
              Ask Jasond about <span style={{ color: "#dfe9ff" }}>{activeTeaser.prompt}</span>
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "rgba(176,185,198,0.78)",
              }}
            >
              Get a quick answer about projects, skills, experience, and availability.
            </div>
          </button>

          <div className="chatbot-chip-row">
            {CHAT_HIGHLIGHT_PROMPTS.slice(0, 3).map((item) => (
              <button
                key={item.prompt}
                type="button"
                onClick={() => openChat(item.prompt, { resetConversation: true })}
                className="chatbot-chip"
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openChat()}
            className="chatbot-launcher"
            style={{
              position: "relative",
              minWidth: 208,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              padding: "15px 18px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(135deg, rgba(20,28,37,0.96), rgba(10,13,18,0.94))",
              color: "rgba(245,247,250,0.96)",
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  position: "relative",
                  width: 34,
                  height: 34,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(143,184,255,0.14)",
                  boxShadow:
                    "0 0 0 1px rgba(143,184,255,0.12), 0 0 24px rgba(143,184,255,0.18)",
                }}
              >
                <span
                  className="chatbot-launcher-pulse"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: 9999,
                    border: "1px solid rgba(143,184,255,0.16)",
                  }}
                />
                <span style={{ fontSize: 15 }}>💬</span>
              </span>

              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  lineHeight: 1.2,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  Ask Jasond
                </span>
                <span
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    color: "rgba(176,185,198,0.82)",
                  }}
                >
                  Projects, skills, experience
                </span>
              </span>
            </span>

            <span
              style={{
                fontSize: 18,
                color: "rgba(223,233,255,0.86)",
              }}
            >
              →
            </span>
          </button>
        </div>
      ) : null}

      {open ? (
        <ChatbotPanel
          onClose={() => setOpen(false)}
          messages={messages}
          setMessages={setMessages}
          pendingPrompt={pendingPrompt}
          onPendingPromptConsumed={() => setPendingPrompt(null)}
          variant={isHomepage ? "terminal" : "default"}
          anchor="right"
          resizable={!isHomepage}
        />
      ) : null}

      <style jsx>{`
        .homepage-linux-launcher {
          box-shadow:
            0 24px 58px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .homepage-linux-launcher-bar {
          background: linear-gradient(180deg, #3f3a3b, #2f2a2c);
        }

        .homepage-linux-control {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.35rem;
          height: 1.35rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.35rem;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.72);
          font-family: var(--font-ubuntu), monospace;
          font-size: 0.75rem;
          line-height: 1;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
        }

        .homepage-linux-control:hover,
        .homepage-linux-control:focus-visible {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.94);
          outline: none;
        }

        .chatbot-chip-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }

        .chatbot-chip {
          min-height: 34px;
          padding: 0.55rem 0.85rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(245, 247, 250, 0.88);
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
          transition:
            transform 180ms ease,
            background 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .chatbot-chip:hover,
        .chatbot-chip:focus-visible,
        .chatbot-teaser:hover,
        .chatbot-teaser:focus-visible,
        .chatbot-launcher:hover,
        .chatbot-launcher:focus-visible {
          transform: translateY(-2px);
          outline: none;
        }

        .chatbot-chip:hover,
        .chatbot-chip:focus-visible {
          background: rgba(143, 184, 255, 0.1);
          border-color: rgba(143, 184, 255, 0.18);
        }

        .chatbot-teaser:hover,
        .chatbot-teaser:focus-visible,
        .chatbot-launcher:hover,
        .chatbot-launcher:focus-visible {
          border-color: rgba(173, 202, 255, 0.16) !important;
          box-shadow:
            0 26px 62px rgba(0, 0, 0, 0.46),
            inset 0 1px 0 rgba(255, 255, 255, 0.07),
            0 0 0 1px rgba(143, 184, 255, 0.08);
        }

        .chatbot-launcher-pulse {
          animation: chatbotPulse 2.6s ease-in-out infinite;
        }

        @keyframes chatbotPulse {
          0%,
          100% {
            opacity: 0.22;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.56;
            transform: scale(1.08);
          }
        }

        @media (max-width: 767px) {
          .ubuntu-terminal-panel {
            width: min(100vw - 24px, 380px);
          }
        }

        .homepage-terminal-shell {
          right: 18px;
        }

        @media (min-width: 768px) {
          .homepage-terminal-shell {
            right: 24px;
          }
        }

        @media (max-width: 640px) {
          .chatbot-teaser {
            max-width: min(280px, calc(100vw - 24px));
          }

          .chatbot-chip-row {
            display: none;
          }

          .chatbot-launcher {
            min-width: 184px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chatbot-chip,
          .chatbot-teaser,
          .chatbot-launcher,
          .chatbot-launcher-pulse {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
