import { getIntentExamples } from "@/lib/chatbot/intentDataset";

type QuestionScopeType = "portfolio" | "personal" | "tech" | "outside";
type LanguageStyle = "english" | "filipino" | "taglish";
type ProfileQuestionCategory =
  | "self_intro"
  | "current_role"
  | "work_experience"
  | "professional_background"
  | "strongest_skills"
  | "strengths_as_developer"
  | "recruiter_hr_questions"
  | "role_fit_skills"
  | "tech_stack"
  | "ai_experience"
  | "react_experience"
  | "bedrock_experience"
  | "ai_tools_experience"
  | "local_llm_experience"
  | "open_model_familiarity"
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

const KNOWLEDGE_CATEGORY_PRIORITY: Record<string, number> = {
  homepage: 1,
  about: 2,
  "projects-overview": 3,
  "project-highlight": 3,
  "internal-project": 3,
  "other-work": 3,
  experience: 4,
  education: 4,
  profile: 5,
  persona: 6,
  "persona-faq": 7,
};

const PORTFOLIO_SIGNALS = [
  "portfolio",
  "who are you",
  "introduce yourself",
  "short intro",
  "short introduction",
  "quick intro",
  "about you",
  "about yourself",
  "your background",
  "your experience",
  "work experience",
  "total work experience",
  "industry experience",
  "python experience",
  "python background",
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
  "current employer",
  "current role",
  "what do you do now",
  "what do you do",
  "what kind of work do you do",
  "profile",
  "work profile",
  "contact details",
  "contact email",
  "email address",
  "preferred contact method",
  "reach out",
  "reach you",
  "get in touch",
  "best way to reach",
  "certification",
  "certifications",
  "availability",
  "available for work",
  "open to work",
  "open to full time",
  "open to full-time",
  "open to relocation",
  "relocation",
  "relocate",
  "work abroad",
  "working abroad",
  "outside your country",
  "overseas opportunities",
  "moving overseas",
  "move overseas",
  "overseas",
  "new opportunities",
  "opportunities",
  "new role",
  "full time roles",
  "full-time roles",
  "freelance",
  "freelance work",
  "contract work",
  "project based work",
  "project-based work",
  "roles are you looking for",
  "looking for roles",
  "senior level",
  "mid level",
  "mid-level",
  "current level",
  "ai experience",
  "data engineering experience",
  "llm experience",
  "aws",
  "aws experience",
  "cloud",
  "cloud experience",
  "cloud deployment",
  "cloud hosting",
  "amplify",
  "ci cd",
  "ci/cd",
  "deployment pipeline",
  "aws amplify",
  "amazon s3",
  "s3",
  "route 53",
  "acm",
  "certificate manager",
  "cloudwatch",
  "iam",
  "cloudfront",
  "rds",
  "aurora",
  "dynamodb",
  "aws architect",
  "cloud architect",
  "cloud architecture",
  "full stack",
  "full-stack",
  "typescript",
  "javascript",
  "dash",
  "fastapi",
  "backend experience",
  "backend services",
  "rest api",
  "frontend experience",
  "frontend development",
  "backend technologies",
  "frontend technologies",
  "end to end applications",
  "end-to-end applications",
  "internal tools",
  "dashboard",
  "dashboards",
  "automation work",
  "intelligent tools",
  "workflow automation",
  "career",
  "education",
  "open to new opportunities",
  "open for a new role",
  "open to a new role",
  "open for work",
  "available for a new position",
  "open to full time roles",
  "open to full-time roles",
  "freelance work",
  "project based work",
  "project-based work",
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
  "how many years in it",
  "how many years in python",
  "how experienced are you",
  "total work experience",
  "industry experience",
  "python experience",
  "python background",
  "background",
  "professional background",
  "career background",
  "work history",
  "career history",
  "projects",
  "project",
  "internal tools",
  "internal tool",
  "dashboard",
  "dashboards",
  "automation work",
  "workflow automation",
  "skills",
  "skill",
  "tech stack",
  "full stack",
  "full-stack",
  "current company",
  "current employer",
  "email",
  "email address",
  "preferred contact method",
  "reach out",
  "reach you",
  "best way to reach",
  "certification",
  "certifications",
  "availability",
  "contract work",
  "roles are you looking for",
  "looking for roles",
  "contact info",
  "contact details",
  "senior level",
  "mid level",
  "mid-level",
  "current level",
  "relocation",
  "relocate",
  "work abroad",
  "working abroad",
  "outside your country",
  "overseas opportunities",
  "moving overseas",
  "move overseas",
  "overseas",
  "opportunities",
  "new opportunities",
  "new role",
  "freelance",
  "freelance work",
  "full time",
  "full-time",
  "ai experience",
  "llm experience",
  "aws",
  "aws experience",
  "cloud",
  "cloud experience",
  "cloud deployment",
  "cloud hosting",
  "amplify",
  "ci cd",
  "ci/cd",
  "deployment pipeline",
  "aws amplify",
  "amazon s3",
  "s3",
  "route 53",
  "acm",
  "certificate manager",
  "cloudwatch",
  "iam",
  "cloudfront",
  "rds",
  "aurora",
  "dynamodb",
  "aws architect",
  "cloud architect",
  "cloud architecture",
  "react",
  "typescript",
  "javascript",
  "dash",
  "fastapi",
  "frontend",
  "frontend development",
  "backend",
  "backend experience",
  "backend services",
  "rest api",
  "frontend experience",
  "backend technologies",
  "frontend technologies",
  "end to end applications",
  "end-to-end applications",
  "amazon bedrock",
  "bedrock",
  "openai api",
  "hugging face",
  "ai tools",
  "ai platforms",
  "ai stack",
  "intelligent tools",
  "llm",
  "local llm",
  "local model",
  "local models",
  "open model",
  "open models",
  "mistral",
  "llama",
  "meta llama",
  "qwen",
  "tinyllama",
  "deepseek",
  "open to opportunities",
  "new opportunities",
  "new role",
  "full time role",
  "full-time role",
  "full time roles",
  "full-time roles",
  "freelance",
  "freelance work",
  "project based work",
  "project-based work",
  "available for work",
  "roles",
  "roles have you had",
].map((item) => item.toLowerCase());

