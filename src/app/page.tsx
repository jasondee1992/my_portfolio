import Navbar from "@/components/redesign/Navbar";
import Hero from "@/components/redesign/Hero";
import AboutSection from "@/components/redesign/AboutSection";
import InfoCards from "@/components/redesign/InfoCards";
import FeaturedProjects from "@/components/redesign/FeaturedProjects";
import QuoteBlock from "@/components/redesign/QuoteBlock";
import Footer from "@/components/redesign/Footer";


export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
      <InfoCards />
      <FeaturedProjects />
      <QuoteBlock />
      <Footer />
    </main>
  );
}