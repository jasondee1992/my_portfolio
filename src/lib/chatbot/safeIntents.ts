import { analyzeQuestionScope } from "@/lib/chatbot/questionScope";

type SafeIntentResult = {
  answer: string;
};

type LanguageStyle = "english" | "filipino" | "taglish";
const SAFE_INTENT_RESPONSES = {
  greeting: {
    english: [
      "Hi! Glad you’re here.",
      "Hello! Good to have you here.",
      "Hey! Nice to connect.",
    ],
    filipino: [
      "Hi! Kumusta?",
      "Hello! Ayos ka lang?",
      "Kamusta! Nice to have you here.",
    ],
    taglish: [
      "Hi! Kumusta?",
      "Hello! Good to have you here.",
      "Hey! Nice to connect.",
    ],
  },
  status: {
    english: [
      "Doing well, thanks for asking. Happy to chat about my work, projects, or background.",
      "I’m doing great, thanks. You can ask me about my projects, experience, or tech stack.",
      "All good here, thanks. I’d be happy to talk about my work, skills, or career journey.",
    ],
    filipino: [
      "Okay naman, salamat sa pagtanong. Kumusta?",
      "Ayos naman! Salamat. Pwede mo akong tanungin tungkol sa work, projects, o experience ko.",
      "Mabuti naman, salamat. If you want, pwede kitang kwentuhan tungkol sa background at projects ko.",
    ],
    taglish: [
      "Okay naman, salamat sa pagtanong. You can ask me about my projects, skills, experience, or tech stack.",
      "Ayos naman! Thanks for asking. Happy to chat about my background, work, or portfolio.",
      "Doing well naman. Feel free to ask about my work, projects, or technical experience.",
    ],
  },
  language: {
    english:
      "Yes, I can understand multilingual input, including English, Filipino, Tagalog, and Taglish. I can also match your language style naturally.",
    filipino:
      "Oo, kaya kong umintindi ng English, Filipino, Tagalog, at Taglish. Kaya ko ring mag-adjust sa way ng pagtanong mo.",
    taglish:
      "Yes, kaya kong umintindi ng English, Filipino, Tagalog, at Taglish, and kaya ko ring mag-match sa language style mo.",
  },
  help: {
    english:
      "You can ask me about my projects, skills, tech stack, work experience, background, availability, portfolio, AI tools, React experience, local LLM exploration, and contact details.",
    filipino:
      "Pwede mo akong tanungin tungkol sa projects, skills, tech stack, work experience, background, availability, portfolio, AI tools, React experience, local LLM exploration, at contact details ko.",
    taglish:
      "You can ask me about my projects, skills, tech stack, work experience, background, availability, portfolio, AI tools, React experience, local LLM exploration, and contact details.",
  },
  thanks: {
    english:
      "You’re welcome. If you want, I can also tell you more about my projects, experience, or skills.",
    filipino:
      "Walang anuman. Kung gusto mo, pwede rin kitang kwentuhan tungkol sa projects, experience, o skills ko.",
    taglish:
      "You’re welcome. If you want, I can also share more about my projects, experience, or skills.",
  },
  laughter: {
    english: [
      "Haha, appreciate that.",
      "Haha, glad that made you smile.",
      "Haha, ayos yan.",
      "Haha, buti napatawa kita.",
    ],
    filipino: [
      "Haha, salamat.",
      "Haha, natuwa ako doon.",
      "Haha, ayos yan.",
      "Haha, buti napatawa kita.",
    ],
    taglish: [
      "Haha, salamat. Glad you liked it.",
      "Haha, appreciate it.",
      "Haha, ayos yan.",
      "Haha, natuwa ako doon.",
    ],
  },
  acknowledgment: {
    english: [
      "Alright.",
      "Sounds good.",
      "Got it.",
      "Noted.",
    ],
    filipino: [
      "Sige.",
      "Ayos.",
      "Noted.",
      "Okay.",
    ],
    taglish: [
      "Okay, noted.",
      "Sige, got it.",
      "Ayos, noted.",
      "Sounds good.",
    ],
  },
  positiveReaction: {
    english: [
      "Glad you liked it.",
      "Appreciate that.",
      "Nice, glad that landed well.",
      "Good to hear that.",
    ],
    filipino: [
      "Salamat, natuwa ako na nagustuhan mo.",
      "Ayos, salamat.",
      "Nice, glad na okay sayo.",
      "Appreciate ko yan.",
    ],
    taglish: [
      "Salamat, glad you liked it.",
      "Nice, appreciate that.",
      "Haha, ang saya marinig niyan.",
      "Good to hear that, salamat.",
    ],
  },
} as const;

const LEADING_CONVERSATIONAL_PREFIXES = [
  "nice",
  "awesome",
  "cool",
  "wow",
  "great",
  "okay",
  "ok",
  "got it",
  "sounds good",
  "alright",
  "noted",
  "thanks",
  "thank you",
  "thank u",
  "salamat",
  "appreciate it",
].map((item) => item.toLowerCase());

function normalizeForIntentMatching(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesPattern(normalizedText: string, pattern: string) {
  const normalizedPattern = pattern
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedPattern) {
    return false;
  }

  return normalizedText.includes(` ${normalizedPattern} `);
}