const PROFILE_FOLLOW_UP_SIGNALS = [
  "how about",
  "what about",
  "tell me about",
  "tell me more about",
  "can you share",
  "share more about",
  "share some of",
  "show more of",
  "talk more about",
  "walk me through",
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
      ...getIntentExamples("self_intro"),
      "tell me about yourself",
      "can you tell me about yourself",
      "tell me something about yourself",
      "introduce yourself",
      "can you introduce yourself",
      "who are you",
      "give me a short intro",
      "give me a quick intro",
      "give me a short introduction",
      "can you give me a quick intro",
      "can you tell me a bit about yourself",
      "what kind of professional are you",
      "self intro",
      "pakilala ka",
      "pakilala ka nga",
    ],
    preferredKnowledgeCategories: ["homepage", "about", "profile", "persona", "persona-faq"],
  },
  {
    category: "current_role",
    patterns: [
      ...getIntentExamples("current_role"),
      "current role",
      "current position",
      "current company",
      "current employer",
      "what do you do now",
      "what do you do",
      "what kind of work do you do",
      "what is your current role",
      "what is your current job",
      "what do you do for work",
      "where do you work now",
      "where are you currently working",
      "who do you work for now",
      "what company are you with now",
      "what is your current company",
      "ano current role mo",
      "anong role mo ngayon",
      "saan ka nagwowork ngayon",
    ],
    preferredKnowledgeCategories: ["profile", "experience", "about", "persona", "persona-faq"],
  },
  {
    category: "work_experience",
    patterns: [
      ...getIntentExamples("work_experience"),
      "work experience",
      "professional experience",
      "how many years of experience do you have",
      "how many years have you been working",
      "how long have you been working",
      "how long have you worked in tech",
      "how many years in it",
      "how many years in python",
      "how experienced are you",
      "what is your total work experience",
      "how many years have you been in software development",
      "how many years of industry experience do you have",
      "how long have you been in the it industry",
      "what is your overall experience level",
      "how long have you been using python",
      "what is your python experience",
      "are you experienced in python",
      "how strong is your python background",
      "is python your main programming language",
      "what kind of python work have you done",
      "how many years have you worked with python",
      "do you mainly work in python",
      "how comfortable are you with python",
      "how much experience do you have",
      "what is your work experience",
      "tell me about your work experience",
      "can you share your work experience",
      "how about work experience",
      "what about work experience",
      "how about your work experience",
      "what about your work experience",
      "what kind of experience do you have",
      "what is your professional experience",
      "can you share your background and experience",
      "career so far",
      "ano work experience mo",
      "ano experience mo",
      "ilang years of experience mo",
      "ilang taon ka nang working",
      "experience mo",
    ],
    preferredKnowledgeCategories: ["experience", "about", "homepage", "profile", "persona-faq"],
  },
  {
    category: "professional_background",
    patterns: [
      ...getIntentExamples("professional_background"),
      "professional background",
      "career background",
      "work history",
      "career history",
      "what is your background",
      "what's your professional background",
      "what's your career background",
      "anong background mo sa work",
      "what kind of professional are you",
      "what roles have you had",
      "what is your professional background",
      "walk me through your background",
      "what is your work background",
    ],
    preferredKnowledgeCategories: ["about", "experience", "homepage", "profile", "persona-faq"],
  },
  {
    category: "strongest_skills",
    patterns: [
      ...getIntentExamples("strongest_skills"),
      "strongest skills",
      "what are your strongest skills",
      "what are your main skills",
      "top skills",
      "main skills",
      "what skills are you strongest in",
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
      ...getIntentExamples("strengths_as_developer"),
      "strengths as a developer",
      "what are your strengths as a developer",
      "developer strengths",
      "what makes you strong as a developer",
      "what are your strengths",
      "what makes you effective as a developer",
      "strength mo as developer",
    ],
    preferredKnowledgeCategories: ["about", "homepage", "profile", "persona", "persona-faq"],
  },
  {
    category: "recruiter_hr_questions",
    patterns: [
      ...getIntentExamples("recruiter_hr_questions"),
      "why are you a good fit for this role",
      "why are you a good fit for this position",
      "what makes you a strong candidate for this role",
      "why would you be a good hire",
      "why are you a strong fit for this team",
      "would you consider yourself senior level",
      "do you think your skills are senior level",
      "what level would you describe yourself at",
      "are you more mid level or senior",
      "are you more mid-level or senior",
      "how would you describe your current level",
      "are you qualified for senior roles",
      "do you think you are ready for senior developer roles",
      "how strong is your professional experience overall",
      "what kind of level of role are you targeting",
      "are you comfortable with senior responsibilities",
      "how do your skills fit this role",
      "how are you fit for this role",
      "bakit ka fit sa role na to",
      "bakit ka bagay sa position na to",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "about",
      "experience",
      "homepage",
      "profile",
      "project-highlight",
      "internal-project",
      "other-work",
    ],
  },
  {
    category: "role_fit_skills",
    patterns: [
      ...getIntentExamples("role_fit_skills"),
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
      ...getIntentExamples("tech_stack"),
      "tech stack",
      "what is your tech stack",
      "what technologies do you use",
      "what tools do you use",
      "what tools do you work with",
      "what tools do you usually work with",
      "what platforms have you used",
      "what technologies are you most comfortable with",
      "what tools are part of your usual workflow",
      "what technical areas are you strongest in",
      "what stack do you usually use for projects",
      "what stack do you use most",
      "main technologies",
      "core stack",
      "what is your stack",
      "do you do full stack development",
      "do you do full-stack development",
      "do you have full-stack experience",
      "do you build full-stack apps",
      "can you handle both frontend and backend",
      "do you have frontend experience",
      "do you have backend experience",
      "are you more backend or frontend",
      "what do you use for frontend development",
      "what frontend technologies do you use",
      "what backend technologies do you use",
      "have you worked with react",
      "have you worked with dash",
      "have you built dashboards",
      "what ui technologies do you use",
      "can you build interactive web interfaces",
      "do you have experience with typescript",
      "do you have experience with javascript",
      "what kind of frontend work have you done",
      "can you create modern web uis",
      "do you build apis",
      "have you worked on backend services",
      "can you develop backend systems",
      "what kind of backend work have you done",
      "do you have rest api experience",
      "have you worked with fastapi",
      "what kind of business logic have you implemented",
      "can you build data-driven applications",
      "do you work with databases in your applications",
      "have you handled application logic end to end",
      "can you build end to end applications",
      "can you build end-to-end applications",
      "do you have aws experience",
      "what is your aws experience",
      "how many years of experience do you have in aws",
      "how many years of aws experience do you have",
      "what is your cloud experience",
      "have you deployed apps on aws",
      "do you work with ci cd",
      "do you work with ci/cd",
      "do you have ci cd deployment experience on aws",
      "what aws services do you know",
      "what is your experience with aws amplify",
      "what do you know about s3",
      "what do you know about route 53",
      "what do you know about cloudwatch",
      "what do you know about iam",
      "what do you know about cloudfront",
      "do you have deployment experience",
      "have you set up automated deployments",
      "do you know route 53",
      "do you know acm",
      "do you know cloudwatch",
      "do you know iam",
      "do you know cloudfront",
      "what do you know about rds",
      "what do you know about aurora",
      "what do you know about dynamodb",
      "what do you know about rds aurora dynamodb and s3",
      "are you an aws architect",
      "do you have deep cloud architecture experience",
      "anong tech stack mo",
      "ano stack mo",
    ],
    preferredKnowledgeCategories: [
      "profile",
      "experience",
      "about",
      "other-work",
      "persona-faq",
      "homepage",
      "projects-overview",
      "internal-project",
    ],
  },
  {
    category: "ai_experience",
    patterns: [
      ...getIntentExamples("ai_experience"),
      "ai experience",
      "llm experience",
      "what ai background do you have",
      "tell me about your llm background",
      "how much ai exposure do you have",
      "do you have ai experience",
      "what automation work have you done",
      "do you have data engineering experience",
      "what ai related work have you done",
      "have you built intelligent tools",
      "do you work with workflow automation",
      "what kind of ai projects have you explored",
      "do you have experience with process automation",
      "have you worked on data workflows",
      "have you built ai tools",
      "have you worked on ai enabled tools",
      "anong ai background mo",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "about",
      "project-highlight",
      "internal-project",
      "other-work",
    ],
  },
  {
    category: "react_experience",
    patterns: [
      ...getIntentExamples("react_experience"),
      "react experience",
      "experience with react",
      "react frontend experience",
      "do you have react experience",
      "do you have experience in react frontend",
      "do you have experience with react frontend",
      "do you have frontend experience",
      "how many years of react experience do you have",
      "what is your react experience",
      "have you worked with react",
      "have you used react",
      "do you use react for frontend work",
      "have you done frontend work with react",
      "what frontend frameworks have you used",
      "which frontend frameworks have you used",
      "what frontend technologies have you used",
      "what frontend technologies do you use",
      "have you worked with dash",
      "have you built dashboards",
      "what ui technologies do you use",
      "can you build interactive web interfaces",
      "do you have experience with typescript",
      "do you have experience with javascript",
      "what kind of frontend work have you done",
      "can you create modern web uis",
      "anong experience mo sa react",
      "ilang years ka na sa react",
      "may experience ka ba sa react",
      "gumamit ka na ba ng react",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "about",
      "internal-project",
      "project-highlight",
      "projects-overview",
    ],
  },
  {
    category: "bedrock_experience",
    patterns: [
      ...getIntentExamples("bedrock_experience"),
      "amazon bedrock experience",
      "bedrock experience",
      "do you have amazon bedrock experience",
      "have you used amazon bedrock",
      "have you used bedrock",
      "what is your experience with amazon bedrock",
      "what is your bedrock experience",
      "how did you use amazon bedrock",
      "have you used bedrock in a project",
      "have you used amazon bedrock in a project",
      "may experience ka ba sa amazon bedrock",
      "paano mo nagamit ang amazon bedrock",
      "gumamit ka na ba ng bedrock",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "project-highlight",
      "internal-project",
      "about",
    ],
  },
  {
    category: "ai_tools_experience",
    patterns: [
      ...getIntentExamples("ai_tools_experience"),
      "what ai tools have you used",
      "what ai platforms do you have experience with",
      "what ai platforms have you explored",
      "what ai tools have you explored",
      "what ai stack have you explored",
      "what ai experience do you have",
      "what llm experience do you have",
      "have you worked with openai api",
      "have you used openai api",
      "have you used hugging face models",
      "have you used hugging face local models",
      "what llm tools have you tried",
      "anong ai tools ang nagamit mo",
      "anong ai platforms ang may experience ka",
      "anong llm tools ang na try mo",
      "ano ai experience mo",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "about",
      "project-highlight",
      "internal-project",
      "other-work",
    ],
  },
  {
    category: "local_llm_experience",
    patterns: [
      ...getIntentExamples("local_llm_experience"),
      "local llm experience",
      "have you tried local llms",
      "have you deployed a local model",
      "what local models have you used",
      "have you run llms on your own machine",
      "have you run models on your own machine",
      "have you worked with local models",
      "have you tried local models",
      "what models have you tried locally",
      "have you done local llm setup",
      "may experience ka ba sa local llm",
      "nakapag deploy ka na ba ng local model",
      "anong local models na try mo na",
      "nakapag run ka na ba ng llm sa own machine mo",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "about",
    ],
  },
  {
    category: "open_model_familiarity",
    patterns: [
      ...getIntentExamples("open_model_familiarity"),
      "have you tried mistral",
      "do you know meta llama",
      "have you used qwen",
      "have you explored tinyllama",
      "do you have experience with deepseek",
      "have you tried llama",
      "have you tried meta llama",
      "what open models have you explored",
      "what open models have you tried",
      "which open models have you explored",
      "which open models have you tried",
      "anong open models ang na try mo na",
      "may experience ka ba sa llama or mistral",
      "may experience ka ba sa deepseek",
      "may experience ka ba sa qwen",
    ],
    preferredKnowledgeCategories: [
      "persona-faq",
      "persona",
      "profile",
      "about",
    ],
  },
  {
    category: "projects_summary",
    patterns: [
      ...getIntentExamples("projects_summary"),
      "what projects have you built",
      "tell me about your projects",
      "tell me about your portfolio project",
      "what projects do you have",
      "can you share some of your work",
      "what kind of tools have you built",
      "what is your portfolio about",
      "what kind of systems have you built",
      "what internal tools have you built",
      "what dashboards have you built",
      "what are your best projects",
      "what are some examples of your work",
      "what type of applications have you created",
      "can you tell me about your portfolio projects",
      "what kinds of internal tools have you built",
      "can you show more of your work",
      "can you share more about your work",
      "what else have you built",
      "can you talk more about your portfolio",
      "what other projects have you worked on",
      "can you tell me more about your internal tools",
      "can you share more about your dashboards",
      "what kind of solutions have you delivered",
      "can you walk me through your projects",
      "what work are you most proud of",
      "tell me about your internal tools",
      "tell me about your automation work",
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
      ...getIntentExamples("best_project"),
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
      ...getIntentExamples("proudest_project"),
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
      ...getIntentExamples("passions"),
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
      ...getIntentExamples("hobbies_or_free_time"),
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
      ...getIntentExamples("goals_in_five_years"),
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
      ...getIntentExamples("why_apply"),
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
      ...getIntentExamples("motivation_for_role"),
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
      ...getIntentExamples("work_availability"),
      "open to new opportunities",
      "open to work",
      "open for work",
      "available for work",
      "are you open to work",
      "are you open for a new role",
      "are you open to a new role",
      "are you open for a new position",
      "are you available for a new position",
      "are you currently open to opportunities",
      "are you currently looking for opportunities",
      "are you open to opportunities",
      "looking for opportunities",
      "are you open to new opportunities",
      "are you open to work",
      "are you open to relocation",
      "would you relocate for a job",
      "are you willing to work abroad",
      "are you open to opportunities outside your country",
      "are you open to overseas opportunities",
      "are you open to moving overseas",
      "are you willing to move for the right role",
      "are you open to international opportunities",
      "would you consider relocating overseas",
      "are you open to moving abroad for work",
      "are you willing to relocate for a developer role",
      "what kind of roles would you relocate for",
      "available for full time",
      "available for full-time",
      "open for full time",
      "open for full-time",
      "are you open to full time roles",
      "are you open to full-time roles",
      "what roles are you looking for",
      "what kind of roles are you looking for",
      "what opportunities are you interested in",
      "are you available for discussions with recruiters",
      "are you looking for work",
      "are you currently looking for work",
      "open ka ba sa new role",
      "open ka ba sa new opportunities",
      "open ka ba sa opportunities",
      "open ka ba sa full time roles",
      "open ka ba sa full-time roles",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "profile"],
  },
  {
    category: "freelance_availability",
    patterns: [
      ...getIntentExamples("freelance_availability"),
      "open to freelance",
      "open to freelance work",
      "open to project based work",
      "open to project-based work",
      "freelance availability",
      "are you available for freelance",
      "available for freelance",
      "are you available for freelance work",
      "are you open to freelance projects",
      "do you take freelance work",
      "are you open to contract work",
      "are you open to freelance work",
      "are you open to freelance",
      "are you open to project based work",
      "are you open to project-based work",
      "open ka ba sa freelance",
      "open ka ba sa freelance work",
      "open ka ba sa project based work",
      "open ka ba sa project-based work",
    ],
    preferredKnowledgeCategories: ["persona", "persona-faq", "profile"],
  },
  {
    category: "contact_info",
    patterns: [
      ...getIntentExamples("contact_info"),
      "contact info",
      "contact details",
      "how can i contact you",
      "what is your email",
      "what is your email address",
      "how do i reach you",
      "how can i reach out",
      "best way to contact you",
      "what is the best way to reach you",
      "how can recruiters contact you",
      "how can recruiters reach you",
      "how can someone get in touch with you",
      "do you have a contact email",
      "where can i reach you",
      "what is your preferred contact method",
      "how should i contact you about an opportunity",
      "can i reach out to you by email",
      "paano kita macocontact",
      "ano email mo",
    ],
    preferredKnowledgeCategories: ["profile", "persona", "persona-faq"],
  },
];

