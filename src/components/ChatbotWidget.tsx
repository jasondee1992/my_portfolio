"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const PORTFOLIO_GUARDRAIL =
  "I answer only from JasonD’s portfolio knowledge base.";

const FALLBACK_MESSAGE =
  "I don’t have that information in my current portfolio knowledge base.";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi! I’m JasonD’s portfolio assistant. Ask me about projects, skills, experience, or achievements.\n\nExample: What projects did you build with Dash?",
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
        body: JSON.stringify({ message: q }),
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
            <div>
              <div style={{ fontWeight: 600 }}>JasonD AI</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>Knowledge-based personal AI</div>
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
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
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
              </div>
            ))}
            {loading && (
              <div
                style={{
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
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
                  <span style={{ opacity: 0.75 }}>JasonD AI is thinking</span>
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
