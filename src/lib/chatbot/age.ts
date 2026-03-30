type AgeResponse = {
  answer: string;
};

const BIRTH_YEAR = 1992;
const BIRTH_MONTH = 7;
const BIRTH_DAY = 3;

function normalizeText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function hasAny(text: string, patterns: readonly string[]) {
  return patterns.some((pattern) => {
    const normalizedPattern = pattern
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return normalizedPattern ? text.includes(` ${normalizedPattern} `) : false;
  });
}

function getPhilippineDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function calculateCurrentAgeYears(now = new Date()) {
  const today = getPhilippineDateParts(now);
  let age = today.year - BIRTH_YEAR;

  if (
    today.month < BIRTH_MONTH ||
    (today.month === BIRTH_MONTH && today.day < BIRTH_DAY)
  ) {
    age -= 1;
  }

  return age;
}

function isTaglishOrFilipino(text: string) {
  return hasAny(text, [
    "ilang taon",
    "edad",
    "ilan taon",
    "ka na",
    "mo",
    "ikaw",
    "kailan",
  ]);
}

function isAgeQuestion(text: string) {
  return hasAny(text, [
    "how old are you",
    "what age are you",
    "what is your age",
    "whats your age",
    "what s your age",
    "how old is jasond",
    "how old is jasond delos santos",
    "ilang taon na si jasond",
    "ilang taon ka na",
    "ilang taon ka",
    "ano age mo",
    "anong age mo",
    "edad mo",
  ]);
}

function isBirthdateQuestion(text: string) {
  return hasAny(text, [
    "birthdate",
    "date of birth",
    "birthday",
    "dob",
    "when is your birthday",
    "what is your birthdate",
    "what is your birthday",
    "kailan birthday mo",
    "ano birthday mo",
    "anong birthday mo",
  ]);
}

export function getAgeResponse(message: string): AgeResponse | null {
  const normalizedText = normalizeText(message);

  if (!isAgeQuestion(normalizedText) && !isBirthdateQuestion(normalizedText)) {
    return null;
  }

  const age = calculateCurrentAgeYears();
  const taglish = isTaglishOrFilipino(normalizedText);

  if (isBirthdateQuestion(normalizedText)) {
    return {
      answer: taglish
        ? `${age} years old ako. Prefer ko na private muna dito ang full birthdate ko.`
        : `I'm ${age} years old. I prefer to keep my full birthdate private here.`,
    };
  }

  return {
    answer: taglish ? `${age} years old ako.` : `I'm ${age} years old.`,
  };
}
