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
    title: "Money Movement Monitoring",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Developed a backend-driven monitoring solution that provides visibility into daily Money Movement volumes and helps identify missed requests, including client-requested transactions that were not fulfilled by the bank. The system supports data consolidation, service manager-level reporting, and process tracking to improve operational visibility and reporting accuracy.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "02",
    title: "Leave Experience Mini-CRM",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Built an internal mini-CRM application that streamlines the handling of employee leave and time-off requests, including parental, medical, bereavement, and other leave types. The tool helps teams manage reminders, tasks, and workflow actions involving employees, HR, and clients, improving process organization and reducing manual follow-ups.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "03",
    title: "Payment Process Analysis",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Developed a process analysis dashboard focused on tracking average monthly payment volumes, manual processing time, and recurring pre-submission errors. The solution helps teams identify inefficiencies, monitor error trends, and support data-driven process improvement initiatives.",
    tags: ["Dash", "SQLite", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "04",
    title: "Snowflake Quality Report Automation",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Created an automated reporting solution that extracts data from Snowflake and generates structured quality reports in Excel. This project reduced manual reporting effort, improved consistency, and helped teams monitor data quality and operational performance more efficiently.",
    tags: ["Python", "Pandas", "NumPy", "Snowflake", "SQLite"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "05",
    title: "New Hire Experience",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Built an internal tracking and reporting solution for monitoring new hire progress, including licensing status, quiz performance, and management reporting. The system provides better visibility into onboarding readiness and helps management track compliance and training progress more effectively.",
    tags: ["REST API", "Dash", "NoSQL", "Python", "Pandas", "NumPy", "Snowflake", "Web Scraping"],
    note: "Internal enterprise project. Live demo not publicly available.",
  },
  {
    no: "06",
    title: "Ticket Auto-Assignment and Workforce Management Dashboard",
    role: "Developer / Process Automation Engineer",
    type: "Internal Operations Dashboard",
    description:
      "Designed and developed an automated ticket assignment and workforce management solution that routes tickets based on stakeholder-defined rules and operational conditions. The platform includes a real-time dashboard for monitoring ticket flow, assignment status, and worker availability, while allowing managers to enable or disable specific workers from receiving tickets. This improved workload balancing, operational control, and real-time visibility across the team.",
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
      "Built a personal portfolio website to showcase projects, skills, and development work in a modern web interface. The portfolio also includes AI-agent-related functionality to support a more interactive and personalized user experience.",
    tags: ["Next.js", "AI Agent"],
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
