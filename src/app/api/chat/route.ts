import OpenAI from "openai";
import { NextResponse } from "next/server";
import { loadKnowledgeBase } from "@/lib/chatbot/loadKnowledge";
import { retrieveKnowledge, type RetrievalMatch } from "@/lib/chatbot/retrieveKnowledge";
import { checkRestrictedInput, getMissingInformationFallback } from "@/lib/chatbot/filters";
import { buildSystemPrompt, buildUserPrompt, type ChatHistoryMessage } from "@/lib/chatbot/prompting";
import { sanitizeChatbotAnswer } from "@/lib/chatbot/response";
import { getSafeIntentResponse } from "@/lib/chatbot/safeIntents";
import { buildContextualMessage } from "@/lib/chatbot/conversationContext";
import { CHATBOT_CONVERSATION_EXAMPLES } from "@/lib/chatbot/conversationExamples";
import { getTenureResponse } from "@/lib/chatbot/tenure";
import {
  analyzeQuestionScope,
  buildMissingInformationFallback,
  buildOutOfScopeFallback,
} from "@/lib/chatbot/questionScope";
import { resolveShortFollowUp } from "@/lib/chatbot/followUpResolver";
import type { ResponseInput } from "openai/resources/responses/responses";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const CHATBOT_FALLBACK = getMissingInformationFallback();
const MIN_TOP_SCORE = 3;
const MAX_HISTORY_MESSAGES = 12;
const SOFT_FALLBACK_LIMIT = 3;
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

function inferFallbackCategories(
  message: string,
  questionScope: ReturnType<typeof analyzeQuestionScope>
) {
  if (questionScope.preferredKnowledgeCategories?.length) {
    return [...new Set(questionScope.preferredKnowledgeCategories)].slice(0, 4);
  }

  const normalized = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const categoryRules: Array<{ signals: string[]; categories: string[] }> = [
    {
      signals: ["project", "projects", "built", "build", "portfolio", "case study"],
      categories: ["projects-overview", "project-highlight", "internal-project", "other-work"],
    },
    {
      signals: ["experience", "background", "career", "role", "company", "work history"],
      categories: ["experience", "about", "profile", "persona-faq"],
    },
    {
      signals: [
        "skills",
        "skill",
        "tech stack",
        "stack",
        "aws",
        "cloud",
        "amplify",
        "s3",
        "route 53",
        "acm",
        "certificate manager",
        "cloudwatch",
        "iam",
        "cloudfront",
        "rds",
        "aurora",
        "dynamodb",
        "ci cd",
        "ci/cd",
        "deployment",
        "react",
        "python",
        "ai",
        "bedrock",
        "llm",
        "tools",
      ],
      categories: ["profile", "about", "homepage", "persona-faq"],
    },
    {
      signals: ["contact", "email", "linkedin", "reach", "availability", "freelance"],
      categories: ["profile", "persona", "persona-faq"],
    },
  ];

  for (const rule of categoryRules) {
    if (rule.signals.some((signal) => normalized.includes(signal))) {
      return rule.categories;
    }
  }

  return ["homepage", "about", "profile"];
}

function toLowConfidenceMatches(entries: ReturnType<typeof loadKnowledgeBase>) {
  return entries.map((entry) => ({
    entry,
    score: 1,
    keywordHits: 0,
    fuzzyKeywordHits: 0,
    titleHits: 0,
    contentHits: 0,
  }));
}

function buildScopedPortfolioFallbackMatches(
  knowledgeBase: ReturnType<typeof loadKnowledgeBase>,
  message: string,
  questionScope: ReturnType<typeof analyzeQuestionScope>
) {
  const categories = inferFallbackCategories(message, questionScope);
  const categorySet = new Set(categories);
  const candidates = knowledgeBase.filter((entry) => categorySet.has(entry.category));

  if (candidates.length === 0) {
    return [];
  }

  const softMatches = retrieveKnowledge(candidates, message, SOFT_FALLBACK_LIMIT);

  if (softMatches.length > 0) {
    return softMatches;
  }

  const summaryFriendlyCategories = new Set([
    "homepage",
    "about",
    "profile",
    "projects-overview",
    "project-highlight",
    "persona",
    "persona-faq",
    "experience",
  ]);

  const seededEntries = categories
    .flatMap((category) =>
      candidates
        .filter((entry) => entry.category === category && summaryFriendlyCategories.has(entry.category))
        .slice(0, 1)
    )
    .slice(0, 2);

  return seededEntries.length > 0 ? toLowConfidenceMatches(seededEntries) : [];
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
      matches = buildScopedPortfolioFallbackMatches(
        KNOWLEDGE_BASE,
        contextualMessage,
        questionScope
      );
    }

    if (matches.length === 0) {
      return NextResponse.json({ answer: buildMissingInformationFallback(effectiveMessage) });
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

    const sanitizedAnswer = sanitizeChatbotAnswer(response.output_text);
    const answer =
      !sanitizedAnswer || sanitizedAnswer === CHATBOT_FALLBACK
        ? buildMissingInformationFallback(effectiveMessage)
        : sanitizedAnswer;

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
