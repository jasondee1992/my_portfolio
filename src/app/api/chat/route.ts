import OpenAI from "openai";
import { NextResponse } from "next/server";
import { loadKnowledgeBase } from "@/lib/chatbot/loadKnowledge";
import { retrieveKnowledge, type RetrievalMatch } from "@/lib/chatbot/retrieveKnowledge";
import { checkRestrictedInput, getMissingInformationFallback } from "@/lib/chatbot/filters";
import { buildSystemPrompt, buildUserPrompt, type ChatHistoryMessage } from "@/lib/chatbot/prompting";
import { sanitizeChatbotAnswer } from "@/lib/chatbot/response";
import { getSafeIntentResponse } from "@/lib/chatbot/safeIntents";
import { buildContextualMessage, buildConversationFocus } from "@/lib/chatbot/conversationContext";
import { CHATBOT_CONVERSATION_EXAMPLES } from "@/lib/chatbot/conversationExamples";
import { getTenureResponse } from "@/lib/chatbot/tenure";
import { analyzeQuestionScope, buildOutOfScopeFallback } from "@/lib/chatbot/questionScope";
import { resolveShortFollowUp } from "@/lib/chatbot/followUpResolver";
import type { ResponseInput } from "openai/resources/responses/responses";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const CHATBOT_FALLBACK = getMissingInformationFallback();
const MIN_TOP_SCORE = 3;
const MAX_HISTORY_MESSAGES = 12;
const KNOWLEDGE_BASE = loadKnowledgeBase();

