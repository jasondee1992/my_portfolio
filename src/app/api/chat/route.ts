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
import { getAgeResponse } from "@/lib/chatbot/age";
import { logChatEvent } from "@/lib/chatbot/chatLogging";
import { getRequestGeoMetadata } from "@/lib/requestGeo";
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

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryMessage[];
  sessionId?: string;
  session_id?: string;
  visitorId?: string;
  visitor_id?: string;
  pageUrl?: string;
  page_url?: string;
  userAgent?: string;
  user_agent?: string;
  timeZone?: string;
  time_zone?: string;
  ipAddress?: string;
  ip_address?: string;
};

type ChatResponseSource = {
  id: string;
  category: string;
  title: string;
};

type ChatRequestMetadata = {
  sessionId: string | null;
  visitorId: string | null;
  pageUrl: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  timeZone: string | null;
};

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getNormalizedBodyField(
  body: Partial<ChatRequestBody> | undefined,
  camelCaseKey: keyof ChatRequestBody,
  snakeCaseKey: keyof ChatRequestBody
) {
  return toNullableText(body?.[camelCaseKey]) ?? toNullableText(body?.[snakeCaseKey]);
}

function getIpAddress(headers: Headers) {
  const forwardedFor = toNullableText(headers.get("x-forwarded-for"));

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return toNullableText(headers.get("x-real-ip"));
}

function getRequestMetadata(request: Request, body?: Partial<ChatRequestBody>): ChatRequestMetadata {
  const normalizedSessionId = getNormalizedBodyField(body, "sessionId", "session_id");
  const normalizedVisitorId = getNormalizedBodyField(body, "visitorId", "visitor_id");
  const normalizedPageUrl = getNormalizedBodyField(body, "pageUrl", "page_url");
  const normalizedUserAgent = getNormalizedBodyField(body, "userAgent", "user_agent");
  const normalizedIpAddress = getNormalizedBodyField(body, "ipAddress", "ip_address");
  const normalizedTimeZone = getNormalizedBodyField(body, "timeZone", "time_zone");
  const geoMetadata = getRequestGeoMetadata(request.headers, {
    requestedTimeZone: normalizedTimeZone,
  });

  return {
    sessionId: normalizedSessionId,
    visitorId: normalizedVisitorId,
    pageUrl: normalizedPageUrl ?? toNullableText(request.headers.get("referer")),
    userAgent: normalizedUserAgent ?? toNullableText(request.headers.get("user-agent")),
    ipAddress: getIpAddress(request.headers) ?? normalizedIpAddress,
    countryCode: geoMetadata.countryCode,
    countryName: geoMetadata.countryName,
    region: geoMetadata.region,
    city: geoMetadata.city,
    timeZone: geoMetadata.timeZone,
  };
}

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
  let requestMetadata = getRequestMetadata(request);
  let rawMessage: string | null = null;
  let effectiveMessageForLog: string | null = null;

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

    const body = (await request.json()) as ChatRequestBody;
    requestMetadata = getRequestMetadata(request, body);

    const message = body.message?.trim();
    rawMessage = message ?? null;
    effectiveMessageForLog = message ?? null;
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

    function respondWithLoggedAnswer({
      answer,
      responseBranch,
      sources = [],
      modelUsed = null,
      status = 200,
    }: {
      answer: string;
      responseBranch: string;
      sources?: ChatResponseSource[];
      modelUsed?: string | null;
      status?: number;
    }) {
      if (rawMessage) {
        void logChatEvent({
          ...requestMetadata,
          userMessage: rawMessage,
          effectiveMessage: effectiveMessageForLog,
          aiResponse: answer,
          responseBranch,
          modelUsed,
        });
      }

      return NextResponse.json({ answer, sources }, { status });
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const followUpResolution = resolveShortFollowUp(message, history);

    if (followUpResolution?.type === "reject_previous_offer") {
      return respondWithLoggedAnswer({
        answer: followUpResolution.answer,
        responseBranch: "follow_up_reject",
      });
    }

    const effectiveMessage =
      followUpResolution?.type === "accept_previous_offer"
        ? followUpResolution.resolvedMessage
        : message;
    effectiveMessageForLog = effectiveMessage;

    const restrictedResponse = checkRestrictedInput(effectiveMessage);

    if (restrictedResponse) {
      return respondWithLoggedAnswer({
        answer: restrictedResponse,
        responseBranch: "restricted_input",
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
      return respondWithLoggedAnswer({
        answer: safeIntentResponse.answer,
        responseBranch: "safe_intent",
      });
    }

    const currentDateTimeResponse = getCurrentPhilippineDateTimeResponse(effectiveMessage);

    if (currentDateTimeResponse) {
      return respondWithLoggedAnswer({
        answer: currentDateTimeResponse,
        responseBranch: "direct_datetime",
      });
    }

    const ageResponse = getAgeResponse(effectiveMessage);

    if (ageResponse) {
      return respondWithLoggedAnswer({
        answer: ageResponse.answer,
        responseBranch: "direct_age",
      });
    }

    const tenureResponse = getTenureResponse(contextualMessage);

    if (tenureResponse) {
      return respondWithLoggedAnswer({
        answer: tenureResponse.answer,
        responseBranch: "direct_tenure",
      });
    }

    if (questionScope.scope === "outside" && !isAcceptedFollowUp) {
      return respondWithLoggedAnswer({
        answer: buildOutOfScopeFallback(message),
        responseBranch: "out_of_scope",
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
      return respondWithLoggedAnswer({
        answer: buildMissingInformationFallback(effectiveMessage),
        responseBranch: "missing_information",
      });
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
    const usedSanitizedFallback = !sanitizedAnswer || sanitizedAnswer === CHATBOT_FALLBACK;
    const answer =
      usedSanitizedFallback
        ? buildMissingInformationFallback(effectiveMessage)
        : sanitizedAnswer;

    return respondWithLoggedAnswer({
      answer,
      responseBranch: usedSanitizedFallback ? "openai_sanitized_fallback" : "openai_generated",
      modelUsed: DEFAULT_MODEL,
      sources: matches.map((item) => ({
        id: item.entry.id,
        category: item.entry.category,
        title: item.entry.title,
      })),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (rawMessage) {
      void logChatEvent({
        ...requestMetadata,
        userMessage: rawMessage,
        effectiveMessage: effectiveMessageForLog,
        aiResponse: "Failed to generate chat response.",
        responseBranch: "route_error",
      });
    }

    return NextResponse.json(
      { error: "Failed to generate chat response." },
      { status: 500 }
    );
  }
}
