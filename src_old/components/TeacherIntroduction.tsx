import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Star, Users, Clock, Award } from "lucide-react";

export function TeacherIntroduction() {
  const achievements = [
    { icon: Users, value: "500+", label: "Students Taught" },
    { icon: Clock, value: "30+", label: "Years Experience" },
    { icon: Clock, value: "10+", label: "Online Experience" },
    { icon: Star, value: "4.9", label: "Rating" }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl mb-6 text-primary">Meet Your Teacher</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-center lg:text-left">
            <div className="relative inline-block">
              <ImageWithFallback
                src="/shahid-pic-circular-optimized.png"
                alt="Quran Teacher"
                className="w-80 rounded-full mx-auto lg:mx-0 shadow-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl text-primary">Qari Shahid Majeed</h3>
              <div className="flex items-center space-x-1 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-muted-foreground ml-2">(4.9/5 from 200+ reviews)</span>
              </div>
            </div>

            <blockquote className="text-lg leading-relaxed text-muted-foreground italic border-l-4 border-primary pl-6">
              "Assalam-o-Alaikum! I'm Qari Shahid Majeed. For over 30 years, I've had the honor of teaching the Quran to students around the world.
              My passion is to help every student connect with the divine words of Allah (SWT) and build a lifelong love for learning the Quran with proper Tajweed.
              I look forward to meeting you in class, Insha'Allah."
            </blockquote>

            <div className="grid grid-cols-2 gap-4 pt-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm border border-border">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2 mx-auto">
                    <achievement.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl font-semibold text-primary">{achievement.value}</div>
                  <div className="text-sm text-muted-foreground">{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}