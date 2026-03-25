import personaMemory from "@/data/knowledge/persona-memory.json";
import restrictedInfo from "@/data/knowledge/restricted-info.json";

type JsonRecord = Record<string, unknown>;

const REQUIRED_PERSONA_KEYS = [
  "basic_identity",
  "preferred_introduction",
  "work_background",
  "skills_and_tech_stack",
  "communication_style",
  "personality",
  "suggestion_preferences",
  "portfolio_info",
  "safe_life_background",
  "faq",
  "response_rules",
] as const;

const REQUIRED_RESTRICTION_KEYS = [
  "blocked_topics",
  "sensitive_categories",
  "private_fields",
  "safe_answer",
  "refusal_rules",
] as const;

function assertKeys(
  data: JsonRecord,
  requiredKeys: readonly string[],
  label: string
) {
  const missingKeys = requiredKeys.filter((key) => !(key in data));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required keys in ${label}: ${missingKeys.join(", ")}`);
  }
}

export type PersonaMemory = typeof personaMemory;
export type RestrictedInfo = typeof restrictedInfo;

const parsedPersonaMemory = personaMemory as PersonaMemory;
const parsedRestrictedInfo = restrictedInfo as RestrictedInfo;

assertKeys(parsedPersonaMemory as JsonRecord, REQUIRED_PERSONA_KEYS, "persona-memory.json");
assertKeys(
  parsedRestrictedInfo as JsonRecord,
  REQUIRED_RESTRICTION_KEYS,
  "restricted-info.json"
);

export function getPersonaMemory() {
  return parsedPersonaMemory;
}

export function getRestrictedInfo() {
  return parsedRestrictedInfo;
}

export function getMissingInformationFallback() {
  return parsedRestrictedInfo.safe_answer.missing_information;
}
