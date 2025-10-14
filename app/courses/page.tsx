import { Header } from "@/src/components/Header";
import { CoursesPage } from "@/src/pages/CoursesPage";
import { Footer } from "@/src/components/Footer";

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
