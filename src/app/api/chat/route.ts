import OpenAI from "openai";
import { NextResponse } from "next/server";
import { loadKnowledgeBase } from "@/lib/chatbot/loadKnowledge";
import { retrieveKnowledge, type RetrievalMatch } from "@/lib/chatbot/retrieveKnowledge";
import { checkRestrictedInput, getMissingInformationFallback } from "@/lib/chatbot/filters";
import { buildSystemPrompt, buildUserPrompt, type ChatHistoryMessage } from "@/lib/chatbot/prompting";
import { sanitizeChatbotAnswer } from "@/lib/chatbot/response";
import { getSafeIntentResponse } from "@/lib/chatbot/safeIntents";
import { CHATBOT_CONVERSATION_EXAMPLES } from "@/lib/chatbot/conversationExamples";
import { getTenureResponse } from "@/lib/chatbot/tenure";
import type { ResponseInput } from "openai/resources/responses/responses";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const CHATBOT_FALLBACK = getMissingInformationFallback();
const MIN_TOP_SCORE = 3;
const MAX_HISTORY_MESSAGES = 8;
const KNOWLEDGE_BASE = loadKnowledgeBase();

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

function isPortfolioQuestion(message: string) {
  const text = message.toLowerCase();

  const portfolioSignals = [
    "you",
    "your",
    "jasond",
    "jasond",
    "about you",
    "about jason",
    "experience",
    "background",
    "work",
    "career",
    "education",
    "skills",
    "tech stack",
    "project",
    "projects",
    "resume",
    "contact",
    "role",
    "job",
    "worked",
    "developer",
  ];

  return portfolioSignals.some((signal) => text.includes(signal));
}

function buildPortfolioFallbackContext(knowledgeBase: ReturnType<typeof loadKnowledgeBase>) {
  return knowledgeBase.filter(
    (entry) =>
      entry.category === "persona" ||
      entry.category === "persona-faq" ||
      entry.category === "profile" ||
      entry.category === "experience" ||
      entry.category === "education" ||
      entry.category === "project-highlight"
  );
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

    const restrictedResponse = checkRestrictedInput(message);

    if (restrictedResponse) {
      return NextResponse.json({
        answer: restrictedResponse,
        sources: [],
      });
    }

    const safeIntentResponse = getSafeIntentResponse(message);

    if (safeIntentResponse) {
      return NextResponse.json({
        answer: safeIntentResponse.answer,
        sources: [],
      });
    }

    const tenureResponse = getTenureResponse(message);

    if (tenureResponse) {
      return NextResponse.json({
        answer: tenureResponse.answer,
        sources: [],
      });
    }

    const retrievalMatches = retrieveKnowledge(KNOWLEDGE_BASE, message);
    let matches = filterHighConfidenceMatches(retrievalMatches);

    if (matches.length === 0 && isPortfolioQuestion(message)) {
      matches = buildPortfolioFallbackContext(KNOWLEDGE_BASE).map((entry) => ({
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
      message,
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
