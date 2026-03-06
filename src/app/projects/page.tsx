import Navbar from "@/components/redesign/Navbar";
import ProjectsHero from "@/components/projects/ProjectsHero";
import FeaturedProjectsGrid from "@/components/projects/FeaturedProjectsGrid";
import OtherWorksList from "@/components/projects/OtherWorksList";
import ProjectsFooter from "@/components/projects/ProjectsFooter";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ProjectsHero />
      <FeaturedProjectsGrid />
      <OtherWorksList />
      <ProjectsFooter />
    </main>
  );
}