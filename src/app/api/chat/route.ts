import OpenAI from "openai";
import { NextResponse } from "next/server";
import { loadKnowledgeBase } from "@/lib/chatbot/loadKnowledge";
import { retrieveKnowledge, type RetrievalMatch } from "@/lib/chatbot/retrieveKnowledge";
import { getSafeIntentResponse } from "@/lib/chatbot/safeIntents";
import {
  CHATBOT_FALLBACK,
  CHATBOT_SYSTEM_PROMPT,
} from "@/lib/chatbot/systemPrompt";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MIN_TOP_SCORE = 3;

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

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const safeIntentResponse = getSafeIntentResponse(message);

    if (safeIntentResponse) {
      return NextResponse.json({
        answer: safeIntentResponse.answer,
        sources: [],
      });
    }

    const knowledgeBase = loadKnowledgeBase();
    const retrievalMatches = retrieveKnowledge(knowledgeBase, message);
    let matches = filterHighConfidenceMatches(retrievalMatches);

    if (matches.length === 0 && isPortfolioQuestion(message)) {
      matches = buildPortfolioFallbackContext(knowledgeBase).map((entry) => ({
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

    const response = await client.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: CHATBOT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Portfolio context:\n${context}\n\nQuestion: ${message}`,
        },
      ],
    });

    const answer = response.output_text?.trim() || CHATBOT_FALLBACK;

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
