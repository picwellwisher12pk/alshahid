import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { ValueProposition } from "./components/ValueProposition";
import { TeacherIntroduction } from "./components/TeacherIntroduction";
import { CoursesOverview } from "./components/CoursesOverview";
import { Testimonials } from "./components/Testimonials";
import { FinalCTA } from "./components/FinalCTA";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { CoursesPage } from "./pages/CoursesPage";
import { Login } from "./pages/Login";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { TrialRequests } from "./pages/dashboard/TrialRequests";
import { ContactMessages } from "./pages/dashboard/ContactMessages";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AuthProvider, ProtectedRoute } from "./contexts/auth-context";
import { TrialRequestProvider, useTrialRequest } from "./contexts/trial-request-context";
import { TrialRequestDialog } from "./components/TrialRequestDialog";

function Home() {
  return (
    <>
      <HeroSection />
      <ValueProposition />
      <TeacherIntroduction />
      <CoursesOverview />
      <Testimonials />
      <FinalCTA />
      <ContactForm />
    </>
  );
}

function AppContent() {
  const { isDialogOpen, selectedCourse, closeDialog } = useTrialRequest();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Routes with header/footer */}
        <Route path="/" element={
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Home />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/courses" element={
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <CoursesPage />
            </main>
            <Footer />
          </div>
        } />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="trial-requests" element={<TrialRequests />} />
          <Route path="contact-messages" element={<ContactMessages />} />
        </Route>
      </Routes>

      <TrialRequestDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        selectedCourse={selectedCourse}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <TrialRequestProvider>
          <AppContent />
        </TrialRequestProvider>
      </AuthProvider>
    </Router>
  );
}