import { Header } from "@/src/components/Header";
import { HeroSection } from "@/src/components/HeroSection";
import { ValueProposition } from "@/src/components/ValueProposition";
import { TeacherIntroduction } from "@/src/components/TeacherIntroduction";
import { CoursesOverview } from "@/src/components/CoursesOverview";
import { Testimonials } from "@/src/components/Testimonials";
import { FinalCTA } from "@/src/components/FinalCTA";
import { ContactForm } from "@/src/components/ContactForm";
import { Footer } from "@/src/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ValueProposition />
        <TeacherIntroduction />
        <CoursesOverview />
        <Testimonials />
        <FinalCTA />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
