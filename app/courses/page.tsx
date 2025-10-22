import { Header } from "@/components/Header";
import { CoursesPage } from "@/components/pages/CoursesPage";
import { Footer } from "@/components/Footer";

export default function Courses() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CoursesPage />
      </main>
      <Footer />
    </div>
  );
}
