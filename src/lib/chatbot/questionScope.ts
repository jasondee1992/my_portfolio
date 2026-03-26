type QuestionScopeType = "portfolio" | "personal" | "tech" | "outside";
type LanguageStyle = "english" | "filipino" | "taglish";

const PORTFOLIO_SIGNALS = [
  "portfolio",
  "about you",
  "about yourself",
  "your background",
  "your experience",
  "your project",
  "your projects",
  "your skills",
  "your tech stack",
  "resume",
  "hire me",
  "contact",
  "linkedin",
  "github",
  "where do you work",
  "current company",
  "current role",
  "career",
  "education",
  "jasond",
  "jpmorgan",
  "fujitsu",
  "weserv",
].map((item) => item.toLowerCase());

const PERSONAL_SIGNALS = [
  "free time",
  "interests",
  "hobbies",
  "passion",
  "passionate",
  "five years",
  "goal",
  "dream",
  "personality",
  "what do you like",
  "basketball",
  "jogging",
  "cooking",
  "child",
].map((item) => item.toLowerCase());

const PERSONAL_REFERENCE_SIGNALS = [
  "you",
  "your",
  "yourself",
  "about you",
  "about yourself",
  "do you",
  "are you",
  "what do you",
  "what are your",
  "your goals",
  "your interests",
  "your hobbies",
  "your passion",
  "ikaw",
  "mo",
  "ka",
  "sayo",
  "sa iyo",
  "ikaw ba",
  "ano ang gusto mo",
  "ano yung gusto mo",
  "ano ang hilig mo",
  "ano yung hilig mo",
].map((item) => item.toLowerCase());

const TECH_SIGNALS = [
  "tech",
  "technology",
  "developer",
  "development",
  "software",
  "programming",
  "python",
  "sql",
  "javascript",
  "react",
  "next",
  "django",
  "flask",
  "dash",
  "api",
  "automation",
  "data",
  "engineering",
  "ai",
  "llm",
  "rag",
  "openai",
  "aws",
  "snowflake",
  "database",
  "backend",
  "frontend",
  "full stack",
  "coding",
].map((item) => item.toLowerCase());

const ENGLISH_SIGNALS = [
  "what",
  "how",
  "why",
  "can",
  "could",
  "would",
  "tell",
  "about",
].map((item) => item.toLowerCase());

