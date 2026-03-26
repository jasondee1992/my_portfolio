import type { ChatHistoryMessage } from "@/lib/chatbot/prompting";
import { getIntentExamples } from "@/lib/chatbot/intentDataset";

type FollowUpResolution =
  | {
      type: "accept_previous_offer";
      offeredTopic: string;
      resolvedMessage: string;
    }
  | {
      type: "reject_previous_offer";
      answer: string;
    }
  | null;

const ACCEPT_PATTERNS = [
  "yes",
  "yes please",
  "sure",
  "okay",
  "go",
  "go ahead",
  "please do",
  "continue",
  "tell me more",
  "tell me",
  "kwento mo",
  "sige",
  "sige please",
  "sure go ahead",
  "more please",
  ...getIntentExamples("accept_previous_offer"),
].map((item) => item.toLowerCase());

const REJECT_PATTERNS = [
  "not now",
  "not yet",
  "no thanks",
  "maybe later",
  "later",
  "wag muna",
  "huwag muna",
  "pass",
].map((item) => item.toLowerCase());

const OFFER_PATTERNS = [
  "if you want",
  "i can",
  "i can continue",
  "would you like me to",
  "would you like to hear more about",
  "do you want me to",
  "do you want to hear more about",
  "pwede kitang",
  "pwede mo akong tanungin tungkol sa",
  "pwede rin kitang",
  "pwede rin akong",
  "gusto mo bang",
  "i can also",
  "you can ask me about",
  "feel free to ask about",
  "happy to chat about",
  "i can walk you through",
  "i can explain",
  "i can tell you more about",
  "do you want me to continue",
].map((item) => item.toLowerCase());

const OFFER_TOPIC_HINTS = [
  "projects",
  "project",
  "experience",
  "skills",
  "skill",
  "background",
  "tech stack",
  "career journey",
  "work",
  "portfolio",
].map((item) => item.toLowerCase());

function normalizeText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function includesAny(text: string, patterns: string[]) {
  const normalizedText = normalizeText(text);

  return patterns.some((pattern) => normalizedText.includes(` ${pattern} `));
}

function isShortAcceptanceMessage(message: string) {
  const normalizedText = normalizeText(message);
  const words = normalizedText.trim().split(/\s+/).filter(Boolean);
  const shortAffirmationSignals = ["yes", "sure", "okay", "sige", "go", "continue", "tell", "please"];

  if (includesAny(message, ACCEPT_PATTERNS)) {
    return true;
  }

  return words.length > 0 && words.length <= 3 && words.some((word) => shortAffirmationSignals.includes(word));
}

function isOfferMessage(message: string) {
  if (includesAny(message, OFFER_PATTERNS)) {
    return true;
  }

  return message.includes("?") && includesAny(message, OFFER_TOPIC_HINTS);
}

function getLastAssistantMessage(history: ChatHistoryMessage[]) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];

    if (item.role === "assistant") {
      return item.content;
    }
  }

  return "";
}

function extractOfferedTopic(message: string) {
  const trimmed = message.trim();
  const patterns = [
    /(?:about|tungkol sa|tanungin tungkol sa|kwentuhan tungkol sa|overview ng|overview of|walk you through|tell you more about|continue with|explain|chat about|ask me about)\s+([^.?!=]+)/i,
    /(?:projects?|background|experience|skills?|tech stack|career journey)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (!match) {
      continue;
    }

    if (match[1]) {
      return match[1].trim();
    }

    return match[0].trim();
  }

  return "";
}

export function resolveShortFollowUp(
  message: string,
  history: ChatHistoryMessage[]
): FollowUpResolution {
  if (history.length === 0) {
    return null;
  }

  const lowered = message.toLowerCase().trim();
  const previousAssistantMessage = getLastAssistantMessage(history);

  if (!previousAssistantMessage || !isOfferMessage(previousAssistantMessage)) {
    return null;
  }

  if (includesAny(lowered, REJECT_PATTERNS)) {
    return {
      type: "reject_previous_offer",
      answer: "No problem. If you want to continue later, just let me know.",
    };
  }

  if (!isShortAcceptanceMessage(lowered)) {
    return null;
  }

  const offeredTopic = extractOfferedTopic(previousAssistantMessage);
  const resolvedMessage = offeredTopic
    ? `Tell me more about ${offeredTopic}. Please give the actual explanation now.`
    : "Please continue with what you just offered and give the actual content now.";

  return {
    type: "accept_previous_offer",
    offeredTopic,
    resolvedMessage,
  };
}
