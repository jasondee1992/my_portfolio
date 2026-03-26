type QuestionScopeType = "portfolio" | "personal" | "tech" | "outside";
type LanguageStyle = "english" | "filipino" | "taglish";
type ProfileQuestionCategory =
  | "self_intro"
  | "current_role"
  | "work_experience"
  | "professional_background"
  | "strongest_skills"
  | "strengths_as_developer"
  | "role_fit_skills"
  | "tech_stack"
  | "projects_summary"
  | "best_project"
  | "proudest_project"
  | "passions"
  | "hobbies_or_free_time"
  | "goals_in_five_years"
  | "ai_interest"
  | "why_apply"
  | "motivation_for_role"
  | "work_availability"
  | "freelance_availability"
  | "contact_info";

type ProfileQuestionRoute = {
  category: ProfileQuestionCategory;
  patterns: string[];
  preferredKnowledgeCategories: string[];
};

const PORTFOLIO_SIGNALS = [
  "portfolio",
  "about you",
  "about yourself",
  "your background",
  "your experience",
  "work experience",
  "professional experience",
  "professional background",
  "career background",
  "work history",
  "career history",
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
  "apply for this position",
  "apply for this company",
  "apply for this role",
  "interested in this role",
  "interested in this position",
  "want this role",
  "join this company",
  "fit for this role",
  "suitable for this role",
  "contribute to this role",
  "bring to this position",
  "value can you add",
  "jasond",
  "jpmorgan",
  "fujitsu",
  "weserv",
].map((item) => item.toLowerCase());

const PROFILE_TOPIC_SIGNALS = [
  "work experience",
  "professional experience",
  "experience",
  "background",
  "professional background",
  "career background",
  "work history",
  "career history",
  "projects",
  "project",
  "skills",
  "skill",
  "tech stack",
  "roles",
  "roles have you had",
].map((item) => item.toLowerCase());

const PROFILE_FOLLOW_UP_SIGNALS = [
  "how about",
  "what about",
  "tell me about",
  "can you share",
  "what is your",
  "what s your",
  "what kind of",
  "pwede mo bang ikwento",
  "ano",
  "anong",
].map((item) => item.toLowerCase());

