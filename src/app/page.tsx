import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* PROOF BANNER */}
      <div className="fixed top-2 left-2 z-[9999] bg-red-600 text-white px-3 py-1 rounded">
        PAGE.TSX LOADED
      </div>

      <Navbar />
      <Hero />
      <Projects />
      <Achievements />
      <Contact />

      {/* CHATBOT */}
      <ChatbotWidget />
    </main>
  );
}