import type { ChatHistoryMessage } from "@/lib/chatbot/prompting";

const FOLLOW_UP_PATTERNS = [
  " dun ",
  " doon ",
  " there ",
  " that ",
  " that one ",
  " it ",
  " role mo ",
  " company mo ",
  " current company ",
  " current role ",
  " years ka na ",
  " years kana ",
  " ilan years ",
  " ilang years ",
  " ilang taon ",
  " tech stack did you use there ",
  " anong role mo ",
  " saan ka nag wowork ngayon ",
  " saan ka nagwowork ngayon ",
  " open ka ba ",
  " what tech stack ",
  " what about that ",
  " how many years ",
  " how long ",
] as const;

function normalizeText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function isLikelyFollowUpMessage(message: string) {
  const normalized = normalizeText(message);
  const wordCount = normalized.trim().split(/\s+/).filter(Boolean).length;

  return (
    wordCount <= 7 ||
    FOLLOW_UP_PATTERNS.some((pattern) => normalized.includes(pattern))
  );
}

export function buildContextualMessage(
  message: string,
  history: ChatHistoryMessage[],
  maxMessages = 4
) {
  if (history.length === 0 || !isLikelyFollowUpMessage(message)) {
    return message;
  }

  const recentContext = history
    .slice(-maxMessages)
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");

  return `${message}\n\nRecent conversation context:\n${recentContext}`;
}

export function buildConversationFocus(
  history: ChatHistoryMessage[],
  maxMessages = 4
) {
  if (history.length === 0) {
    return "No recent conversation context.";
  }

  return history
    .slice(-maxMessages)
    .map((item, index) => `Recent ${index + 1}\nRole: ${item.role}\nContent: ${item.content}`)
    .join("\n\n");
}
