import { getMissingInformationFallback, getRestrictedInfo } from "@/lib/chatbot/memory";

const META_REPLY_PATTERNS = [
  "approved persona memory",
  "approved portfolio context",
  "knowledge base",
  "raw json",
  "internal prompt",
  "system prompt",
  "hidden instructions",
] as const;

function looksLikeMetaAnswerOnly(text: string) {
  const normalized = text.toLowerCase();
  const metaPatternHits = META_REPLY_PATTERNS.filter((pattern) => normalized.includes(pattern)).length;
  const sentenceCount = normalized
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  return metaPatternHits >= 2 || (metaPatternHits >= 1 && sentenceCount <= 2);
}

export function sanitizeChatbotAnswer(answer: string | null | undefined) {
  const fallback = getMissingInformationFallback();
  const restrictions = getRestrictedInfo();
  const text = answer?.trim();

  if (!text) {
    return fallback;
  }

  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  const lowered = normalized.toLowerCase();

  if (looksLikeMetaAnswerOnly(normalized)) {
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
