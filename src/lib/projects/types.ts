export type ProjectSection = "enterprise" | "other";
export type ProjectVisibility = "public" | "internal";
export type ProjectAppPlatform = "web" | "phone" | "desktop";

export type ManagedProject = {
  id: string;
  title: string;
  role: string;
  projectType: string;
  appPlatform: ProjectAppPlatform;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string[];
  liveUrl: string | null;
  showOnHomepage: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  title: string;
  role: string;
  projectType: string;
  appPlatform: ProjectAppPlatform;
  details: string;
  summaryDescription: string;
  visibility: ProjectVisibility;
  section: ProjectSection;
  techStack: string[];
  liveUrl: string | null;
  showOnHomepage: boolean;
  displayOrder: number;
};

export type UpdateProjectInput = CreateProjectInput & {
  id: string;
};
