type SafeIntentResult = {
  answer: string;
};

const SAFE_INTENT_RESPONSES = {
  greeting:
    "Hi, I’m JasonD AI. You can ask me about JasonD’s projects, skills, experience, education, and work background.",
  language:
    "Yes, I can understand multilingual input, including English, Tagalog, and Taglish. I reply in English by default unless you ask me to use another language.",
  identity:
    "I’m JasonD AI. I answer using JasonD’s current portfolio knowledge base.",
  help:
    "You can ask me about JasonD’s projects, skills, tech stack, work experience, education, contact details, and project highlights.",
} as const;

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

export function getSafeIntentResponse(message: string): SafeIntentResult | null {
  const text = message.toLowerCase().trim();

  if (!text) {
    return null;
  }

  if (
    includesAny(text, [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "kamusta",
      "kumusta",
      "uy",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.greeting };
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
    return { answer: SAFE_INTENT_RESPONSES.language };
  }

  if (
    includesAny(text, [
      "who are you",
      "sino ka",
      "ano ka",
      "what are you",
      "ikaw ba si jasond ai",
      "jasond ai ka ba",
    ])
  ) {
    return { answer: SAFE_INTENT_RESPONSES.identity };
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
    return { answer: SAFE_INTENT_RESPONSES.help };
  }

  return null;
}
