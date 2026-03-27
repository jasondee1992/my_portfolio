"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { getBrowserGeoDebugHeaders, getBrowserVisitMetadata } from "@/lib/browserVisitMetadata";

export type Msg = { role: "user" | "assistant"; text: string };
type PanelSize = { width: number; height: number };
type ResizeDirection = "left" | "top" | "top-left";
type ResizeState = {
  direction: ResizeDirection;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};
type ChatRequestHistoryItem = {
  role: Msg["role"];
  content: string;
};
type ChatRequestPayload = {
  message: string;
  history: ChatRequestHistoryItem[];
  sessionId?: string | null;
  visitorId?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
  timeZone?: string | null;
  session_id?: string | null;
  visitor_id?: string | null;
  page_url?: string | null;
  user_agent?: string | null;
  time_zone?: string | null;
};

const MAX_HISTORY_MESSAGES = 12;
const DEFAULT_PANEL_WIDTH = 360;
const DEFAULT_PANEL_HEIGHT = 560;
const MIN_PANEL_WIDTH = 320;
const MIN_PANEL_HEIGHT = 420;
const SUGGESTED_PROMPTS = [
  "Tell me about yourself",
  "What’s your tech stack?",
  "Are you open to work?",
] as const;

const PORTFOLIO_GUARDRAIL =
  "Ask me about my projects, skills, experience, background, and portfolio.";

const FALLBACK_MESSAGE =
  "I don’t have enough verified information about that in my current portfolio data, but I’d be happy to talk about my projects, skills, experience, and background.";

const PROFILE_IMAGE_SRC = "/images/profile/profile.jpeg";

