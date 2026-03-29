import Navbar from "@/components/redesign/Navbar";
import ProjectsHero from "@/components/projects/ProjectsHero";
import FeaturedProjectsGrid from "@/components/projects/FeaturedProjectsGrid";
import OtherWorksList from "@/components/projects/OtherWorksList";
import ProjectsFooter from "@/components/projects/ProjectsFooter";
import { getPublicProjects } from "@/lib/projects/projectStorage";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  const enterpriseProjects = projects.filter((project) => project.section === "enterprise");
  const otherProjects = projects.filter((project) => project.section === "other");

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProjectsHero />
      <FeaturedProjectsGrid projects={enterpriseProjects} />
      <OtherWorksList projects={otherProjects} />
      <ProjectsFooter />
    </main>
  );
}
