import Navbar from "@/components/redesign/Navbar";
import AboutHero from "@/components/about/AboutHero";
import TechStackSection from "@/components/about/TechStackSection";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import ConnectSection from "@/components/about/ConnectSection";
import AboutFooter from "@/components/about/AboutFooter";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <AboutHero />
      <TechStackSection />
      <JourneyTimeline />
      <ConnectSection />
      <AboutFooter />
    </main>
  );
}