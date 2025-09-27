import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { ValueProposition } from "./components/ValueProposition";
import { TeacherIntroduction } from "./components/TeacherIntroduction";
import { CoursesOverview } from "./components/CoursesOverview";
import { Testimonials } from "./components/Testimonials";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { CoursesPage } from "./pages/CoursesPage";

function Home() {
  return (
    <>
      <HeroSection />
      <ValueProposition />
      <TeacherIntroduction />
      <CoursesOverview />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* SEO Meta Information - Would be handled by a meta framework like Next.js */}
        <title>Online Quran & Arabic Classes for Kids & Adults | Learn Tajweed</title>
        
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}