export default function ChatbotPanel({
  onClose,
  messages,
  setMessages,
}: {
  onClose: () => void;
  messages: Msg[];
  setMessages: Dispatch<SetStateAction<Msg[]>>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [panelSize, setPanelSize] = useState<PanelSize>({
    width: DEFAULT_PANEL_WIDTH,
    height: DEFAULT_PANEL_HEIGHT,
  });
  const [isResizing, setIsResizing] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  function clampPanelSize(width: number, height: number) {
    if (typeof window === "undefined") {
      return {
        width: Math.max(width, MIN_PANEL_WIDTH),
        height: Math.max(height, MIN_PANEL_HEIGHT),
      };
    }

    return {
      width: Math.min(
        Math.max(width, MIN_PANEL_WIDTH),
        Math.max(MIN_PANEL_WIDTH, window.innerWidth - 24)
      ),
      height: Math.min(
        Math.max(height, MIN_PANEL_HEIGHT),
        Math.max(MIN_PANEL_HEIGHT, window.innerHeight - 120)
      ),
    };
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [input]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const resizeState = resizeStateRef.current;

      if (!resizeState) {
        return;
      }

      const nextWidth =
        resizeState.direction === "left" || resizeState.direction === "top-left"
          ? resizeState.startWidth + (resizeState.startX - event.clientX)
          : resizeState.startWidth;
      const nextHeight =
        resizeState.direction === "top" || resizeState.direction === "top-left"
          ? resizeState.startHeight + (resizeState.startY - event.clientY)
          : resizeState.startHeight;

      setPanelSize(clampPanelSize(nextWidth, nextHeight));
    }

    function stopResizing() {
      resizeStateRef.current = null;
      setIsResizing(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isResizing]);

  useEffect(() => {
    function syncPanelSizeToViewport() {
      setPanelSize((current) => clampPanelSize(current.width, current.height));
    }

    window.addEventListener("resize", syncPanelSizeToViewport);
    return () => {
      window.removeEventListener("resize", syncPanelSizeToViewport);
    };
  }, []);

  function handleResizeStart(
    direction: ResizeDirection,
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    event.preventDefault();

    resizeStateRef.current = {
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: panelSize.width,
      startHeight: panelSize.height,
    };

    setIsResizing(true);
  }

  async function sendMessage(rawMessage?: string) {
    const q = (rawMessage ?? input).trim();
    if (!q || loading) return;

    const requestHistory: ChatRequestHistoryItem[] = messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));
    const metadata = getBrowserVisitMetadata();
    const requestPayload: ChatRequestPayload = {
      message: q,
      history: requestHistory,
      sessionId: metadata.sessionId,
      visitorId: metadata.visitorId,
      pageUrl: metadata.pageUrl,
      userAgent: metadata.userAgent,
      timeZone: metadata.timeZone,
      session_id: metadata.sessionId,
      visitor_id: metadata.visitorId,
      page_url: metadata.pageUrl,
      user_agent: metadata.userAgent,
      time_zone: metadata.timeZone,
    };

    setInput("");
    setMessages((current) => [...current, { role: "user", text: q }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getBrowserGeoDebugHeaders(),
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const result = (await response.json()) as { answer?: string };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: result.answer?.trim() || FALLBACK_MESSAGE,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: FALLBACK_MESSAGE,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestedPrompts = messages.length <= 1 && !loading;

  return (
    <>
      <div
        className="chat-panel-shell"
        style={{
          position: "fixed",
          right: 20,
          bottom: 84,
          width: `min(${panelSize.width}px, calc(100vw - 24px))`,
          height: `min(${panelSize.height}px, calc(100vh - 120px))`,
          background: "rgba(12,12,13,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 26,
          boxShadow: "0 28px 90px rgba(0,0,0,0.62)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 2147483647,
          backdropFilter: "blur(22px)",
          cursor: isResizing ? "nwse-resize" : "default",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 28, height: 28 }}>
              <Image
                src={PROFILE_IMAGE_SRC}
                alt="Jasond Delos Santos"
                fill
                sizes="28px"
                style={{
                  borderRadius: "9999px",
                  objectFit: "cover",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 400,
                fontSize: 14,
              }}
            >
              <span>Jasond Delos Santos</span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "9999px",
                  background: "#22c55e",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          className="chat-scroll-area"
          style={{
            flex: 1,
            padding: 16,
            overflowY: "auto",
            fontSize: 14,
            color: "white",
          }}
        >
          <div
            style={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                {message.role === "assistant" ? (
                  <div
                    style={{
                      position: "relative",
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={PROFILE_IMAGE_SRC}
                      alt="Jasond Delos Santos"
                      fill
                      sizes="28px"
                      style={{
                        borderRadius: "9999px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : null}

                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "85%",
                    padding: "12px 14px",
                    borderRadius: 18,
                    whiteSpace: "pre-wrap",
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg, rgba(90,123,255,0.94), rgba(127,163,255,0.88))"
                        : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "white",
                    lineHeight: 1.65,
                    boxShadow:
                      message.role === "user"
                        ? "0 16px 34px rgba(42,67,141,0.28)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.03)",
                  }}
                  >
                    {message.text}
                  </div>

                  {message.role === "user" ? (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 28,
                        height: 28,
                        flexShrink: 0,
                        borderRadius: "9999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
                        border: "1px solid rgba(255,255,255,0.14)",
                        boxShadow:
                          "0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                          fill="currentColor"
                          fillOpacity="0.92"
                        />
                        <path
                          d="M4 20.5C4 17.4624 7.58172 15 12 15C16.4183 15 20 17.4624 20 20.5C20 20.7761 19.7761 21 19.5 21H4.5C4.22386 21 4 20.7761 4 20.5Z"
                          fill="currentColor"
                          fillOpacity="0.78"
                        />
                      </svg>
                    </div>
                  ) : null}
                </div>
              ))}

            {loading ? (
              <div
                style={{
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={PROFILE_IMAGE_SRC}
                    alt="Jasond Delos Santos"
                    fill
                    sizes="28px"
                    style={{
                      borderRadius: "9999px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    maxWidth: "85%",
                    padding: "12px 14px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "white",
                  }}
                >
                  <span style={{ opacity: 0.75 }}>Thinking...</span>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: "rgba(255,255,255,0.85)",
                      animation: "chatDotPulse 1s ease-in-out infinite",
                      animationDelay: "0s",
                    }}
                  />
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: "rgba(255,255,255,0.85)",
                      animation: "chatDotPulse 1s ease-in-out infinite",
                      animationDelay: "0.18s",
                    }}
                  />
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: "rgba(255,255,255,0.85)",
                      animation: "chatDotPulse 1s ease-in-out infinite",
                      animationDelay: "0.36s",
                    }}
                  />
                </div>
              </div>
            ) : null}

              {showSuggestedPrompts ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 40,
                    paddingBottom: 28,
                  }}
                >
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    style={{
                      width: "fit-content",
                      maxWidth: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "11px 16px",
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.88)",
                      fontWeight: 400,
                      cursor: "pointer",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            gap: 8,
            flexDirection: "column",
            background: "rgba(16,16,17,0.96)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              className="chat-input-field"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                color: "white",
                outline: "none",
                resize: "none",
                minHeight: 48,
                maxHeight: 132,
                lineHeight: 1.5,
                overflowY: "auto",
              }}
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading}
              style={{
                width: 48,
                height: 48,
                background:
                  "linear-gradient(180deg, rgba(0,132,255,0.98), rgba(0,102,255,0.94))",
                color: "white",
                border: "none",
                borderRadius: 9999,
                cursor: "pointer",
                fontWeight: 400,
                opacity: loading ? 0.7 : 1,
                fontSize: 20,
                boxShadow: "0 12px 26px rgba(0,102,255,0.32)",
              }}
            >
              ➤
            </button>
          </div>

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.5 }}>
            {PORTFOLIO_GUARDRAIL}
          </div>
        </div>

        <button
          type="button"
          aria-label="Resize chat panel from top-left corner"
          className="chat-resize-handle chat-resize-corner"
          onPointerDown={(event) => handleResizeStart("top-left", event)}
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            width: 22,
            height: 22,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.72)",
            cursor: "nwse-resize",
            touchAction: "none",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: 12, lineHeight: 1 }}>⤡</span>
        </button>

        <button
          type="button"
          aria-label="Resize chat panel width"
          className="chat-resize-handle"
          onPointerDown={(event) => handleResizeStart("left", event)}
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            bottom: 0,
            width: 12,
            border: "none",
            background: "transparent",
            cursor: "ew-resize",
            touchAction: "none",
          }}
        />

        <button
          type="button"
          aria-label="Resize chat panel height"
          className="chat-resize-handle"
          onPointerDown={(event) => handleResizeStart("top", event)}
          style={{
            position: "absolute",
            top: 0,
            left: 36,
            right: 0,
            height: 12,
            border: "none",
            background: "transparent",
            cursor: "ns-resize",
            touchAction: "none",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes chatDotPulse {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }

          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        .chat-resize-handle {
          opacity: 0;
          transition:
            opacity 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .chat-panel-shell:hover .chat-resize-handle,
        .chat-panel-shell:focus-within .chat-resize-handle {
          opacity: 1;
        }

        .chat-resize-handle:hover,
        .chat-resize-handle:focus-visible {
          background: rgba(143, 184, 255, 0.08) !important;
          box-shadow: inset 0 0 0 1px rgba(173, 201, 255, 0.16);
          outline: none;
        }

        .chat-resize-corner:hover,
        .chat-resize-corner:focus-visible {
          background: rgba(143, 184, 255, 0.16) !important;
          box-shadow:
            inset 0 0 0 1px rgba(173, 201, 255, 0.18),
            0 0 14px rgba(143, 184, 255, 0.18);
        }

        .chat-input-field {
          font-size: 13px;
          scrollbar-width: thin;
          scrollbar-color: rgba(173, 201, 255, 0.72) rgba(255, 255, 255, 0.04);
        }

        .chat-input-field::-webkit-scrollbar {
          width: 10px;
        }

        .chat-input-field::-webkit-scrollbar-track {
          margin: 8px 0;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.02),
            rgba(255, 255, 255, 0.05)
          );
        }

        .chat-input-field::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(214, 228, 255, 0.95), rgba(106, 136, 214, 0.94))
            padding-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 0 12px rgba(143, 184, 255, 0.2);
        }

        .chat-input-field::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(180deg, rgba(236, 243, 255, 0.98), rgba(130, 162, 236, 0.96))
            padding-box;
        }

        .chat-scroll-area {
          scrollbar-width: thin;
          scrollbar-color: rgba(143, 184, 255, 0.42) rgba(255, 255, 255, 0.04);
        }

        .chat-scroll-area::-webkit-scrollbar {
          width: 10px;
        }

        .chat-scroll-area::-webkit-scrollbar-track {
          margin: 10px 0;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.02),
            rgba(255, 255, 255, 0.05)
          );
        }

        .chat-scroll-area::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(184, 208, 255, 0.9), rgba(93, 122, 196, 0.92))
            padding-box;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 10px rgba(143, 184, 255, 0.18);
        }

        .chat-scroll-area::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(180deg, rgba(214, 228, 255, 0.96), rgba(118, 149, 226, 0.96))
            padding-box;
        }

        @media (max-width: 768px) {
          .chat-input-field {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}