function includesAny(normalizedText: string, patterns: readonly string[]) {
  return patterns.some((pattern) => includesPattern(normalizedText, pattern));
}

function detectLanguageStyle(text: string): LanguageStyle {
  const filipinoSignals = [
    "kamusta",
    "kumusta",
    "salamat",
    "pwede",
    "ano",
    "paano",
    "saan",
    "ikaw",
    "ka",
    "naman",
    "nandito",
    "tanungin",
    "tungkol",
  ];

  const englishSignals = [
    "hello",
    "hi",
    "hey",
    "what",
    "how",
    "can",
    "tell",
    "about",
    "projects",
    "skills",
    "experience",
  ];

  const hasFilipino = filipinoSignals.some((signal) => text.includes(signal));
  const hasEnglish = englishSignals.some((signal) => text.includes(signal));

  if (hasFilipino && hasEnglish) {
    return "taglish";
  }

  if (hasFilipino) {
    return "filipino";
  }

  return "english";
}

function pickVariant(options: readonly string[], seed: string) {
  const value = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return options[value % options.length];
}

function trimLeadingConversationalPrefix(text: string) {
  let current = text.trim();
  let changed = true;

  while (changed && current) {
    changed = false;

    for (const prefix of LEADING_CONVERSATIONAL_PREFIXES) {
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

export function getSafeIntentResponse(message: string): SafeIntentResult | null {
  const text = message.toLowerCase().trim();
  const normalizedText = normalizeForIntentMatching(text);
  const languageStyle = detectLanguageStyle(text);
  const emojiOnly = /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u.test(
    message.trim()
  );

  if (!text) {
    return null;
  }

  const trimmedMixedIntentRemainder = trimLeadingConversationalPrefix(message.trim());
  const hasMixedPortfolioIntent =
    trimmedMixedIntentRemainder.length > 0 &&
    trimmedMixedIntentRemainder.toLowerCase() !== message.trim().toLowerCase() &&
    analyzeQuestionScope(trimmedMixedIntentRemainder).scope !== "outside";

  if (hasMixedPortfolioIntent) {
    return null;
  }

  if (
    emojiOnly ||
    includesAny(normalizedText, [
      "haha",
      "hahaha",
      "hehe",
      "hehehe",
      "lol",
      "lmao",
      "rofl",
    ])
  ) {
    return {
      answer: pickVariant(SAFE_INTENT_RESPONSES.laughter[languageStyle], text),
    };
  }

  if (
    includesAny(normalizedText, [
      "okay",
      "ok",
      "ah okay",
      "okay noted",
      "noted",
      "sige",
      "copy",
      "got it",
      "understood",
      "alright",
      "ayos",
    ])
  ) {
    return {
      answer: pickVariant(SAFE_INTENT_RESPONSES.acknowledgment[languageStyle], text),
    };
  }

  if (
    includesAny(normalizedText, [
      "nice",
      "awesome",
      "wow",
      "grabe",
      "omg",
      "sheesh",
      "ang galing",
      "galing",
      "cool",
    ])
  ) {
    return {
      answer: pickVariant(SAFE_INTENT_RESPONSES.positiveReaction[languageStyle], text),
    };
  }

  if (
    includesAny(normalizedText, [
      "how are you",
      "how are you doing",
      "how's it going",
      "hows it going",
      "kamusta ka",
      "kumusta ka",
      "kamusta?",
      "kumusta?",
      "kamusta",
      "kumusta",
      "okay ka lang",
      "are you there",
      "are you okay",
    ])
  ) {
    return {
      answer: pickVariant(SAFE_INTENT_RESPONSES.status[languageStyle], text),
    };
  }

  if (
    includesAny(normalizedText, [
      "hello",
      "hi",
      "hey",
      "hello there",
      "yo",
      "sup",
      "good morning",
      "good afternoon",
      "good evening",
      "kamusta",
      "kumusta",
      "howdy",
      "uy",
    ])
  ) {
    return {
      answer: pickVariant(SAFE_INTENT_RESPONSES.greeting[languageStyle], text),
    };
  }

  if (
    includesAny(normalizedText, [
      "kaya mo ba mag tagalog",
      "marunong ka ba mag tagalog",
      "can you speak tagalog",
      "do you understand tagalog",
      "tagalog",
      "taglish",
      "english",
      "anong language",
      "what language",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.language[languageStyle] };
  }

  if (
    includesAny(normalizedText, [
      "help",
      "tulong",
      "ano pwede itanong",
      "what can i ask",
      "what can i ask you about",
      "what can we talk about",
      "what do you want to discuss",
      "what topics can we talk about",
      "ano ba gusto mong pag usapan",
      "ano pwede nating pag usapan",
      "anong pwede kong itanong",
      "ano pwede kong itanong sayo",
      "pano kita gamitin",
      "how can i use you",
      "anong pwede mong sagutin",
      "what can you answer",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.help[languageStyle] };
  }

  // Continuation phrases such as "yes please" and "tell me more" are handled
  // by followUpResolver when the previous assistant message actually offered more.

  if (
    includesAny(normalizedText, [
      "thank you",
      "thanks",
      "thank u",
      "salamat",
      "ty",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.thanks[languageStyle] };
  }

  return null;
}
