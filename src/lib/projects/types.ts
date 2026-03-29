export type ProjectSection = "enterprise" | "other";
export type ProjectVisibility = "public" | "internal";

export type ManagedProject = {
  id: string;
  title: string;
  role: string;
  projectType: string;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string[];
  showOnHomepage: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  title: string;
  role: string;
  projectType: string;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string[];
  showOnHomepage: boolean;
  displayOrder: number;
};

export type UpdateProjectInput = CreateProjectInput & {
  id: string;
};
