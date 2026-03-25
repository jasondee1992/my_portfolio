"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

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
          history: messages.slice(-8).map((message) => ({
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
          right: 24,
          bottom: 24,
          zIndex: 2147483647,
          background: "rgba(255,255,255,0.06)",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        💬 Chat
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 90,
            width: 360,
            height: 500,
            background: "#0b0b0c",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 2147483647,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 42, height: 42 }}>
                <Image
                  src={PROFILE_IMAGE_SRC}
                  alt="Jasond Delos Santos"
                  fill
                  sizes="42px"
                  style={{
                    borderRadius: "9999px",
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.14)",
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
                      boxShadow: "0 0 0 4px rgba(34,197,94,0.16)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>Online now</div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
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
              padding: 16,
              overflowY: "auto",
              fontSize: 14,
              color: "white",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent:
                    m.role === "user" ? "flex-end" : "flex-start",
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
                    maxWidth: "85%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    whiteSpace: "pre-wrap",
                    background:
                      m.role === "user" ? "#2563eb" : "rgba(255,255,255,0.06)",
                    color: "white",
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
                        "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(96,165,250,0.9))",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.12)",
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
                  marginBottom: 12,
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
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
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
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 8,
              flexDirection: "column",
              background: "#0b0b0c",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
                placeholder="Ask about JasonD..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#111",
                  color: "white",
                  outline: "none",
                }}
              />

              <button
                onClick={onSend}
                disabled={loading}
                style={{
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
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
      `}</style>
    </>
  );
}
