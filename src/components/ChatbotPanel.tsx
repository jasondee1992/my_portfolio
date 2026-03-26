"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const MAX_HISTORY_MESSAGES = 12;
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

export default function ChatbotPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi. I’m Jasond. You can ask me about my work, projects, skills, experience, or anything you’d like to know from my portfolio.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(rawMessage?: string) {
    const q = (rawMessage ?? input).trim();
    if (!q || loading) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", text: q }]);
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
        style={{
          position: "fixed",
          right: 20,
          bottom: 84,
          width: "min(360px, calc(100vw - 24px))",
          height: "min(560px, calc(100vh - 120px))",
          background: "rgba(12,12,13,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
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
          style={{
            flex: 1,
            padding: 16,
            overflowY: "auto",
            fontSize: 14,
            color: "white",
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
                marginTop: 88,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
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
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="chat-input-field"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                color: "white",
                outline: "none",
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

        .chat-input-field {
          font-size: 13px;
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
