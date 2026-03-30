"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
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
type PanelVariant = "default" | "terminal";
type PanelAnchor = "left" | "right";

const MAX_HISTORY_MESSAGES = 12;
const DEFAULT_PANEL_WIDTH = 360;
const DEFAULT_PANEL_HEIGHT = 560;
const MIN_PANEL_WIDTH = 320;
const MIN_PANEL_HEIGHT = 420;
const MOBILE_BREAKPOINT = 640;
const MOBILE_MIN_PANEL_WIDTH = 280;
const MOBILE_MIN_PANEL_HEIGHT = 340;
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

function getDefaultPanelSizeForViewport(variant: PanelVariant) {
  if (typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
    return {
      width: variant === "terminal" ? 360 : DEFAULT_PANEL_WIDTH,
      height: variant === "terminal" ? 500 : 500,
    };
  }

  return {
    width: variant === "terminal" ? 520 : DEFAULT_PANEL_WIDTH,
    height: variant === "terminal" ? 620 : DEFAULT_PANEL_HEIGHT,
  };
}

export default function ChatbotPanel({
  onClose,
  messages,
  setMessages,
  pendingPrompt,
  onPendingPromptConsumed,
  variant = "default",
  anchor = "right",
  resizable = true,
}: {
  onClose: () => void;
  messages: Msg[];
  setMessages: Dispatch<SetStateAction<Msg[]>>;
  pendingPrompt?: string | null;
  onPendingPromptConsumed?: () => void;
  variant?: PanelVariant;
  anchor?: PanelAnchor;
  resizable?: boolean;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [panelSize, setPanelSize] = useState<PanelSize>({
    width: variant === "terminal" ? 520 : DEFAULT_PANEL_WIDTH,
    height: variant === "terminal" ? 620 : DEFAULT_PANEL_HEIGHT,
  });
  const [isResizing, setIsResizing] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const lastAutoSentPromptRef = useRef<string | null>(null);
  const sendPendingPrompt = useEffectEvent((prompt: string) => {
    void sendMessage(prompt);
  });

  function clampPanelSize(width: number, height: number) {
    if (typeof window === "undefined") {
      return {
        width: Math.max(width, MIN_PANEL_WIDTH),
        height: Math.max(height, MIN_PANEL_HEIGHT),
      };
    }

    const minWidth = window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_MIN_PANEL_WIDTH : MIN_PANEL_WIDTH;
    const minHeight = window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_MIN_PANEL_HEIGHT : MIN_PANEL_HEIGHT;

    return {
      width: Math.min(
        Math.max(width, minWidth),
        Math.max(minWidth, window.innerWidth - 24)
      ),
      height: Math.min(
        Math.max(height, minHeight),
        Math.max(minHeight, window.innerHeight - 120)
      ),
    };
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const defaults = getDefaultPanelSizeForViewport(variant);
    setPanelSize(clampPanelSize(defaults.width, defaults.height));
  }, [variant]);

  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [input]);

  useEffect(() => {
    if (!resizable || !isResizing) {
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
  }, [isResizing, resizable]);

  useEffect(() => {
    function syncPanelSizeToViewport() {
      setPanelSize((current) => {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
          const defaults = getDefaultPanelSizeForViewport(variant);
          return clampPanelSize(defaults.width, defaults.height);
        }

        return clampPanelSize(current.width, current.height);
      });
    }

    window.addEventListener("resize", syncPanelSizeToViewport);
    return () => {
      window.removeEventListener("resize", syncPanelSizeToViewport);
    };
  }, [variant]);

  useEffect(() => {
    if (!pendingPrompt) {
      lastAutoSentPromptRef.current = null;
      return;
    }

    if (lastAutoSentPromptRef.current === pendingPrompt) {
      return;
    }

    lastAutoSentPromptRef.current = pendingPrompt;
    onPendingPromptConsumed?.();
    sendPendingPrompt(pendingPrompt);
  }, [onPendingPromptConsumed, pendingPrompt]);

  function handleResizeStart(direction: ResizeDirection, event: ReactPointerEvent<HTMLButtonElement>) {
    if (!resizable) {
      return;
    }

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
    if (!q || loading) {
      return;
    }

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
  const isTerminal = variant === "terminal";
  const isMobileViewport = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
  const panelPosition = anchor === "left" ? { left: 20 } : { right: 20 };
  const panelBottom = isTerminal ? 20 : 84;
  const terminalBackground = "#090909";
  const terminalHeader = "#161616";
  const terminalPrompt = "#33d17a";

  return (
    <>
      <div
        className={`chat-panel-shell ${isTerminal ? "ubuntu-terminal-panel" : ""}`}
        style={{
          position: "fixed",
          ...panelPosition,
          bottom: panelBottom,
          width: `min(${panelSize.width}px, calc(100vw - 24px))`,
          height: `min(${panelSize.height}px, calc(100vh - 120px))`,
          background: isTerminal ? terminalBackground : "rgba(12,12,13,0.98)",
          border: isTerminal ? "1px solid rgba(0,0,0,0.64)" : "1px solid rgba(255,255,255,0.12)",
          borderRadius: isTerminal ? 14 : 26,
          boxShadow: isTerminal
            ? "0 28px 90px rgba(0,0,0,0.56)"
            : "0 28px 90px rgba(0,0,0,0.62)",
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
            background: isTerminal
              ? terminalHeader
              : "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isTerminal ? (
              <div style={{ fontFamily: "var(--font-ubuntu), monospace", fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                jasond@portfolio: ~
              </div>
            ) : (
              <div style={{ position: "relative", width: 28, height: 28 }}>
                <Image
                  src={PROFILE_IMAGE_SRC}
                  alt="Jasond Delos Santos"
                  fill
                  sizes="28px"
                  style={{ borderRadius: "9999px", objectFit: "cover" }}
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 400,
                fontSize: 14,
              }}
            >
              <span>{isTerminal ? "" : "Jasond Delos Santos"}</span>
              {isTerminal ? null : (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "9999px",
                    background: "#22c55e",
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isTerminal ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Minimize chat terminal"
                  className="terminal-window-control"
                >
                  -
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                color: "white",
                border: isTerminal ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                cursor: "pointer",
                fontSize: isTerminal ? 13 : 18,
                lineHeight: 1,
                opacity: isTerminal ? 0.82 : 1,
              }}
              className={isTerminal ? "terminal-window-control" : undefined}
            >
              {isTerminal ? "×" : "×"}
            </button>
          </div>
        </div>

        {isTerminal ? (
          <div style={{ height: 2, background: "#e95420", opacity: 0.94 }} aria-hidden="true" />
        ) : null}

        <div
          className="chat-scroll-area"
          style={{
            position: "relative",
            flex: 1,
            padding: isTerminal ? 18 : 16,
            overflowY: "auto",
            fontSize: 14,
            color: "white",
            background: isTerminal ? terminalBackground : undefined,
          }}
        >
          <div
            style={{
              position: "relative",
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
                  justifyContent: "flex-start",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                {isTerminal ? null : message.role === "assistant" ? (
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
                      style={{ borderRadius: "9999px", objectFit: "cover" }}
                    />
                  </div>
                ) : null}

                <div style={{ display: "inline-block", maxWidth: isTerminal ? "100%" : "85%" }}>
                  {isTerminal ? (
                    <div style={{ fontFamily: "var(--font-ubuntu), monospace", lineHeight: 1.7 }}>
                      {message.role === "user" ? (
                        <div style={{ color: "rgba(255,247,242,0.96)", whiteSpace: "pre-wrap" }}>
                          <span style={{ color: terminalPrompt }}>visitor@desktop:~</span> {message.text}
                        </div>
                      ) : (
                        <div style={{ color: "rgba(255,245,240,0.94)", whiteSpace: "pre-wrap" }}>
                          <span style={{ color: terminalPrompt }}>jasond@portfolio:~</span> {message.text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
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
                  )}
                </div>
              </div>
            ))}

            {loading ? (
              <div
                style={{
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                {isTerminal ? null : (
                  <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                    <Image
                      src={PROFILE_IMAGE_SRC}
                      alt="Jasond Delos Santos"
                      fill
                      sizes="28px"
                      style={{ borderRadius: "9999px", objectFit: "cover" }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    maxWidth: isTerminal ? "100%" : "85%",
                    padding: isTerminal ? "0" : "12px 14px",
                    borderRadius: 18,
                    background: isTerminal ? "transparent" : "rgba(255,255,255,0.06)",
                    border: isTerminal ? "none" : "1px solid rgba(255,255,255,0.10)",
                    color: "white",
                    fontFamily: isTerminal ? "var(--font-ubuntu), monospace" : undefined,
                  }}
                >
                    {isTerminal ? (
                      <span>
                        <span style={{ color: terminalPrompt }}>jasond@portfolio:~</span>{" "}
                        <span style={{ opacity: 0.82 }}>thinking...</span>
                      </span>
                    ) : (
                    <span style={{ opacity: 0.75 }}>Thinking...</span>
                  )}
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
                  alignItems: isTerminal ? "stretch" : "center",
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
                      width: isTerminal ? "100%" : "fit-content",
                      maxWidth: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: isTerminal ? "space-between" : "center",
                      padding: isTerminal ? "10px 12px" : "11px 16px",
                      borderRadius: isTerminal ? 8 : 9999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: isTerminal ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.88)",
                      fontWeight: 400,
                      cursor: "pointer",
                      fontFamily: isTerminal ? "var(--font-ubuntu), monospace" : undefined,
                    }}
                  >
                    <span>{prompt}</span>
                    {isTerminal ? <span style={{ color: terminalPrompt }}>$</span> : null}
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
            background: isTerminal ? terminalBackground : "rgba(16,16,17,0.96)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {isTerminal ? (
              <label
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  padding: "10px 0 2px",
                  fontFamily: "var(--font-ubuntu), monospace",
                  color: "rgba(255,247,242,0.96)",
                  minWidth: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    marginRight: 10,
                    color: terminalPrompt,
                    fontSize: isMobileViewport ? 12 : 13,
                    whiteSpace: "nowrap",
                    opacity: 0.95,
                  }}
                >
                  {isMobileViewport ? ">" : "visitor@desktop:~$"}
                </span>
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
                  aria-label="Chat message input"
                  placeholder="Type your message here..."
                  style={{
                    flex: 1,
                    padding: "0",
                    borderRadius: 0,
                    border: "none",
                    background: "transparent",
                    color: "white",
                    outline: "none",
                    resize: "none",
                    minHeight: 28,
                    maxHeight: 132,
                    lineHeight: 1.7,
                    overflowY: "auto",
                    fontFamily: "var(--font-ubuntu), monospace",
                    fontSize: isMobileViewport ? 14 : 13,
                    fontWeight: 400,
                  }}
                />
              </label>
            ) : (
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
                aria-label="Chat message input"
                placeholder="Type your message here..."
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
            )}

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading}
              style={{
                width: isTerminal ? (isMobileViewport ? 28 : 40) : 48,
                height: isTerminal ? 40 : 48,
                background: isTerminal
                  ? isMobileViewport
                    ? "transparent"
                    : "rgba(255,255,255,0.08)"
                  : "linear-gradient(180deg, rgba(0,132,255,0.98), rgba(0,102,255,0.94))",
                color: "white",
                border: isTerminal ? (isMobileViewport ? "none" : "1px solid rgba(255,255,255,0.1)") : "none",
                borderRadius: isTerminal ? (isMobileViewport ? 0 : 8) : 9999,
                cursor: "pointer",
                flexShrink: 0,
                fontWeight: 400,
                opacity: loading ? 0.7 : 1,
                fontSize: isTerminal ? 0 : 20,
                fontFamily: isTerminal ? "var(--font-ubuntu), monospace" : undefined,
                boxShadow: isTerminal
                  ? "none"
                  : "0 12px 26px rgba(0,102,255,0.32)",
              }}
            >
              {isTerminal ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`mx-auto ${isMobileViewport ? "h-4 w-4" : "h-[18px] w-[18px]"}`}
                  aria-hidden="true"
                >
                  <path
                    d="M5 4.75 18.5 12 5 19.25l2.15-6.2L5 4.75Z"
                    stroke="currentColor"
                    strokeWidth={isMobileViewport ? 1.5 : 1.8}
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                "➤"
              )}
            </button>
          </div>

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.5 }}>
            {PORTFOLIO_GUARDRAIL}
          </div>
        </div>

        {resizable ? (
          <>
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
          </>
        ) : null}
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
          scrollbar-color: rgba(110, 114, 122, 0.72) rgba(10, 11, 14, 0.94);
        }

        .terminal-window-control {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.45rem;
          height: 1.45rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.38rem;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
          font-family: var(--font-ubuntu), monospace;
          font-size: 0.8rem;
          line-height: 1;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
        }

        .terminal-window-control:hover,
        .terminal-window-control:focus-visible {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.94);
          outline: none;
        }

        .chat-input-field::-webkit-scrollbar {
          width: 10px;
        }

        .chat-input-field::-webkit-scrollbar-track {
          margin: 8px 0;
          border-radius: 999px;
          background: rgba(10, 11, 14, 0.94);
        }

        .chat-input-field::-webkit-scrollbar-thumb {
          border: 2px solid rgba(10, 11, 14, 0.94);
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(118, 121, 128, 0.92), rgba(82, 86, 93, 0.92));
        }

        .chat-input-field::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(138, 142, 150, 0.96), rgba(96, 100, 108, 0.96));
        }

        .chat-scroll-area {
          scrollbar-width: thin;
          scrollbar-color: rgba(110, 114, 122, 0.72) rgba(10, 11, 14, 0.94);
        }

        .chat-scroll-area::-webkit-scrollbar {
          width: 10px;
        }

        .chat-scroll-area::-webkit-scrollbar-track {
          margin: 10px 0;
          border-radius: 999px;
          background: rgba(10, 11, 14, 0.94);
        }

        .chat-scroll-area::-webkit-scrollbar-thumb {
          border: 2px solid rgba(10, 11, 14, 0.94);
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(118, 121, 128, 0.92), rgba(82, 86, 93, 0.92));
        }

        .chat-scroll-area::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(138, 142, 150, 0.96), rgba(96, 100, 108, 0.96));
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
