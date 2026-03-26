export const PROJECT_TECH_ICON_MAP: Record<string, string> = {
  Python: "/icons/skills/python.webp",
  Pandas: "/icons/skills/Pandas.webp",
  NumPy: "/icons/skills/Pandas.webp",
  Snowflake: "/icons/skills/snowflakes.webp",
  SQLite: "/icons/skills/SQLite.webp",
  Dash: "/icons/skills/plotly_dash.webp",
  "Web Scraping": "/icons/skills/automation.svg",
  "REST API": "/icons/skills/FastAPI.webp",
  NoSQL: "/icons/skills/NoSQL.webp",
  React: "/icons/skills/react.webp",
  PostgreSQL: "/icons/skills/PostgreSQL.webp",
  Django: "/icons/skills/Django.webp",
  "Next.js": "/icons/skills/react.webp",
  TypeScript: "/icons/skills/TypeScript.webp",
  "Tailwind CSS": "/icons/skills/tailwind.svg",
  "OpenAI API": "/icons/skills/openai.svg",
  "AI Agent": "/icons/skills/ai.svg",
  AI: "/icons/skills/ai.svg",
  RAG: "/icons/skills/rag.svg",
};

export function getProjectTechIcon(tag: string) {
  return PROJECT_TECH_ICON_MAP[tag] ?? "/icons/skills/automation.svg";
}
