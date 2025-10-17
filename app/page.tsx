import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ValueProposition } from "@/components/ValueProposition";
import { TeacherIntroduction } from "@/components/TeacherIntroduction";
import { CoursesOverview } from "@/components/CoursesOverview";
import { Testimonials } from "@/components/Testimonials";
import { FinalCTA } from "@/components/FinalCTA";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

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
