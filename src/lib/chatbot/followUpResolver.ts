import type { ChatHistoryMessage } from "@/lib/chatbot/prompting";
import { getIntentExamples } from "@/lib/chatbot/intentDataset";
import { analyzeQuestionScope } from "@/lib/chatbot/questionScope";

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
  "sige please",
  "go ahead",
  "go on",
  "continue",
  "please continue",
  "tell more",
  "please tell more",
  "tell me more",
  "can you tell me more",
  "can you expand on that",
  "expand on that",
  "elaborate",
  "please do",
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
  ...getIntentExamples("reject_previous_offer"),
].map((item) => item.toLowerCase());

const CLOSING_PATTERNS = [
  "that s all",
  "thats all",
  "that will be all",
  "nothing else",
  "no i m good",
  "no im good",
  "i m good",
  "im good",
  "all good",
  "we re good",
  "were good",
  "no more questions",
  "thank you that s all",
  "thanks that s all",
  "nothing that s all thank you",
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

const LEADING_ACK_OR_GRATITUDE_PREFIXES = [
  "okay",
  "ok",
  "thanks",
  "thank you",
  "thank u",
  "salamat",
  "got it",
  "noted",
  "alright",
  "sure",
  "sounds good",
].map((item) => item.toLowerCase());

function normalizeText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesAny(text: string, patterns: string[]) {
  const normalizedText = normalizeText(text);

  return patterns.some((pattern) => normalizedText.includes(` ${pattern} `));
}

function isExplicitAcceptanceMessage(message: string) {
  return includesAny(message, ACCEPT_PATTERNS);
}

function isConversationClosingMessage(message: string) {
  return includesAny(message, CLOSING_PATTERNS);
}

function stripLeadingAckOrGratitude(text: string) {
  let current = text.trim();
  let changed = true;

  while (changed && current) {
    changed = false;

    for (const prefix of LEADING_ACK_OR_GRATITUDE_PREFIXES) {
      const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:[\\s,!.:;-]+|$)`, "i");

      if (!pattern.test(current)) {
        continue;
      }

      current = current.replace(pattern, "").trim();
      changed = true;
    }
  }

  return current;
}

function hasExplicitNewScopedTopic(message: string) {
  const candidate = stripLeadingAckOrGratitude(message);
  const scoped = analyzeQuestionScope(candidate);

  return (
    candidate.length > 0 &&
    scoped.scope !== "outside" &&
    (isExplicitAcceptanceMessage(candidate) || candidate.includes("?"))
  );
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

function getLastAnsweredUserMessage(history: ChatHistoryMessage[]) {
  for (let index = history.length - 1; index >= 1; index -= 1) {
    const item = history[index];
    const previousItem = history[index - 1];

    if (item.role === "assistant" && previousItem.role === "user") {
      return previousItem.content;
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

function isFallbackStyleAnswer(message: string) {
  const normalized = normalizeText(message);
  const fallbackSignals = [
    "outside the scope",
    "outside the topics",
    "outside the knowledge",
    "i don t have enough confirmed",
    "i can t answer that precisely",
    "wala pa akong sapat",
    "hindi ko masasagot nang eksakto",
  ];

  return fallbackSignals.some((signal) => normalized.includes(` ${signal} `));
}

export function resolveShortFollowUp(
  message: string,
  history: ChatHistoryMessage[]
): FollowUpResolution {
  if (history.length === 0) {
    return null;
  }

  const lowered = message.toLowerCase().trim();
  const continuationCandidate = stripLeadingAckOrGratitude(message);
  const previousAssistantMessage = getLastAssistantMessage(history);
  const previousUserMessage = getLastAnsweredUserMessage(history);

  if (
    isConversationClosingMessage(lowered) ||
    (continuationCandidate && isConversationClosingMessage(continuationCandidate))
  ) {
    return {
      type: "reject_previous_offer",
      answer: "You're welcome.",
    };
  }

  if (!previousAssistantMessage) {
    return null;
  }

  if (
    (isExplicitAcceptanceMessage(lowered) || isExplicitAcceptanceMessage(continuationCandidate)) &&
    hasExplicitNewScopedTopic(message)
  ) {
    return null;
  }

  if (isOfferMessage(previousAssistantMessage)) {
    if (includesAny(lowered, REJECT_PATTERNS)) {
      return {
        type: "reject_previous_offer",
        answer: "No problem. If you want to continue later, just let me know.",
      };
    }

    if (
      !isExplicitAcceptanceMessage(lowered) &&
      !isExplicitAcceptanceMessage(continuationCandidate)
    ) {
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

  if (
    (!isExplicitAcceptanceMessage(lowered) &&
      !isExplicitAcceptanceMessage(continuationCandidate)) ||
    !previousUserMessage
  ) {
    return null;
  }

  const previousQuestionScope = analyzeQuestionScope(previousUserMessage);
  const hasMeaningfulPortfolioContext =
    previousQuestionScope.scope !== "outside" &&
    previousAssistantMessage.trim().length >= 40 &&
    !isFallbackStyleAnswer(previousAssistantMessage);

  if (!hasMeaningfulPortfolioContext) {
    return null;
  }

  const offeredTopic = previousQuestionScope.coreTopic;
  const resolvedMessage = `Please continue your previous answer to this topic: "${previousUserMessage}". Add more relevant detail and keep it grounded in the same portfolio context.`;

  return {
    type: "accept_previous_offer",
    offeredTopic,
    resolvedMessage,
  };
}
