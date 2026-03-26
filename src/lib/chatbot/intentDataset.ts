export type IntentScopeType = "in_scope" | "conversational" | "follow_up" | "out_of_scope";

export type StructuredIntentCategory =
  | "open_conversation"
  | "self_intro"
  | "current_role"
  | "work_experience"
  | "professional_background"
  | "strongest_skills"
  | "strengths_as_developer"
  | "tech_stack"
  | "projects_summary"
  | "best_project"
  | "proudest_project"
  | "recruiter_hr_questions"
  | "work_availability"
  | "freelance_availability"
  | "ai_experience"
  | "react_experience"
  | "bedrock_experience"
  | "local_llm_experience"
  | "open_model_familiarity"
  | "contact_info"
  | "acknowledgment"
  | "reaction_or_emotion"
  | "accept_previous_offer"
  | "out_of_scope_question";

export type StructuredIntentEntry = {
  category: StructuredIntentCategory;
  scopeType: IntentScopeType;
  answerSource: string[];
  exampleQuestions: string[];
};

export const STRUCTURED_INTENT_DATASET: StructuredIntentEntry[] = [
  {
    category: "open_conversation",
    scopeType: "conversational",
    answerSource: ["safeIntent:help", "persona", "profile"],
    exampleQuestions: [
      "what do you want to discuss",
      "what can we talk about",
      "what can i ask you about",
      "what topics can i ask you about",
      "anong pwede kong itanong",
      "ano ba gusto mong pag usapan",
      "ano pwede nating pag usapan",
      "anong pwede mong sagutin",
    ],
  },
  {
    category: "self_intro",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "about"],
    exampleQuestions: [
      "tell me about yourself",
      "introduce yourself",
      "can you tell me about yourself",
      "self intro",
      "pakilala ka",
      "pakilala ka nga",
    ],
  },
  {
    category: "current_role",
    scopeType: "in_scope",
    answerSource: ["profile", "experience", "persona", "about"],
    exampleQuestions: [
      "what is your current role",
      "what do you do now",
      "what is your current job",
      "current position mo ngayon",
      "ano current role mo",
      "anong role mo ngayon",
    ],
  },
  {
    category: "work_experience",
    scopeType: "in_scope",
    answerSource: ["experience", "about", "profile", "persona-faq"],
    exampleQuestions: [
      "what is your work experience",
      "tell me about your work experience",
      "what kind of experience do you have",
      "professional experience mo",
      "ano work experience mo",
      "experience mo",
    ],
  },
  {
    category: "professional_background",
    scopeType: "in_scope",
    answerSource: ["about", "experience", "profile", "persona-faq"],
    exampleQuestions: [
      "what is your professional background",
      "what roles have you had",
      "career background mo",
      "work history mo",
      "anong background mo sa work",
      "what is your background",
    ],
  },
  {
    category: "strongest_skills",
    scopeType: "in_scope",
    answerSource: ["homepage", "about", "profile", "persona-faq"],
    exampleQuestions: [
      "what are your strongest skills",
      "what are your top skills",
      "main skills mo",
      "best skills mo",
      "ano strongest skills mo",
      "what about your skills",
    ],
  },
  {
    category: "strengths_as_developer",
    scopeType: "in_scope",
    answerSource: ["about", "profile", "persona-faq"],
    exampleQuestions: [
      "what are your strengths as a developer",
      "developer strengths",
      "what makes you strong as a developer",
      "strength mo as developer",
      "why are you a strong developer",
    ],
  },
  {
    category: "tech_stack",
    scopeType: "in_scope",
    answerSource: ["homepage", "about", "profile", "projects-overview"],
    exampleQuestions: [
      "what is your tech stack",
      "what technologies do you use",
      "what tools do you use",
      "what stack do you use most",
      "anong tech stack mo",
      "ano stack mo",
    ],
  },
  {
    category: "projects_summary",
    scopeType: "in_scope",
    answerSource: ["projects-overview", "project-highlight", "internal-project", "other-work"],
    exampleQuestions: [
      "tell me about your projects",
      "what projects have you built",
      "project summary",
      "ano projects mo",
      "what have you built so far",
      "how about your projects",
    ],
  },
  {
    category: "best_project",
    scopeType: "in_scope",
    answerSource: ["project-highlight", "internal-project", "projects-overview"],
    exampleQuestions: [
      "what is your best project",
      "which project is your best",
      "best project mo",
      "which of your projects stands out most",
    ],
  },
  {
    category: "proudest_project",
    scopeType: "in_scope",
    answerSource: ["project-highlight", "internal-project", "projects-overview"],
    exampleQuestions: [
      "what project are you most proud of",
      "what project are you proudest of",
      "most proud project",
      "project na pinaka proud ka",
    ],
  },
  {
    category: "recruiter_hr_questions",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "about", "experience", "profile"],
    exampleQuestions: [
      "why should we hire you",
      "what makes you a good fit for this role",
      "what can you bring to this position",
      "what value can you add to the company",
      "bakit ka namin dapat i hire",
      "ano maiaambag mo sa role na to",
      "what makes you a strong candidate",
    ],
  },
  {
    category: "work_availability",
    scopeType: "in_scope",
    answerSource: ["persona", "persona-faq", "profile"],
    exampleQuestions: [
      "are you open for a new role",
      "are you open to new opportunities",
      "are you available for a new position",
      "are you open to full-time roles",
      "are you open for work",
      "open ka ba sa new role",
      "open ka ba sa new opportunities",
    ],
  },
  {
    category: "freelance_availability",
    scopeType: "in_scope",
    answerSource: ["persona", "persona-faq", "profile"],
    exampleQuestions: [
      "are you open to freelance work",
      "are you available for freelance",
      "are you open to project-based work",
      "open ka ba sa freelance",
      "open ka ba sa freelance work",
      "open ka ba sa project based work",
    ],
  },
  {
    category: "ai_experience",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "about", "project-highlight"],
    exampleQuestions: [
      "what ai experience do you have",
      "what llm experience do you have",
      "tell me about your ai experience",
      "what ai stack have you explored",
      "anong ai experience mo",
      "anong llm experience mo",
    ],
  },
  {
    category: "react_experience",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "about", "internal-project"],
    exampleQuestions: [
      "do you have react experience",
      "how many years of react experience do you have",
      "what is your react experience",
      "do you use react for frontend work",
      "anong experience mo sa react",
      "ilang years ka na sa react",
    ],
  },
  {
    category: "bedrock_experience",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "project-highlight", "internal-project"],
    exampleQuestions: [
      "do you have amazon bedrock experience",
      "have you used amazon bedrock",
      "how did you use amazon bedrock",
      "have you used bedrock in a project",
      "may experience ka ba sa amazon bedrock",
      "paano mo nagamit ang amazon bedrock",
    ],
  },
  {
    category: "local_llm_experience",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "about"],
    exampleQuestions: [
      "have you tried local llms",
      "have you worked with local models",
      "what local models have you used",
      "what models have you tried locally",
      "may experience ka ba sa local llm",
      "nakapag deploy ka na ba ng local model",
    ],
  },
  {
    category: "open_model_familiarity",
    scopeType: "in_scope",
    answerSource: ["persona-faq", "persona", "profile", "about"],
    exampleQuestions: [
      "have you tried mistral",
      "do you know meta llama",
      "have you used qwen",
      "have you explored tinyllama",
      "do you have experience with deepseek",
      "may experience ka ba sa llama or mistral",
    ],
  },
  {
    category: "contact_info",
    scopeType: "in_scope",
    answerSource: ["profile", "persona", "persona-faq"],
    exampleQuestions: [
      "how can i contact you",
      "what is your email",
      "how do i reach you",
      "contact details mo",
      "paano kita macocontact",
      "ano email mo",
    ],
  },
  {
    category: "acknowledgment",
    scopeType: "conversational",
    answerSource: ["safeIntent:acknowledgment"],
    exampleQuestions: [
      "okay",
      "noted",
      "sige",
      "got it",
      "ayos",
      "copy",
    ],
  },
  {
    category: "reaction_or_emotion",
    scopeType: "conversational",
    answerSource: ["safeIntent:positiveReaction", "safeIntent:laughter", "safeIntent:status"],
    exampleQuestions: [
      "nice",
      "wow",
      "haha",
      "hehe",
      "ang galing",
      "cool",
      "kamusta",
    ],
  },
  {
    category: "accept_previous_offer",
    scopeType: "follow_up",
    answerSource: ["followUpResolver"],
    exampleQuestions: [
      "yes please",
      "sure go ahead",
      "tell me more",
      "continue",
      "sige",
      "kwento mo",
    ],
  },
  {
    category: "out_of_scope_question",
    scopeType: "out_of_scope",
    answerSource: ["buildOutOfScopeFallback"],
    exampleQuestions: [
      "what is the capital of france",
      "solve this physics problem",
      "who won the nba finals",
      "tell me a random joke about aliens",
      "anong weather bukas sa cebu",
    ],
  },
];

export function getIntentEntry(category: StructuredIntentCategory) {
  return STRUCTURED_INTENT_DATASET.find((entry) => entry.category === category) ?? null;
}

export function getIntentExamples(category: StructuredIntentCategory) {
  return getIntentEntry(category)?.exampleQuestions ?? [];
}
