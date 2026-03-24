import profile from "@/data/knowledge/profile.json";

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
  identity: {
    english: [
      "I’m Jasond Delos Santos.",
      "I’m Jasond Delos Santos — a Python-focused developer working on automation, dashboards, internal tools, and business-focused solutions.",
      "I’m Jasond Delos Santos. A lot of my work revolves around automation, reporting workflows, dashboards, and practical internal tools.",
    ],
    filipino: [
      "Ako si Jasond Delos Santos.",
      "Ako si Jasond Delos Santos — isang Python-focused developer na madalas gumagawa ng automation, dashboards, internal tools, at business-focused solutions.",
      "Ako si Jasond Delos Santos. Madalas umiikot ang work ko sa automation, reporting workflows, dashboards, at practical internal tools.",
    ],
    taglish: [
      "I’m Jasond Delos Santos.",
      "I’m Jasond Delos Santos — a Python-focused developer working on automation, dashboards, internal tools, and business-focused solutions.",
      "Ako si Jasond Delos Santos, and a lot of my work is centered on automation, reporting, dashboards, and practical internal tools.",
    ],
  },
  introduction: {
    english: [
      "Sure — I’m a Python-focused developer who works a lot on automation, dashboards, reporting workflows, and internal tools. I like building practical solutions that help teams work more efficiently.",
      "Sure — I’m Jasond Delos Santos. My work is centered on automation, dashboards, internal tools, and data-driven systems, especially solutions that improve workflows and operational efficiency.",
    ],
    filipino: [
      "Sure — ako si Jasond Delos Santos. Python-focused developer ako, at madalas akong gumagawa ng automation, dashboards, reporting workflows, at internal tools.",
      "Ako si Jasond Delos Santos. Ang work ko ay naka-focus sa practical solutions tulad ng automation, dashboards, internal tools, at data-driven systems.",
    ],
    taglish: [
      "Sure — I’m a Python-focused developer who works a lot on automation, dashboards, reporting workflows, and internal tools. I like building practical solutions that help teams work more efficiently.",
      "Ako si Jasond Delos Santos. My work is centered on automation, dashboards, internal tools, and data-driven systems that help improve workflows.",
    ],
  },
  help: {
    english:
      "You can ask me about my projects, skills, tech stack, work experience, education, contact details, and career journey.",
    filipino:
      "Pwede mo akong tanungin tungkol sa projects, skills, tech stack, work experience, education, contact details, at career journey ko.",
    taglish:
      "You can ask me about my projects, skills, tech stack, work experience, education, contact details, and career journey.",
  },
  thanks: {
    english:
      "You’re welcome. If you want, I can also tell you more about my projects, experience, or skills.",
    filipino:
      "Walang anuman. Kung gusto mo, pwede rin kitang kwentuhan tungkol sa projects, experience, o skills ko.",
    taglish:
      "You’re welcome. If you want, I can also share more about my projects, experience, or skills.",
  },
} as const;

const PROFILE_IDENTITY = {
  assistantName: profile.assistant_name ?? "Jasond Delos Santos",
  ownerName: profile.owner_name ?? profile.name ?? "Jasond V. Delos Santos",
  assistantRole: profile.assistant_role ?? "Portfolio voice",
  assistantIntro:
    profile.assistant_short_intro ??
    "A digital version of Jasond Delos Santos that answers questions about his background, projects, skills, experience, education, and tech stack in a natural first-person voice.",
};

function includesAny(text: string, patterns: readonly string[]) {
  return patterns.some((pattern) => text.includes(pattern));
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

export function getSafeIntentResponse(message: string): SafeIntentResult | null {
  const text = message.toLowerCase().trim();
  const languageStyle = detectLanguageStyle(text);

  if (!text) {
    return null;
  }

  if (
    includesAny(text, [
      "what's your name",
      "what is your name",
      "whats your name",
      "ano name mo",
      "ano pangalan mo",
      "pangalan mo",
      "your name",
      "who are you",
      "sino ka",
      "what are you",
      "ano ka",
      "introduce yourself",
      "tell me about yourself",
      "pakilala ka nga",
      "pakilala",
      "ikaw ba si jasond",
      "ikaw ba si jasond ai",
      "are you jasond ai",
      "are you jasond ai",
      "jasond ai ka ba",
    ])
  ) {
    if (
      includesAny(text, [
        "introduce yourself",
        "tell me about yourself",
        "pakilala ka nga",
        "pakilala",
      ])
    ) {
      return {
        answer: pickVariant(
          SAFE_INTENT_RESPONSES.introduction[languageStyle].map((item) =>
            item
              .replaceAll("JasonD AI", PROFILE_IDENTITY.assistantName)
              .replaceAll("Jasond Delos Santos", PROFILE_IDENTITY.ownerName)
          ),
          text
        ),
      };
    }

    return {
      answer: pickVariant(
        SAFE_INTENT_RESPONSES.identity[languageStyle].map((item) =>
          item
            .replaceAll("JasonD AI", PROFILE_IDENTITY.assistantName)
            .replaceAll("Jasond Delos Santos", PROFILE_IDENTITY.ownerName)
        ),
        text
      ),
    };
  }

  if (
    includesAny(text, [
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
    includesAny(text, [
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
    includesAny(text, [
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
    includesAny(text, [
      "help",
      "tulong",
      "ano pwede itanong",
      "what can i ask",
      "pano kita gamitin",
      "how can i use you",
      "anong pwede mong sagutin",
      "what can you answer",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.help[languageStyle] };
  }

  if (
    includesAny(text, [
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
