export const PROJECT_TECH_ICON_MAP: Record<string, string> = {
  Python: "/icons/skills/python.svg",
  Pandas: "/icons/skills/Pandas.svg",
  NumPy: "/icons/skills/Pandas.svg",
  Snowflake: "/icons/skills/snowflakes.svg",
  SQLite: "/icons/skills/SQLite.svg",
  Dash: "/icons/skills/plotly_dash.svg",
  "Web Scraping": "/icons/skills/automation.svg",
  "REST API": "/icons/skills/FastAPI.svg",
  NoSQL: "/icons/skills/NoSQL.svg",
  React: "/icons/skills/react.svg",
  PostgreSQL: "/icons/skills/PostgreSQL.svg",
  Django: "/icons/skills/Django.svg",
  "Next.js": "/icons/skills/react.svg",
  "AI Agent": "/icons/skills/ai.svg",
  AI: "/icons/skills/ai.svg",
  RAG: "/icons/skills/rag.svg",
};

export function getProjectTechIcon(tag: string) {
  return PROJECT_TECH_ICON_MAP[tag] ?? "/icons/skills/automation.svg";
}
