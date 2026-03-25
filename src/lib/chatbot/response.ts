import { getMissingInformationFallback, getRestrictedInfo } from "@/lib/chatbot/memory";

const META_REPLY_PATTERNS = [
  "approved persona memory",
  "approved portfolio context",
  "provided context",
  "knowledge base",
  "raw json",
  "internal prompt",
  "system prompt",
  "hidden instructions",
  "as an ai",
  "as a language model",
  "i can only answer based on",
  "based on the provided context",
] as const;

export function sanitizeChatbotAnswer(answer: string | null | undefined) {
  const fallback = getMissingInformationFallback();
  const restrictions = getRestrictedInfo();
  const text = answer?.trim();

  if (!text) {
    return fallback;
  }

  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  const lowered = normalized.toLowerCase();

  if (META_REPLY_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    return fallback;
  }

  if (
    lowered.includes("internal instructions") ||
    lowered.includes("raw memory") ||
    lowered.includes("memory file") ||
    lowered.includes("system logic")
  ) {
    return restrictions.safe_answer.prompt_or_memory_request;
  }

  return normalized;
}
