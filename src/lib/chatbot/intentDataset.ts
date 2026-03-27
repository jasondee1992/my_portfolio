import intentDatasetJson from "@/data/knowledge/chatbot-intent-dataset.json";

export type IntentScopeType = "in_scope" | "conversational" | "follow_up" | "out_of_scope";

export type StructuredIntentCategory =
  | "open_conversation"
  | "reaction_or_emotion"
  | "acknowledgment"
  | "accept_previous_offer"
  | "reject_previous_offer"
  | "self_intro"
  | "current_role"
  | "work_experience"
  | "professional_background"
  | "strongest_skills"
  | "strengths_as_developer"
  | "recruiter_hr_questions"
  | "tech_stack"
  | "projects_summary"
  | "best_project"
  | "proudest_project"
  | "work_availability"
  | "freelance_availability"
  | "contact_info"
  | "goals_in_five_years"
  | "passions"
  | "hobbies_or_free_time"
  | "role_fit_skills"
  | "why_apply"
  | "motivation_for_role"
  | "ai_experience"
  | "react_experience"
  | "bedrock_experience"
  | "ai_tools_experience"
  | "local_llm_experience"
  | "open_model_familiarity"
  | "out_of_scope_question";

export type StructuredIntentEntry = {
  category: StructuredIntentCategory;
  scopeType: IntentScopeType;
  answerSourcePriority: string[];
  exampleQuestions: string[];
  answerDirection: string;
};

export const STRUCTURED_INTENT_DATASET =
  intentDatasetJson as StructuredIntentEntry[];

export function getIntentEntry(category: StructuredIntentCategory) {
  return STRUCTURED_INTENT_DATASET.find((entry) => entry.category === category) ?? null;
}

export function getIntentExamples(category: StructuredIntentCategory) {
  return getIntentEntry(category)?.exampleQuestions ?? [];
}

export function getIntentAnswerSourcePriority(category: StructuredIntentCategory) {
  return getIntentEntry(category)?.answerSourcePriority ?? [];
}
