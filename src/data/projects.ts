export type ProjectItem = {
  no: string;
  title: string;
  role: string;
  type: string;
  description: string;
  tags: string[];
  note?: string;
};

export const internalProjects: ProjectItem[] = [
  {
    no: "01",
    title: "Enterprise Monitoring & Reporting Platform",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Developed a backend-driven monitoring and reporting platform for enterprise operations. The system consolidated operational data, improved visibility, and supported more consistent internal reporting for business teams.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "02",
    title: "Internal Workflow Coordination Tool",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Built an internal workflow coordination tool that helped teams manage task tracking, reminders, and status updates in a more organized and efficient way.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "03",
    title: "Process Visibility & Analysis Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Developed a dashboard for process visibility and trend analysis, helping teams monitor workflow patterns and support improvement efforts at a high level.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "04",
    title: "Data Quality Reporting Automation",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Created an automated reporting solution that prepared structured quality and operations reports, reducing manual effort and improving reporting consistency.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "05",
    title: "Team Readiness Tracking Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Built an internal tracking dashboard for progress visibility and reporting, helping teams monitor readiness and follow-up activity more effectively.",
    tags: ["REST API", "Dash", "NoSQL", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "06",
    title: "Workflow Automation & Operations Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Designed and developed an internal operations dashboard that improved workflow visibility, task coordination, and day-to-day workload awareness for enterprise teams.",
    tags: ["React", "REST API", "NoSQL", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Enterprise project. Public demo not available.",
  },
  {
    no: "07",
    title: "Location Data Management Platform",
    role: "Developer / Process Automation Engineer",
    type: "Enterprise Operations Application",
    description:
      "Developed a web-based application for managing and visualizing location-related enterprise data, improving usability, structured data handling, and operational reference.",
    tags: ["React", "PostgreSQL", "Python", "Django"],
    note: "Enterprise project. Public demo not available.",
  },
];

export const otherWorks: ProjectItem[] = [
  {
    no: "08",
    title: "Invoice Generator",
    role: "Developer / Process Automation Engineer",
    type: "Personal Project",
    description:
      "Developed a Python-based invoice generation tool that creates professional PDF invoices from Excel source data and supporting evidence images stored in a folder. The solution automates document generation, organizes supporting attachments, and helps reduce manual formatting work for invoice preparation.",
    tags: ["Python"],
  },
  {
    no: "09",
    title: "My Portfolio",
    role: "Developer / Process Automation Engineer",
    type: "Personal Project",
    description:
      "Built a personal portfolio website with a premium dark UI to showcase my projects, skills, career background, and development work in a polished modern interface. I developed the site using Next.js and TypeScript, structured the content for maintainability, and added an OpenAI-powered chatbot that answers portfolio-related questions in a more interactive and personalized way. The project also reflects my focus on combining clean frontend presentation with practical AI-assisted user experiences.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI API"],
  },
];

/*
  Add new projects using this format:

  {
    no: "10",
    title: "Project Name",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description: "Short but complete project summary.",
    tags: ["Python", "Dash", "Snowflake"],
    note: "Internal enterprise project. Live demo not publicly available.",
  }
*/
