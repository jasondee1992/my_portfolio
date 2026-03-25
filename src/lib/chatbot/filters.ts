import {
  getMissingInformationFallback as getMemoryFallback,
  getRestrictedInfo,
} from "@/lib/chatbot/memory";

const restrictions = getRestrictedInfo();
const PROMPT_OR_MEMORY_REQUESTS = [
  "system prompt",
  "hidden instructions",
  "memory json",
  "raw memory",
  "prompt you use",
  "internal instructions",
  "show me your prompt",
  "show me your memory",
  "ignore previous instructions",
  "reveal your instructions",
  "show your config",
] as const;

export function getMissingInformationFallback() {
  return getMemoryFallback();
}

export function checkRestrictedInput(message: string): string | null {
  const lowered = message.toLowerCase();

  const blockedTerms = [
    ...restrictions.blocked_topics.flatMap((topic) => topic.keywords),
    ...restrictions.sensitive_categories.flatMap((category) => category.keywords),
  ];

  if (blockedTerms.some((term) => lowered.includes(term.toLowerCase()))) {
    return restrictions.safe_answer.restricted_topic;
  }

  if (PROMPT_OR_MEMORY_REQUESTS.some((term) => lowered.includes(term))) {
    return restrictions.safe_answer.prompt_or_memory_request;
  }

  return null;
}