const PROFILE_QUESTION_MAP: ProfileQuestionRoute[] = [
  {
    category: "self_intro",
    patterns: [
      "tell me about yourself",
      "can you tell me about yourself",
      "tell me something about yourself",
      "introduce yourself",
      "self intro",
      "pakilala ka",
      "pakilala ka nga",
    ],
    preferredKnowledgeCategories: ["homepage", "about", "profile", "persona", "persona-faq"],
  },
  {
    category: "current_role",
    patterns: [
      "current role",
      "current position",
      "what do you do now",
      "what is your current role",
      "what is your current job",
      "ano current role mo",
      "anong role mo ngayon",
    ],
    preferredKnowledgeCategories: ["profile", "experience", "about", "persona", "persona-faq"],
  },
  {
    category: "work_experience",
    patterns: [
      "work experience",
      "professional experience",
      "what is your work experience",
      "tell me about your work experience",
      "can you share your work experience",
      "what kind of experience do you have",
      "what is your professional experience",
      "ano work experience mo",
      "ano experience mo",
      "experience mo",
    ],
    preferredKnowledgeCategories: ["experience", "about", "homepage", "profile", "persona-faq"],
  },
  {
    category: "professional_background",
    patterns: [
      "professional background",
      "career background",
      "work history",
      "career history",
      "what is your background",
      "what's your professional background",
      "what's your career background",
      "anong background mo sa work",
      "what roles have you had",
      "what is your professional background",
    ],
    preferredKnowledgeCategories: ["about", "experience", "homepage", "profile", "persona-faq"],
  },
  {
    category: "strongest_skills",
    patterns: [
      "strongest skills",
      "what are your strongest skills",
      "top skills",
      "main skills",
      "best skills",
      "strong skills",
      "ano strongest skills mo",
      "how about your skills",
      "what about your skills",
    ],
    preferredKnowledgeCategories: ["homepage", "about", "profile", "persona", "persona-faq"],
  },
  {
    category: "strengths_as_developer",
    patterns: [
      "strengths as a developer",
      "what are your strengths as a developer",
      "developer strengths",
      "what makes you strong as a developer",
      "strength mo as developer",
    ],
    preferredKnowledgeCategories: ["about", "homepage", "profile", "persona", "persona-faq"],
  },
  {
    category: "role_fit_skills",
    patterns: [
      "what skills do you think you can contribute to this role",
      "what skills can you contribute to this role",
      "what can you contribute to this role",
      "what can you bring to this position",
      "what value can you add to this role",
      "what value can you add to this company",
      "how can you contribute to this company",
      "why are you a fit for this role",
      "what makes you suitable for this role",
      "what strengths can you bring to this position",
      "what are your strengths for this position",
      "what strengths do you bring to this role",
      "what can you contribute to this position",
      "what can you bring to this role",
      "why are you fit for this role",
      "skills can you bring",
      "contribute to this role",
      "bring to this position",
      "anong skills ang maico contribute mo sa role na to",
      "anong skills ang maicocontribute mo sa role na to",
      "ano maiaambag mong skills dito",
      "ano maiaambag mo sa role na to",
      "bakit ka bagay sa role na to",
    ],
    preferredKnowledgeCategories: [
      "homepage",
      "about",
      "experience",
      "project-highlight",
      "internal-project",
      "other-work",
      "profile",
      "persona",
      "persona-faq",
    ],
  },
  {
    category: "tech_stack",
    patterns: [
      "tech stack",
      "what is your tech stack",
      "what technologies do you use",
      "what tools do you use",
      "what is your stack",
      "anong tech stack mo",
      "ano stack mo",
    ],
    preferredKnowledgeCategories: [
      "homepage",
      "about",
      "projects-overview",
      "profile",
      "internal-project",
      "other-work",
      "persona-faq",
    ],
  },
  {
    category: "projects_summary",
    patterns: [
      "what projects have you built",
      "tell me about your projects",
      "what projects do you have",
      "project summary",
      "ano projects mo",
      "how about your projects",
      "what about your projects",
    ],
    preferredKnowledgeCategories: [
      "homepage",
      "projects-overview",
      "project-highlight",
      "internal-project",
      "other-work",
    ],
  },
  {
    category: "best_project",
    patterns: [
      "best project",
      "what is your best project",
      "which project is your best",
      "best project mo",
    ],
    preferredKnowledgeCategories: [
      "project-highlight",
      "internal-project",
      "other-work",
      "projects-overview",
    ],
  },
  {
    category: "proudest_project",
    patterns: [
      "proudest project",
      "what project are you most proud of",
      "what project are you proudest of",
      "most proud project",
      "project na pinaka proud ka",
    ],
    preferredKnowledgeCategories: [
      "project-highlight",
      "internal-project",
      "other-work",
      "projects-overview",
    ],
  },
  {
    category: "passions",
    patterns: [
      "what are you passionate about",
      "what are your passions",
      "passions",
      "ano passion mo",
      "what drives you",
    ],
    preferredKnowledgeCategories: ["about", "persona", "persona-faq", "homepage"],
  },
  {
    category: "hobbies_or_free_time",
    patterns: [
      "free time",
      "hobbies",
      "what do you do in your free time",
      "interests outside work",
      "what do you do outside work",
      "ano hobby mo",
      "anong ginagawa mo sa free time",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "about"],
  },
  {
    category: "goals_in_five_years",
    patterns: [
      "goals in five years",
      "five year goals",
      "where do you see yourself in five years",
      "what are your goals in five years",
      "goals in the next five years",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "about"],
  },
  {
    category: "ai_interest",
    patterns: [
      "interest in ai",
      "ai interest",
      "why are you interested in ai",
      "what is your interest in ai",
      "interested ka ba sa ai",
      "how about ai",
    ],
    preferredKnowledgeCategories: ["homepage", "about", "profile", "persona", "persona-faq"],
  },
  {
    category: "why_apply",
    patterns: [
      "why did you apply for this position",
      "why did you apply for this company",
      "why do you want this role",
      "why are you interested in this role",
      "why are you interested in this position",
      "why do you want to join this company",
      "what made you apply here",
      "why are you applying for this job",
      "why did you apply here",
      "why do you want this position",
      "bakit ka nag apply sa role na to",
      "bakit ka nag apply sa position na to",
      "bakit gusto mo tong position na to",
      "bakit gusto mong sumali sa company na to",
      "bakit mo gusto tong role na to",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "about", "experience", "homepage", "profile"],
  },
  {
    category: "motivation_for_role",
    patterns: [
      "what interests you about this role",
      "why are you interested in this role",
      "what excites you about this position",
      "what motivates you to apply",
      "why does this opportunity interest you",
      "what are you looking for in your next role",
      "what interests you about this position",
      "why are you interested in this opportunity",
      "what motivates you for this role",
      "what are you looking for in your next job",
      "anong interested ka sa role na to",
      "ano hinahanap mo sa next role mo",
      "ano ang hinahanap mo sa next role mo",
      "anong nakaka excite sayo sa role na to",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "about", "experience", "homepage", "profile"],
  },
  {
    category: "work_availability",
    patterns: [
      "open to new opportunities",
      "open to work",
      "available for work",
      "looking for opportunities",
      "are you open to new opportunities",
      "are you open to work",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "profile"],
  },
  {
    category: "freelance_availability",
    patterns: [
      "open to freelance",
      "open to project based work",
      "freelance availability",
      "are you available for freelance",
      "open ka ba sa freelance",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "profile"],
  },
  {
    category: "contact_info",
    patterns: [
      "contact info",
      "contact details",
      "how can i contact you",
      "what is your email",
      "how do i reach you",
      "paano kita macocontact",
      "ano email mo",
    ],
    preferredKnowledgeCategories: ["profile", "persona", "persona-faq"],
  },
];

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

