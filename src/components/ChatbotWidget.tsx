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

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(INITIAL_CHAT_MESSAGES);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    function handleOpenChatbot() {
      setOpen(true);
    }

    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => {
      window.removeEventListener("open-chatbot", handleOpenChatbot);
    };
  }, []);

  if (isAdminRoute) {
    return null;
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

      {open ? <ChatbotPanel onClose={() => setOpen(false)} messages={messages} setMessages={setMessages} /> : null}
    </>
  );
}
