"use client";

export function openChatbot(
  prompt?: string,
  options?: {
    resetConversation?: boolean;
  }
) {
  window.dispatchEvent(
    new CustomEvent("open-chatbot", {
      detail:
        prompt || options?.resetConversation
          ? {
              ...(prompt ? { prompt } : {}),
              ...(options?.resetConversation ? { resetConversation: true } : {}),
            }
          : undefined,
    })
  );
}
