import { Button } from "./ui/button";
import { Phone, Mail } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">Q</span>
            </div>
            <span className="text-xl font-medium text-primary">Al-Shahid Academy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-foreground hover:text-primary transition-colors ${isActive ? 'text-primary font-medium' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/courses" 
              className={({ isActive }) => 
                `text-foreground hover:text-primary transition-colors ${isActive ? 'text-primary font-medium' : ''}`
              }
            >
              Courses
            </NavLink>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Testimonials</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>+92 310 4362226</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>info@alshahid.com</span>
              </div>
            </div>
            <Button>Book Free Trial</Button>
          </div>
        </div>
      </div>
    </header>
  );
}