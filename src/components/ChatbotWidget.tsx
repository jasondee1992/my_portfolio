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
        "Hi! I’m JasonD’s portfolio assistant. Ask me about projects, skills, experience, or achievements.\n\nExample: “What projects did you build with Dash?”",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function onSend() {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    // TEMP: local "fake" response (next step: call API)
    const lower = q.toLowerCase();

    const keywords =
      (data.skills as string[]).some((s) => lower.includes(s.toLowerCase())) ||
      (data.projects as any[]).some((p) => lower.includes(String(p.name).toLowerCase())) ||
      lower.includes("project") ||
      lower.includes("dash") ||
      lower.includes("snowflake") ||
      lower.includes("automation") ||
      lower.includes("cert") ||
      lower.includes("achievement") ||
      lower.includes("experience") ||
      lower.includes("skill") ||
      lower.includes("ai");

    await new Promise((r) => setTimeout(r, 250));

    if (!keywords) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `${PORTFOLIO_GUARDRAIL}\n\nTry asking: “List your AI projects.”`,
        },
      ]);
      setLoading(false);
      return;
    }

    const topProjects = (data.projects as any[])
      .slice(0, 3)
      .map((p) => `• ${p.name} — ${p.description}`)
      .join("\n");

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text:
          `Here’s what I can share from JasonD’s portfolio data:\n\n` +
          `Top projects:\n${topProjects}\n\n` +
          `Skills: ${(data.skills as string[]).join(", ")}\n`,
      },
    ]);

    setLoading(false);
  }

  return (
    <>
      {/* Debug label (remove later) */}
      <div className="fixed top-2 left-2 z-[9999] text-white/80 text-xs">
        CHATBOT WIDGET LOADED
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 2147483647,
          background: "#2563eb",
          color: "#fff",
          padding: "14px 16px",
          borderRadius: 9999,
          border: "none",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          cursor: "pointer",
        }}
      >
        💬 Chat
      </button>

      {/* Overlay + modal */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute bottom-6 right-6 w-[92vw] max-w-md panel"
            style={{ overflow: "hidden" }}
          >
            <div className="panel-inner flex items-center justify-between">
              <div>
                <div className="text-sm text-white/80 font-semibold">JasonD Assistant</div>
                <div className="text-xs text-white/50">Portfolio-only • RAG-ready</div>
              </div>
              <button onClick={() => setOpen(false)} className="chip hover-lift">
                Close ✕
              </button>
            </div>

            <div
              className="px-5 md:px-8 pb-5 md:pb-8"
              style={{ maxHeight: "52vh", overflowY: "auto" }}
            >
              <div className="grid gap-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "92%",
                    }}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      style={{
                        background:
                          m.role === "user"
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(255,255,255,0.06)",
                        border:
                          m.role === "user"
                            ? "1px solid rgba(34,197,94,0.25)"
                            : "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.86)",
                        borderRadius: 18,
                        padding: "10px 12px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            <div
              className="px-5 md:px-8 pb-5 md:pb-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend();
                  }}
                  placeholder="Ask about projects, skills, experience..."
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.86)",
                  }}
                />

                <button
                  onClick={onSend}
                  disabled={loading}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    color: "rgba(0,0,0,0.92)",
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>

              <div className="mt-2 text-xs text-white/45">{PORTFOLIO_GUARDRAIL}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}