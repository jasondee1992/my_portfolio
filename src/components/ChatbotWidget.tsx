"use client";

import { useEffect, useRef, useState } from "react";
import data from "@/data/portfolio.json";

type Msg = { role: "user" | "assistant"; text: string };

const PORTFOLIO_GUARDRAIL =
  "I can only answer questions about JasonD’s portfolio (projects, skills, experience, achievements).";

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

    const lower = q.toLowerCase();

    const keywords =
      (data.skills as string[]).some((s) => lower.includes(s.toLowerCase())) ||
      (data.projects as Array<{ name: string }>).some((p) =>
        lower.includes(p.name.toLowerCase())
      ) ||
      lower.includes("project") ||
      lower.includes("dash") ||
      lower.includes("snowflake") ||
      lower.includes("automation") ||
      lower.includes("achievement") ||
      lower.includes("experience") ||
      lower.includes("skill") ||
      lower.includes("ai");

    await new Promise((r) => setTimeout(r, 300));

    if (!keywords) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `${PORTFOLIO_GUARDRAIL}\n\nTry asking: List your AI projects.`,
        },
      ]);
      setLoading(false);
      return;
    }

    const topProjects = (data.projects as Array<{ name: string; description: string }>)
      .slice(0, 3)
      .map((p) => `• ${p.name} — ${p.description}`)
      .join("\n");

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text:
          `Here’s what I can share from JasonD’s portfolio:\n\n` +
          `Top projects:\n${topProjects}\n\n` +
          `Skills: ${(data.skills as string[]).join(", ")}`,
      },
    ]);

    setLoading(false);
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
              <div style={{ fontSize: 12, opacity: 0.6 }}>Portfolio-only assistant</div>
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
    </>
  );
}
