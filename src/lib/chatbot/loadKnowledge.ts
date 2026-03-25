import education from "@/data/knowledge/education.json";
import experience from "@/data/knowledge/experience.json";
import personaMemory from "@/data/knowledge/persona-memory.json";
import profile from "@/data/knowledge/profile.json";
import projectHighlights from "@/data/knowledge/project-highlights.json";
import projects from "@/data/knowledge/projects.json";

export type KnowledgeEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
};

type ExperienceItem = {
  company: string;
  role: string;
  date_range: string;
  location: string;
  details: string[];
};

type EducationItem = {
  degree: string;
  school: string;
  location: string;
  date_range: string;
};

type HighlightItem = {
  title: string;
  summary: string;
};

type ProjectItem = {
  no: string;
  title: string;
  role: string;
  project_type: string;
  tech_stack: string[];
  description: string;
  note?: string;
};

type ProjectsFile = {
  internal_projects: ProjectItem[];
  other_works: ProjectItem[];
};

type PersonaFaqItem = {
  question: string;
  answer: string;
};

type PersonaMemoryFile = {
  basic_identity: {
    public_name?: string;
    name: string;
    preferred_name?: string;
    role?: string;
    location?: string;
    short_summary?: string;
    public_contact_email?: string;
  };
  preferred_introduction?: Record<string, string>;
  work_background?: Record<string, unknown>;
  skills_and_tech_stack?: Record<string, unknown>;
  portfolio_info?: Record<string, unknown>;
  safe_life_background?: Record<string, unknown>;
  faq?: PersonaFaqItem[];
};

type ProfileFile = {
  assistant_name?: string;
  owner_name?: string;
  assistant_role?: string;
  assistant_short_intro?: string;
  name: string;
  professional_summary: string;
  contact: Record<string, string>;
  public_location?: string;
  core_skills: Record<string, string[]>;
};

function normalizeText(value: string) {
  return value.toLowerCase();
}