function getCurrentPhilippineDateTimeResponse(message: string) {
  const normalized = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const asksForTime =
    normalized.includes("current time") ||
    normalized.includes("time now") ||
    normalized.includes("what time") ||
    normalized.includes("anong oras") ||
    normalized.includes("oras ngayon") ||
    normalized.includes("time in the philippines") ||
    normalized.includes("time in philippines");
  const asksForDate =
    normalized.includes("current date") ||
    normalized.includes("today s date") ||
    normalized.includes("todays date") ||
    normalized.includes("what date") ||
    normalized.includes("date today") ||
    normalized.includes("petsa ngayon") ||
    normalized.includes("anong petsa");

  if (!asksForTime && !asksForDate) {
    return null;
  }

  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeZone: "Asia/Manila",
  }).format(now);
  const formattedTime = new Intl.DateTimeFormat("en-PH", {
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(now);

  if (asksForTime && asksForDate) {
    return `Sa Philippines, ngayon ay ${formattedDate} at ${formattedTime}.`;
  }

  if (asksForDate) {
    return `Sa Philippines, ang date ngayon ay ${formattedDate}.`;
  }

  return `Sa Philippines, ang current time ngayon ay ${formattedTime}.`;
}

function isShortAmbiguousFollowUp(message: string) {
  const normalized = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const words = normalized ? normalized.split(/\s+/) : [];
  const wordCount = words.length;
  const followUpSignals = [
    "it",
    "that",
    "there",
    "dun",
    "doon",
    "dito",
    "role",
    "company",
    "years",
    "taon",
    "stack",
    "dun",
  ];
  const questionLeadIns = ["what", "how", "why", "can", "could", "would", "ano", "anong", "paano"];
  const hasFollowUpSignal = words.some((word) => followUpSignals.includes(word));
  const startsLikeFreshQuestion = words.length > 0 && questionLeadIns.includes(words[0]);

  if (startsLikeFreshQuestion && !hasFollowUpSignal) {
    return false;
  }

  return wordCount > 0 && wordCount <= 5;
}

function filterHighConfidenceMatches(matches: RetrievalMatch[]) {
  if (matches.length === 0) {
    return [];
  }

  const topMatch = matches[0];

  if (topMatch.score < MIN_TOP_SCORE) {
    return [];
  }

  return matches.filter((match) => match.score >= 2);
}

function buildPortfolioFallbackContext(
  knowledgeBase: ReturnType<typeof loadKnowledgeBase>,
  preferredCategories: string[] = []
) {
  const defaultCategories = [
    "homepage",
    "about",
    "projects-overview",
    "profile",
    "persona",
    "persona-faq",
    "experience",
    "education",
    "project-highlight",
    "internal-project",
    "other-work",
  ];
  const orderedCategories = [...preferredCategories, ...defaultCategories];
  const seen = new Set<string>();

  return orderedCategories.flatMap((category) => {
    if (seen.has(category)) {
      return [];
    }

    seen.add(category);
    return knowledgeBase.filter((entry) => entry.category === category);
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = (await request.json()) as {
      message?: string;
      history?: ChatHistoryMessage[];
    };
    const message = body.message?.trim();
    const history = Array.isArray(body.history)
      ? body.history
          .filter(
            (item): item is ChatHistoryMessage =>
              !!item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string" &&
              item.content.trim().length > 0
          )
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const followUpResolution = resolveShortFollowUp(message, history);

    if (followUpResolution?.type === "reject_previous_offer") {
      return NextResponse.json({
        answer: followUpResolution.answer,
        sources: [],
      });
    }

    const effectiveMessage =
      followUpResolution?.type === "accept_previous_offer"
        ? followUpResolution.resolvedMessage
        : message;

    const restrictedResponse = checkRestrictedInput(effectiveMessage);

    if (restrictedResponse) {
      return NextResponse.json({
        answer: restrictedResponse,
        sources: [],
      });
    }

    const contextualMessage = buildContextualMessage(effectiveMessage, history);
    const conversationFocus = buildConversationFocus(history);
    const rawQuestionScope = analyzeQuestionScope(effectiveMessage);
    const contextualQuestionScope = analyzeQuestionScope(contextualMessage);
    const questionScope =
      rawQuestionScope.scope === "outside" && isShortAmbiguousFollowUp(effectiveMessage)
        ? contextualQuestionScope
        : rawQuestionScope;
    const isAcceptedFollowUp = followUpResolution?.type === "accept_previous_offer";

    const safeIntentResponse =
      followUpResolution?.type === "accept_previous_offer"
        ? null
        : getSafeIntentResponse(message);

    if (safeIntentResponse) {
      return NextResponse.json({
        answer: safeIntentResponse.answer,
        sources: [],
      });
    }

    const currentDateTimeResponse = getCurrentPhilippineDateTimeResponse(effectiveMessage);

    if (currentDateTimeResponse) {
      return NextResponse.json({
        answer: currentDateTimeResponse,
        sources: [],
      });
    }

    const tenureResponse = getTenureResponse(contextualMessage);

    if (tenureResponse) {
      return NextResponse.json({
        answer: tenureResponse.answer,
        sources: [],
      });
    }

    if (questionScope.scope === "outside" && !isAcceptedFollowUp) {
      return NextResponse.json({
        answer: buildOutOfScopeFallback(message),
        sources: [],
      });
    }

    const retrievalMatches = retrieveKnowledge(KNOWLEDGE_BASE, contextualMessage);
    let matches = filterHighConfidenceMatches(retrievalMatches);

    if (matches.length === 0 && questionScope.scope === "portfolio") {
      matches = buildPortfolioFallbackContext(
        KNOWLEDGE_BASE,
        questionScope.preferredKnowledgeCategories ?? []
      ).map((entry) => ({
        entry,
        score: 1,
        keywordHits: 0,
        fuzzyKeywordHits: 0,
        titleHits: 0,
        contentHits: 0,
      }));
    }

    if (matches.length === 0) {
      return NextResponse.json({ answer: CHATBOT_FALLBACK });
    }

    const context = matches
      .map(
        (entry, index) =>
          `Context ${index + 1}\nCategory: ${entry.entry.category}\nTitle: ${entry.entry.title}\n${entry.entry.content}`
      )
      .join("\n\n");

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      message: effectiveMessage,
      portfolioContext: context,
      conversationFocus,
      conversationExamples: CHATBOT_CONVERSATION_EXAMPLES,
    });

    const input: ResponseInput = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const response = await client.responses.create({
      model: DEFAULT_MODEL,
      input,
      temperature: 0.7,
    });

    const answer = sanitizeChatbotAnswer(response.output_text) || CHATBOT_FALLBACK;

    return NextResponse.json({
      answer,
      sources: matches.map((item) => ({
        id: item.entry.id,
        category: item.entry.category,
        title: item.entry.title,
      })),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Failed to generate chat response." },
      { status: 500 }
    );
  }
}