const PERSONAL_SIGNALS = [
  "age",
  "how old",
  "ilang taon",
  "edad",
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

function sortKnowledgeCategories(categories: string[] = []) {
  return [...new Set(categories)].sort((left, right) => {
    const leftPriority = KNOWLEDGE_CATEGORY_PRIORITY[left] ?? 99;
    const rightPriority = KNOWLEDGE_CATEGORY_PRIORITY[right] ?? 99;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.localeCompare(right);
  });
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
      preferredKnowledgeCategories: sortKnowledgeCategories(
        matchedProfileRoute.preferredKnowledgeCategories
      ),
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
      preferredKnowledgeCategories: sortKnowledgeCategories([
        "homepage",
        "about",
        "projects-overview",
        "profile",
        "persona",
        "persona-faq",
      ]),
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

export function buildMissingInformationFallback(message: string) {
  const { coreTopic, languageStyle } = analyzeQuestionScope(message);
  const hasClearTopic = Boolean(coreTopic && coreTopic !== "topic na yan");

  const genericVariants = {
    english: [
      "I don’t have enough confirmed portfolio information to answer that precisely. If it helps, I can share a high-level summary based on what’s available here.",
      "I don’t have enough confirmed information to answer that clearly yet. If you want, I can still share a high-level summary from the available portfolio details.",
    ],
    filipino: [
      "Wala pa akong sapat na confirmed portfolio information para sagutin iyan nang eksakto. Kung gusto mo, pwede akong magbigay ng high-level summary mula sa available details dito.",
      "Hindi pa sapat ang confirmed information ko para sagutin iyan nang malinaw. Kung gusto mo, pwede pa rin akong mag-share ng high-level summary based sa available portfolio details.",
    ],
    taglish: [
      "I don’t have enough confirmed portfolio information to answer that precisely. If you want, I can still share a high-level summary based on the available details here.",
      "Hindi pa sapat ang confirmed information ko para sagutin iyan nang eksakto, pero I can still share a high-level summary from the available portfolio details.",
    ],
  };

  if (!hasClearTopic) {
    return pickVariant(genericVariants[languageStyle], message);
  }

  const topicVariants = {
    english: [
      `I don’t have enough confirmed portfolio information to answer precisely about ${coreTopic}. If it helps, I can share a high-level summary based on what’s available here.`,
      `I can’t answer that precisely about ${coreTopic} from the confirmed portfolio details I have. If you want, I can still give a high-level summary from the available information.`,
    ],
    filipino: [
      `Wala pa akong sapat na confirmed portfolio information para sagutin nang eksakto ang tungkol sa ${coreTopic}. Kung gusto mo, pwede akong magbigay ng high-level summary mula sa available details dito.`,
      `Hindi ko masasagot nang eksakto ang tungkol sa ${coreTopic} gamit lang ang confirmed portfolio details na meron ako. Kung gusto mo, pwede pa rin akong mag-share ng high-level summary.`,
    ],
    taglish: [
      `I don’t have enough confirmed portfolio information to answer precisely about ${coreTopic}. If you want, I can still share a high-level summary based on the available details here.`,
      `Hindi ko masasagot nang eksakto ang tungkol sa ${coreTopic} gamit lang ang confirmed portfolio details na meron ako, pero I can still share a high-level summary if that helps.`,
    ],
  };

  return pickVariant(topicVariants[languageStyle], message);
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
