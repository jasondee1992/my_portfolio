import profile from "@/data/knowledge/profile.json";
import { getPersonaMemory } from "@/lib/chatbot/memory";

type SafeIntentResult = {
  answer: string;
};

type LanguageStyle = "english" | "filipino" | "taglish";

const PERSONA_MEMORY = getPersonaMemory();
const SHORT_INTRO =
  PERSONA_MEMORY.preferred_introduction.short_intro ??
  "Hi, I’m Jasond. I’m a Python-focused developer who works a lot on automation, dashboards, and practical business tools.";
const MEDIUM_INTRO =
  PERSONA_MEMORY.preferred_introduction.medium_intro ?? SHORT_INTRO;
const CASUAL_INTRO =
  PERSONA_MEMORY.preferred_introduction.casual_intro ?? SHORT_INTRO;
const PUBLIC_SUMMARY =
  PERSONA_MEMORY.basic_identity.short_summary ??
  "Python Full-Stack Developer focused on automation, internal tools, dashboards, and data-driven systems.";
const PUBLIC_EMAIL = PERSONA_MEMORY.basic_identity.public_contact_email;
const CURRENT_ROLE =
  typeof PERSONA_MEMORY.work_background?.current_role === "string"
    ? PERSONA_MEMORY.work_background.current_role
    : "";
const LINKEDIN_URL =
  typeof profile.contact.linkedin_url === "string" ? profile.contact.linkedin_url : "";

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
  name: {
    english: [
      "I’m Jasond.",
      "I’m Jasond. Nice to meet you.",
      "Jasond Delos Santos.",
    ],
    filipino: [
      "Ako si Jasond.",
      "Ako si Jasond. Nice to meet you.",
      "Jasond Delos Santos.",
    ],
    taglish: [
      "I’m Jasond.",
      "Ako si Jasond.",
      "I’m Jasond. Nice to meet you.",
    ],
  },
  identity: {
    english: [
      "I’m a Python-focused developer working on automation, dashboards, internal tools, and business-focused solutions.",
      PUBLIC_SUMMARY,
      "I mainly build practical solutions around automation, reporting, internal tools, and data-driven workflows.",
    ],
    filipino: [
      "Isa akong Python-focused developer na madalas gumagawa ng automation, dashboards, internal tools, at business-focused solutions.",
      "Madalas umiikot ang work ko sa automation, reporting workflows, dashboards, at practical internal tools.",
      "Kadalasan ang work ko ay tungkol sa automation, reporting, internal tools, at data-driven workflows.",
    ],
    taglish: [
      "I’m a Python-focused developer working on automation, dashboards, internal tools, and business-focused solutions.",
      "A lot of my work is centered on automation, reporting, dashboards, and practical internal tools.",
      "Most of my work is around automation, dashboards, internal tools, and business-focused solutions.",
    ],
  },
  introduction: {
    english: [SHORT_INTRO, MEDIUM_INTRO],
    filipino: [
      "Sure — Python-focused developer ako, at madalas akong gumagawa ng automation, dashboards, reporting workflows, at internal tools.",
      "Ang work ko ay naka-focus sa practical solutions tulad ng automation, dashboards, internal tools, at data-driven systems.",
    ],
    taglish: [SHORT_INTRO, CASUAL_INTRO],
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
  contact: {
    english: PUBLIC_EMAIL
      ? `You can reach out to me by email at ${PUBLIC_EMAIL}. If you want, you can also connect with me on LinkedIn${LINKEDIN_URL ? `: ${LINKEDIN_URL}` : "."}`
      : "You can connect with me through the public contact details shared on this portfolio.",
    filipino: PUBLIC_EMAIL
      ? `Pwede mo akong i-contact sa email na ${PUBLIC_EMAIL}. If you want, pwede rin tayong mag-connect sa LinkedIn${LINKEDIN_URL ? `: ${LINKEDIN_URL}` : "."}`
      : "Pwede mo akong i-contact gamit ang public contact details na nasa portfolio na ito.",
    taglish: PUBLIC_EMAIL
      ? `You can reach out to me by email at ${PUBLIC_EMAIL}. If you want, you can also connect with me on LinkedIn${LINKEDIN_URL ? `: ${LINKEDIN_URL}` : "."}`
      : "You can connect with me through the public contact details shared on this portfolio.",
  },
  currentEmployer: {
    english: CURRENT_ROLE
      ? `I’m currently working as ${CURRENT_ROLE}.`
      : "I’m currently working in a Python development role focused on process improvement and automation.",
    filipino: CURRENT_ROLE
      ? `Sa ngayon, ${CURRENT_ROLE} ako.`
      : "Sa ngayon, nasa Python development role ako na focused sa process improvement at automation.",
    taglish: CURRENT_ROLE
      ? `I’m currently working as ${CURRENT_ROLE}.`
      : "Sa ngayon, nasa Python development role ako focused on process improvement and automation.",
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

const DISPLAY_NAME = PROFILE_IDENTITY.assistantName;
const FORMAL_NAME = PROFILE_IDENTITY.ownerName;

function normalizeForIntentMatching(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
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
      "what's your name",
      "what is your name",
      "whats your name",
      "ano name mo",
      "ano pangalan mo",
      "pangalan mo",
      "your name",
      "name mo",
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
      "jasond ai ka ba",
    ])
  ) {
    if (
      includesAny(normalizedText, [
        "what's your name",
        "what is your name",
        "whats your name",
        "ano name mo",
        "ano pangalan mo",
        "pangalan mo",
        "your name",
        "name mo",
      ])
    ) {
      return {
        answer: pickVariant(
          SAFE_INTENT_RESPONSES.name[languageStyle].map((item) =>
            item
              .replaceAll("Jasond Delos Santos", DISPLAY_NAME)
              .replaceAll("Jasond V. Delos Santos", FORMAL_NAME)
          ),
          text
        ),
      };
    }

    if (
      includesAny(normalizedText, [
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
              .replaceAll("JasonD AI", DISPLAY_NAME)
              .replaceAll("Jasond Delos Santos", DISPLAY_NAME)
              .replaceAll("Jasond V. Delos Santos", FORMAL_NAME)
          ),
          text
        ),
      };
    }

    return {
      answer: pickVariant(
        SAFE_INTENT_RESPONSES.identity[languageStyle].map((item) =>
          item
            .replaceAll("JasonD AI", DISPLAY_NAME)
            .replaceAll("Jasond Delos Santos", DISPLAY_NAME)
            .replaceAll("Jasond V. Delos Santos", FORMAL_NAME)
        ),
        text
      ),
    };
  }

  if (
    includesAny(normalizedText, [
      "who are you",
      "sino ka",
    ])
  ) {
    return null;
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
    includesAny(text, [
      "how to connect with you",
      "how can i connect with you",
      "how can i contact you",
      "how do i contact you",
      "how can i reach you",
      "how do i reach you",
      "contact you",
      "reach you",
      "connect with you",
      "email you",
      "your email",
      "linkedin",
      "contact details",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.contact[languageStyle] };
  }

  if (
    includesAny(normalizedText, [
      " current employer ",
      " current company ",
      " current role ",
      " who is your current employer ",
      " who's your current employer ",
      " what is your current company ",
      " where do you work now ",
      " where are you working now ",
      " saan ka nagwowork ngayon ",
      " saan ka nagtatrabaho ngayon ",
      " current work mo ",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.currentEmployer[languageStyle] };
  }

  if (
    includesAny(normalizedText, [
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
