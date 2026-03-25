import experience from "@/data/knowledge/experience.json";

type ExperienceItem = {
  company: string;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
};

type TenureResponse = {
  answer: string;
};

const EXPERIENCE_ITEMS = experience as ExperienceItem[];

function normalizeText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function hasAny(text: string, patterns: readonly string[]) {
  return patterns.some((pattern) => text.includes(` ${pattern} `));
}

function parseYearMonth(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function getMonthName(month: number) {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

function formatMonthYear(value?: string | null) {
  const parsed = parseYearMonth(value);

  if (!parsed) {
    return "";
  }

  return `${getMonthName(parsed.month)} ${parsed.year}`;
}

function formatAsOfDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationParts(startDate?: string | null, endDate?: string | null) {
  const start = parseYearMonth(startDate);

  if (!start) {
    return null;
  }

  const now = new Date();
  const end = parseYearMonth(endDate) ?? {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };

  const totalMonths = (end.year - start.year) * 12 + (end.month - start.month);

  if (totalMonths < 0) {
    return null;
  }

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
}

function formatDuration(startDate?: string | null, endDate?: string | null) {
  const duration = getDurationParts(startDate, endDate);

  if (!duration) {
    return "";
  }

  const parts: string[] = [];

  if (duration.years > 0) {
    parts.push(`${duration.years} year${duration.years === 1 ? "" : "s"}`);
  }

  if (duration.months > 0 || parts.length === 0) {
    parts.push(`${duration.months} month${duration.months === 1 ? "" : "s"}`);
  }

  return parts.join(" and ");
}

function detectTaglish(text: string) {
  return hasAny(text, [
    " ilang ",
    " taon ",
    " buwan ",
    " gaano ",
    " katagal ",
    " kana ",
    " ka na ",
    " mo ",
    " ako ",
    " sa ",
  ]);
}

function isTenureQuestion(text: string) {
  return hasAny(text, [
    " how long ",
    " tenure ",
    " stay ",
    " stayed ",
    " years ",
    " months ",
    " ilang taon ",
    " ilang years ",
    " years kana ",
    " ilang buwan ",
    " gaano katagal ",
    " years ka na ",
    " taon kana ",
    " katagal ka ",
  ]);
}

function matchExperience(normalizedText: string) {
  const currentRole = EXPERIENCE_ITEMS.find((item) => !item.end_date) ?? EXPERIENCE_ITEMS[0];

  if (
    hasAny(normalizedText, [
      " current company ",
      " current role ",
      " current work ",
      " present company ",
      " company mo ngayon ",
      " current employer ",
    ])
  ) {
    return currentRole;
  }

  const matchers: Array<{ patterns: string[]; item: ExperienceItem | undefined }> = [
    {
      patterns: [" jpmorgan ", " jp morgan ", " jpmorgan chase ", " chase co "],
      item: EXPERIENCE_ITEMS.find((item) => item.company.includes("JPMorgan")),
    },
    {
      patterns: [" weserv ", " fujitsu ", " weserv system international "],
      item: EXPERIENCE_ITEMS.find((item) => item.company.includes("Weserv")),
    },
    {
      patterns: [" go motion ", " broadcast engineer "],
      item: EXPERIENCE_ITEMS.find((item) => item.company.includes("Go Motion")),
    },
    {
      patterns: [" thermaprime ", " encoder "],
      item: EXPERIENCE_ITEMS.find((item) => item.company.includes("ThermaPrime")),
    },
  ];

  for (const matcher of matchers) {
    if (matcher.item && hasAny(normalizedText, matcher.patterns)) {
      return matcher.item;
    }
  }

  if (
    hasAny(normalizedText, [
      " current company ",
      " company mo ",
    ])
  ) {
    return currentRole;
  }

  return null;
}

export function getTenureResponse(message: string): TenureResponse | null {
  const normalizedText = normalizeText(message);

  if (!isTenureQuestion(normalizedText)) {
    return null;
  }

  const item = matchExperience(normalizedText);

  if (!item?.start_date) {
    return null;
  }

  const duration = formatDuration(item.start_date, item.end_date);

  if (!duration) {
    return null;
  }

  const startText = formatMonthYear(item.start_date);
  const endText = item.end_date ? formatMonthYear(item.end_date) : null;
  const asOfDate = formatAsOfDate();
  const taglish = detectTaglish(normalizedText);

  if (item.end_date) {
    return {
      answer: taglish
        ? `Tumagal ako sa ${item.company} nang ${duration}, from ${startText} to ${endText}.`
        : `I was with ${item.company} for ${duration}, from ${startText} to ${endText}.`,
    };
  }

  return {
    answer: taglish
      ? `As of ${asOfDate}, nasa ${item.company} na ako for ${duration} since ${startText}.`
      : `As of ${asOfDate}, I’ve been with ${item.company} for ${duration} since ${startText}.`,
  };
}
