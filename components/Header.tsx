"use client";

import { Button } from "./ui/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTrialRequest } from "@/contexts/trial-request-context";

export function Header() {
  const pathname = usePathname();
  const { openDialog } = useTrialRequest();
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">Q</span>
            </div>
            <span className="text-xl font-medium text-primary">Al-Shahid Academy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-foreground hover:text-primary transition-colors ${pathname === '/' ? 'text-primary font-medium' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className={`text-foreground hover:text-primary transition-colors ${pathname === '/courses' ? 'text-primary font-medium' : ''}`}
            >
              Courses
            </Link>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Testimonials</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
            <Link
              href="/login"
              className={`text-foreground hover:text-primary transition-colors ${pathname === '/login' ? 'text-primary font-medium' : ''}`}
            >
              Login
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="https://wa.me/923004196274" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-primary transition-colors font-semibold">
                <Phone className="w-4 h-4" />
                <span>+92 300 4196274</span>
              </a>
              <a href="mailto:info@al-shahid.com" className="flex items-center space-x-1 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@al-shahid.com</span>
              </a>
            </div>
            <Button onClick={() => openDialog()}>Book Free Trial</Button>
          </div>
        </div>
      </div>
    </header>
  );
}