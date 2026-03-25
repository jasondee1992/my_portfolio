"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };
const MAX_HISTORY_MESSAGES = 12;

const PORTFOLIO_GUARDRAIL =
  "Ask me about my projects, skills, experience, background, and portfolio.";

const FALLBACK_MESSAGE =
  "I don’t have enough verified information about that in my current portfolio data, but I’d be happy to talk about my projects, skills, experience, and background.";

const PROFILE_IMAGE_SRC = "/images/profile/profile.jpeg";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi — I’m Jasond Delos Santos. Feel free to ask about my projects, work, skills, experience, or background.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    function handleOpenChatbot() {
      setOpen(true);
    }

    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => window.removeEventListener("open-chatbot", handleOpenChatbot);
  }, []);

  async function onSend() {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const result = (await response.json()) as { answer?: string };

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: result.answer?.trim() || FALLBACK_MESSAGE,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: FALLBACK_MESSAGE,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 2147483647,
          minWidth: 132,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "14px 18px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(20,28,37,0.92), rgba(10,13,18,0.92))",
          color: "rgba(245,247,250,0.96)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          cursor: "pointer",
          fontWeight: 600,
          letterSpacing: "0.01em",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(143,184,255,0.14)",
            boxShadow: "0 0 0 1px rgba(143,184,255,0.12)",
          }}
        >
          <span style={{ fontSize: 14 }}>💬</span>
        </span>
        Chat
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 84,
            width: "min(420px, calc(100vw - 24px))",
            height: "min(680px, calc(100vh - 120px))",
            background:
              "linear-gradient(180deg, rgba(16,22,29,0.97), rgba(8,10,14,0.98))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 26,
            boxShadow: "0 28px 90px rgba(0,0,0,0.62)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 2147483647,
            backdropFilter: "blur(22px)",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src={PROFILE_IMAGE_SRC}
                  alt="Jasond Delos Santos"
                  fill
                  sizes="48px"
                  style={{
                    borderRadius: "9999px",
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.34)",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <span>Jasond Delos Santos</span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "9999px",
                      background: "#22c55e",
                      boxShadow: "0 0 0 5px rgba(34,197,94,0.12)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, opacity: 0.56, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Portfolio AI
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.05)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: 18,
              overflowY: "auto",
              fontSize: 14,
              color: "white",
              background:
                "radial-gradient(circle at top right, rgba(143,184,255,0.08), transparent 30%)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  gap: 10,
                  alignItems: "flex-end",
                }}
              >
                {m.role === "assistant" && (
                  <div
                    style={{
                      position: "relative",
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={PROFILE_IMAGE_SRC}
                      alt="Jasond Delos Santos"
                      fill
                      sizes="34px"
                      style={{
                        borderRadius: "9999px",
                        objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "inline-block",
                    maxWidth: "84%",
                    padding: "12px 14px",
                    borderRadius: m.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                    whiteSpace: "pre-wrap",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, rgba(90,123,255,0.94), rgba(127,163,255,0.88))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))",
                    border:
                      m.role === "user"
                        ? "1px solid rgba(156,184,255,0.22)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    lineHeight: 1.6,
                    boxShadow:
                      m.role === "user"
                        ? "0 16px 34px rgba(42,67,141,0.28)"
                        : "0 12px 26px rgba(0,0,0,0.22)",
                  }}
                >
                  {m.text}
                </div>

                {m.role === "user" && (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: "9999px",
                      background:
                        "linear-gradient(135deg, rgba(69,101,189,0.95), rgba(124,162,255,0.9))",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    You
                  </div>
                )}
              </div>
            ))}

            {loading && (
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
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={PROFILE_IMAGE_SRC}
                    alt="Jasond Delos Santos"
                    fill
                    sizes="34px"
                    style={{
                      borderRadius: "9999px",
                      objectFit: "cover",
                      border: "1px solid rgba(255,255,255,0.12)",
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
                    borderRadius: "20px 20px 20px 6px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))",
                    border: "1px solid rgba(255,255,255,0.08)",
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
            )}
            <div ref={endRef} />
          </div>

          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 10,
              flexDirection: "column",
              background:
                "linear-gradient(180deg, rgba(10,13,18,0.82), rgba(7,9,13,0.94))",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
                placeholder="Ask about Jasond..."
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  outline: "none",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              />

              <button
                onClick={onSend}
                disabled={loading}
                style={{
                  minWidth: 84,
                  background:
                    "linear-gradient(135deg, rgba(141,180,255,0.95), rgba(191,210,255,0.86))",
                  color: "#071019",
                  border: "none",
                  borderRadius: 16,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 14px 30px rgba(53,89,168,0.28)",
                }}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>
              {PORTFOLIO_GUARDRAIL}
            </div>
          </div>
        </div>
      )}

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

        @media (max-width: 640px) {
          button[aria-expanded] {
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
