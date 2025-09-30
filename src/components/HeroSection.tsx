import { Button } from "./ui/button";
import { Play, Calendar, Users, Clock, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 to-green-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl leading-tight text-primary">
                The Most Beautiful Way to Learn the Quran is Now Online
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Master Quran Recitation and Tajweed from the comfort of your home with our experienced tutors.
                We offer flexible classes for all ages, from beginners to advanced students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Button size="lg" className="text-lg px-8 py-6">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Your Free Trial Class!
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Info className="w-4 h-4 mr-2" />
                  <span>3-day trial with 30-minute sessions each</span>
                </div>
              </div>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Play className="w-5 h-5 mr-2" />
                Explore Our Courses
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-semibold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-semibold text-primary">30+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3 mx-auto">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-semibold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Online Support</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="/teaching-small-optimized.png"
                alt="Online Quran Learning Session"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating testimonial card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-lg border border-border max-w-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">AN</span>
                </div>
                <div>
                  <div className="text-sm">A parent from USA</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "We saw a remarkable change—my daughter went from struggling to reading fluently with confidence."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}