function isProfileTopicFollowUp(message: string) {
  const lowered = normalizeText(message);

  return includesAny(lowered, PROFILE_FOLLOW_UP_SIGNALS) && includesAny(lowered, PROFILE_TOPIC_SIGNALS);
}

function matchProfileQuestionRoute(message: string) {
  const lowered = normalizeText(message);

  return PROFILE_QUESTION_MAP.find((route) => includesAny(lowered, route.patterns)) ?? null;
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
  profileCategory?: ProfileQuestionCategory;
  preferredKnowledgeCategories?: string[];
} {
  const lowered = normalizeText(message);
  const coreTopic = extractCoreTopic(message);
  const languageStyle = detectLanguageStyle(message);
  const hasPersonalReference = includesAny(lowered, PERSONAL_REFERENCE_SIGNALS);
  const matchedProfileRoute = matchProfileQuestionRoute(lowered);

  if (matchedProfileRoute) {
    return {
      scope: "portfolio",
      coreTopic,
      languageStyle,
      profileCategory: matchedProfileRoute.category,
      preferredKnowledgeCategories: matchedProfileRoute.preferredKnowledgeCategories,
    };
  }

  if (includesAny(lowered, PORTFOLIO_SIGNALS)) {
    return { scope: "portfolio", coreTopic, languageStyle };
  }

  if (isProfileTopicFollowUp(lowered)) {
    return {
      scope: "portfolio",
      coreTopic,
      languageStyle,
      preferredKnowledgeCategories: ["homepage", "about", "projects-overview", "profile", "persona", "persona-faq"],
    };
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
