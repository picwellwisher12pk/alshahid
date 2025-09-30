import { Facebook, Mail, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  const quickLinks = [
    { name: "Homepage", href: "#home" },
    { name: "Courses", href: "#courses" },
    // { name: "Pricing", href: "#pricing" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" }
  ];

  const courses = [
    { name: "Quran for Beginners", href: "#" },
    { name: "Tajweed Classes", href: "#" },
    { name: "Quran Memorization", href: "#" },
    { name: "Arabic Language", href: "#" },
    { name: "Islamic Studies", href: "#" }
  ];

  const resources = [
    { name: "FAQ", href: "#" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Blog", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" }
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary text-sm">Q</span>
              </div>
              <span className="text-xl">Quran Academy</span>
            </div>

            <p className="text-white/80 leading-relaxed">
              Learn the beautiful recitation of the Quran with qualified teachers from the comfort of your home.
              Join our global community of learners.
            </p>

            <div className="space-y-3">
              <a 
                href="https://wa.me/923004196274" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-white/60" />
                <span className="text-sm">+92 300 4196274</span>
              </a>
              <a 
                href="https://wa.me/923104362226" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-white/60" />
                <span className="text-sm">+92 310 4362226</span>
              </a>
              <a 
                href="mailto:shahidmajeed612@gmail.com" 
                className="flex items-center space-x-3 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-white/60" />
                <span className="text-sm">shahidmajeed612@gmail.com</span>
              </a>
              <a 
                href="mailto:infoalshahidinstitute@gmail.com" 
                className="flex items-center space-x-3 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-white/60 opacity-0" />
                <span className="text-sm">infoalshahidinstitute@gmail.com</span>
              </a>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm">Available 24/7</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="space-y-6">
            <h3 className="text-lg">Our Courses</h3>
            <ul className="space-y-3">
              {courses.map((course, index) => (
                <li key={index}>
                  <a
                    href={course.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {course.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-lg">Resources</h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <h4 className="text-sm mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © 2025 Quran Academy. All rights reserved.
            </p>
            <p className="text-white/60 text-sm">
              Made with ❤️ for the Muslim Ummah
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}