const FILIPINO_SIGNALS = [
  "ano",
  "anong",
  "paano",
  "pwede",
  "saan",
  "ilang",
  "gaano",
  "tungkol",
  "mo",
  "ba",
  "ka",
].map((item) => item.toLowerCase());

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeForMatching(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function includesAny(text: string, signals: string[]) {
  const normalizedText = normalizeForMatching(text);

  return signals.some((signal) => {
    const normalizedSignal = signal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return normalizedSignal
      ? normalizedText.includes(` ${normalizedSignal} `)
      : false;
  });
}

function detectLanguageStyle(message: string): LanguageStyle {
  const lowered = normalizeText(message);
  const hasEnglish = includesAny(lowered, ENGLISH_SIGNALS);
  const hasFilipino = includesAny(lowered, FILIPINO_SIGNALS);

  if (hasEnglish && hasFilipino) {
    return "taglish";
  }

  if (hasFilipino) {
    return "filipino";
  }

  return "english";
}

function pickVariant(options: string[], seed: string) {
  const sum = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return options[sum % options.length];
}

function cleanupTopic(rawTopic: string) {
  const topic = rawTopic
    .replace(/[?!.]+$/g, "")
    .replace(/\b(please|naman|nga|po|lang)\b/gi, "")
    .replace(/\b(can you|could you|would you|do you know|tell me|explain|sabihin mo|kwento mo)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return topic;
}

function extractCoreTopic(message: string) {
  let normalized = normalizeText(message);

  const prefixReplacements: Array<[RegExp, string]> = [
    [/^(can you explain|could you explain|would you explain)\s+/i, ""],
    [/^(can you tell me about|could you tell me about|would you tell me about)\s+/i, ""],
    [/^(tell me about|explain|give me)\s+/i, ""],
    [/^(what is|what are|what's|whats)\s+/i, ""],
    [/^(how do i)\s+/i, "how to "],
    [/^(how do you)\s+/i, "how to "],
    [/^(how does)\s+/i, ""],
    [/^(how to)\s+/i, "how to "],
    [/^(ano ang|ano yung|anong)\s+/i, ""],
    [/^(paano ang|paano yung|paano mag|pano mag)\s+/i, ""],
    [/^(sabihin mo|kwento mo)\s+/i, ""],
  ];

  for (const [pattern, replacement] of prefixReplacements) {
    normalized = normalized.replace(pattern, replacement).trim();
  }

  normalized = normalized
    .replace(/^(the meaning of)\s+/i, "the meaning of ")
    .replace(/\babout\b\s*/i, "")
    .replace(/\b(in general|for me|for us)\b/gi, "")
    .trim();

  return cleanupTopic(normalized || message);
}

export function analyzeQuestionScope(message: string): {
  scope: QuestionScopeType;
  coreTopic: string;
  languageStyle: LanguageStyle;
} {
  const lowered = normalizeText(message);
  const coreTopic = extractCoreTopic(message);
  const languageStyle = detectLanguageStyle(message);
  const hasPersonalReference = includesAny(lowered, PERSONAL_REFERENCE_SIGNALS);

  if (includesAny(lowered, PORTFOLIO_SIGNALS)) {
    return { scope: "portfolio", coreTopic, languageStyle };
  }

  if (hasPersonalReference && includesAny(lowered, PERSONAL_SIGNALS)) {
    return { scope: "personal", coreTopic, languageStyle };
  }

  if (includesAny(lowered, TECH_SIGNALS)) {
    return { scope: "tech", coreTopic, languageStyle };
  }

  return { scope: "outside", coreTopic, languageStyle };
}

export function buildOutOfScopeFallback(message: string) {
  const { coreTopic, languageStyle } = analyzeQuestionScope(message);
  const hasClearTopic = Boolean(coreTopic && coreTopic !== "topic na yan");

  if (!hasClearTopic) {
    const genericVariants = {
      english: [
        "I understand the question, but that goes beyond the topics I’m meant to cover here.",
        "I get what you're asking, but that topic is outside the scope I handle here.",
      ],
      filipino: [
        "Naiintindihan ko yung tanong mo, pero lampas na siya sa scope ng knowledge na handle ko dito.",
        "Gets ko yung gusto mong malaman, pero hindi kasi iyon kasama sa focus ng mga sagot ko dito.",
      ],
      taglish: [
        "Gets ko yung tanong mo, pero outside na siya sa scope ng knowledge na handle ko dito.",
        "Naiintindihan ko yung gusto mong malaman, pero hindi kasi siya kasama sa main topics na focus kong sagutin.",
      ],
    };

    return pickVariant(genericVariants[languageStyle], message);
  }

  const variants = {
    english: [
      `I get that you're asking about ${coreTopic}, but that topic is already outside the set of things I was taught to answer here.`,
      `I understand your interest in ${coreTopic}, but that goes beyond the topics I’m meant to cover here.`,
      `That’s a fair question about ${coreTopic}, but it’s outside the knowledge I’m focused on answering through this portfolio.`,
      `I see what you want to know about ${coreTopic}, but that topic isn’t really part of the scope I handle here.`,
      `You’re asking about ${coreTopic}, and I get the interest there, but it’s outside the topics I’m meant to handle here.`,
    ],
    filipino: [
      `Mukhang gusto mong malaman yung tungkol sa ${coreTopic}, pero lampas na siya sa scope ng mga tinuro sa akin na dapat kong sagutin dito.`,
      `Naiintindihan ko yung tanong mo tungkol sa ${coreTopic}, pero hindi kasi siya kasama sa knowledge na handle ko dito.`,
      `Magandang tanong yan tungkol sa ${coreTopic}, pero hindi kasi iyon bahagi ng knowledge na naka-focus akong sagutin.`,
      `Alam ko kung ano yung gusto mong malaman tungkol sa ${coreTopic}, pero hindi siya kabilang sa main knowledge na tinuro sa akin dito.`,
      `Mukhang interesado ka sa ${coreTopic}, pero hindi kasi iyon sakop ng knowledge na focus kong sagutin dito.`,
    ],
    taglish: [
      `Gets ko yung tanong mo tungkol sa ${coreTopic}, pero ang coverage ko lang kasi is related sa portfolio, IT, at sa mga details na itinuro sa akin.`,
      `Mukhang interesado ka sa ${coreTopic}, pero hindi na kasi siya sakop ng main knowledge na handle ko dito.`,
      `Naiintindihan ko yung interest mo sa ${coreTopic}, pero outside na siya sa topics na tinuro sa akin na sagutin dito.`,
      `Alam kong gusto mong malaman yung about sa ${coreTopic}, pero hindi na kasi siya related sa knowledge na tinuro sa sakin na sagutin.`,
      `Magandang tanong yan tungkol sa ${coreTopic}, pero ang focus lang kasi ng knowledge ko ay nasa portfolio, IT, at sa mga details na itinuro sa akin.`,
    ],
  };

  return pickVariant(variants[languageStyle], message);
}
