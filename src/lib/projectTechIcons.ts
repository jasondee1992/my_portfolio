export const PROJECT_TECH_ICON_MAP: Record<string, string> = {
  Python: "/icons/skills/python.png",
  Pandas: "/icons/skills/Pandas.png",
  NumPy: "/icons/skills/Pandas.png",
  Snowflake: "/icons/skills/snowflakes.png",
  SQLite: "/icons/skills/SQLite.png",
  Dash: "/icons/skills/plotly_dash.png",
  "Web Scraping": "/icons/skills/automation.svg",
  "REST API": "/icons/skills/FastAPI.png",
  NoSQL: "/icons/skills/NoSQL.png",
  React: "/icons/skills/react.png",
  PostgreSQL: "/icons/skills/PostgreSQL.png",
  Django: "/icons/skills/Django.png",
  "Next.js": "/icons/skills/react.png",
  "AI Agent": "/icons/skills/ai.svg",
};

export function getProjectTechIcon(tag: string) {
  return PROJECT_TECH_ICON_MAP[tag] ?? "/icons/skills/automation.svg";
}
