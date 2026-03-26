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
    title: "Operations Monitoring Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Developed a backend-driven monitoring solution for internal operational workflows in a financial-services environment. The system consolidated activity data, supported management reporting, and improved process visibility and reporting consistency for internal teams.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "02",
    title: "Leave Operations Tracker",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Built an internal workflow application for managing employee leave and time-off processes. The tool helped teams coordinate reminders, tasks, and status tracking across internal stakeholders, improving organization and reducing manual follow-ups.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "03",
    title: "Process Analysis Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Developed a process analysis dashboard for internal operations workflows, focused on trend visibility, turnaround monitoring, and process improvement reporting. The solution helped teams identify inefficiencies at a high level, monitor recurring issues, and support data-driven improvement initiatives.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "04",
    title: "Snowflake Quality Report Automation",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Created an automated reporting solution that extracts data from Snowflake and generates structured quality reports in Excel. This reduced manual reporting effort, improved consistency, and helped teams monitor reporting quality and operational performance more efficiently.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "05",
    title: "Onboarding Progress Tracker",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Built an internal tracking and reporting solution for monitoring onboarding progress and management reporting. The system improved visibility into onboarding readiness and helped teams track training progress more effectively.",
    tags: ["REST API", "Dash", "NoSQL", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "06",
    title: "Automated Ticket Routing and Workforce Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Designed and developed an automated ticket-routing and workforce management solution for internal teams. The platform included a real-time dashboard for monitoring workflow status, assignment visibility, and team availability, improving workload balancing, operational control, and day-to-day visibility.",
    tags: ["React", "REST API", "NoSQL", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "07",
    title: "Location Mapping",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Developed a location mapping solution designed to visualize and manage location-based operational data through a responsive web interface. The application supports structured data handling, mapping-related workflows, and backend integration for improved usability and operational reference.",
    tags: ["React", "PostgreSQL", "Python", "Django"],
    note: "Internal enterprise project. Live demo not publicly available.",
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