function makeKeywords(parts: string[]) {
  return parts
    .flatMap((part) =>
      normalizeText(part)
        .split(/[^a-z0-9+.#-]+/i)
        .map((item) => item.trim())
        .filter(Boolean)
    )
    .filter((item, index, array) => array.indexOf(item) === index);
}

function buildProfileEntry(profileData: ProfileFile): KnowledgeEntry {
  const skillsText = Object.entries(profileData.core_skills)
    .map(([group, items]) => `${group}: ${items.join(", ")}`)
    .join(" | ");

  const contactText = Object.entries(profileData.contact)
    .filter(([key]) => ["email", "linkedin_label", "linkedin_url"].includes(key))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");

  const content = [
    `Assistant Name: ${profileData.assistant_name ?? "JasonD AI"}`,
    `Owner Name: ${profileData.owner_name ?? profileData.name}`,
    `Assistant Role: ${profileData.assistant_role ?? "Portfolio assistant"}`,
    `Assistant Introduction: ${
      profileData.assistant_short_intro ??
      "A portfolio assistant that helps visitors explore JasonD's background, projects, skills, and experience."
    }`,
    `Name: ${profileData.name}`,
    `Public Location: ${profileData.public_location ?? ""}`,
    `Professional Summary: ${profileData.professional_summary}`,
    `Contact: ${contactText}`,
    `Core Skills: ${skillsText}`,
  ].join("\n");

  return {
    id: "profile-main",
    category: "profile",
    title: profileData.name,
    content,
    keywords: makeKeywords([
      profileData.assistant_name ?? "JasonD AI",
      profileData.owner_name ?? profileData.name,
      profileData.assistant_role ?? "Portfolio assistant",
      profileData.assistant_short_intro ??
        "A portfolio assistant that helps visitors explore JasonD's background, projects, skills, and experience.",
      profileData.name,
      profileData.public_location ?? "",
      profileData.professional_summary,
      contactText,
      skillsText,
    ]),
  };
}

function buildPersonaEntries(memory: PersonaMemoryFile): KnowledgeEntry[] {
  const introText = Object.values(memory.preferred_introduction ?? {})
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" | ");

  const identityContent = [
    `Public Name: ${memory.basic_identity.public_name ?? memory.basic_identity.name}`,
    `Preferred Name: ${memory.basic_identity.preferred_name ?? memory.basic_identity.name}`,
    `Role: ${memory.basic_identity.role ?? ""}`,
    `Public Location: ${memory.basic_identity.location ?? ""}`,
    `Short Summary: ${memory.basic_identity.short_summary ?? ""}`,
    `Public Email: ${memory.basic_identity.public_contact_email ?? ""}`,
    `Introductions: ${introText}`,
  ].join("\n");

  const publicSummaryEntry: KnowledgeEntry = {
    id: "persona-public-summary",
    category: "persona",
    title: memory.basic_identity.public_name ?? memory.basic_identity.name,
    content: identityContent,
    keywords: makeKeywords([
      memory.basic_identity.public_name ?? memory.basic_identity.name,
      memory.basic_identity.preferred_name ?? "",
      memory.basic_identity.role ?? "",
      memory.basic_identity.location ?? "",
      memory.basic_identity.short_summary ?? "",
      memory.basic_identity.public_contact_email ?? "",
      introText,
    ]),
  };

  const faqEntries = (memory.faq ?? []).map((item, index) => ({
    id: `persona-faq-${index + 1}`,
    category: "persona-faq",
    title: item.question,
    content: `Question: ${item.question}\nAnswer: ${item.answer}`,
    keywords: makeKeywords([item.question, item.answer]),
  }));

  return [publicSummaryEntry, ...faqEntries];
}

function buildExperienceEntries(items: ExperienceItem[]): KnowledgeEntry[] {
  return items.map((item, index) => {
    const detailsText = item.details.join(" ");

    return {
      id: `experience-${index + 1}`,
      category: "experience",
      title: `${item.role} at ${item.company}`,
      content: [
        `Company: ${item.company}`,
        `Role: ${item.role}`,
        `Date Range: ${item.date_range}`,
        `Location: ${item.location}`,
        `Details: ${detailsText}`,
      ].join("\n"),
      keywords: makeKeywords([
        item.company,
        item.role,
        item.date_range,
        item.location,
        detailsText,
      ]),
    };
  });
}

function buildEducationEntries(items: EducationItem[]): KnowledgeEntry[] {
  return items.map((item, index) => ({
    id: `education-${index + 1}`,
    category: "education",
    title: item.degree,
    content: [
      `Degree: ${item.degree}`,
      `School: ${item.school}`,
      `Location: ${item.location}`,
      `Date Range: ${item.date_range}`,
    ].join("\n"),
    keywords: makeKeywords([
      item.degree,
      item.school,
      item.location,
      item.date_range,
    ]),
  }));
}

function buildHighlightEntries(items: HighlightItem[]): KnowledgeEntry[] {
  return items.map((item, index) => ({
    id: `highlight-${index + 1}`,
    category: "project-highlight",
    title: item.title,
    content: `Project Highlight: ${item.title}\nSummary: ${item.summary}`,
    keywords: makeKeywords([item.title, item.summary]),
  }));
}

function buildProjectEntries(items: ProjectItem[], category: string): KnowledgeEntry[] {
  return items.map((item) => {
    const stackText = item.tech_stack.join(", ");
    const noteText = item.note ? `\nNote: ${item.note}` : "";

    return {
      id: `${category}-${item.no}`,
      category,
      title: item.title,
      content: [
        `Project No: ${item.no}`,
        `Title: ${item.title}`,
        `Role: ${item.role}`,
        `Project Type: ${item.project_type}`,
        `Tech Stack: ${stackText}`,
        `Description: ${item.description}${noteText}`,
      ].join("\n"),
      keywords: makeKeywords([
        item.no,
        item.title,
        item.role,
        item.project_type,
        stackText,
        item.description,
        item.note ?? "",
      ]),
    };
  });
}

export function loadKnowledgeBase(): KnowledgeEntry[] {
  const profileEntry = buildProfileEntry(profile as ProfileFile);
  const personaEntries = buildPersonaEntries(personaMemory as PersonaMemoryFile);
  const experienceEntries = buildExperienceEntries(experience as ExperienceItem[]);
  const educationEntries = buildEducationEntries(education as EducationItem[]);
  const highlightEntries = buildHighlightEntries(projectHighlights as HighlightItem[]);
  const projectsFile = projects as ProjectsFile;
  const internalProjectEntries = buildProjectEntries(
    projectsFile.internal_projects,
    "internal-project"
  );
  const otherWorkEntries = buildProjectEntries(projectsFile.other_works, "other-work");

  return [
    profileEntry,
    ...personaEntries,
    ...experienceEntries,
    ...educationEntries,
    ...highlightEntries,
    ...internalProjectEntries,
    ...otherWorkEntries,
  ];
}
