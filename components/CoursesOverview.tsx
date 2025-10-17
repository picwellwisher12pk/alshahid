"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Heart, Volume2, Clock, Users, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRouter } from 'next/navigation';

export function CoursesOverview() {
  const router = useRouter();
  const courses = [
    {
      title: "Quran & Tajweed for Beginners",
      description: "Perfect for adults and children just starting their journey with the Quran. Learn basic Arabic letters, pronunciation, and fundamental Tajweed rules.",
      icon: BookOpen,
      duration: "3-6 months",
      students: "200+",
      rating: "4.9",
      level: "Beginner",
      features: ["Arabic Alphabet", "Basic Tajweed", "Simple Surahs", "Prayer Duas"],
      color: "blue"
    },
    {
      title: "Quran Memorization (Hifz)",
      description: "Achieve your dream of becoming a Hafiz or Hafiza with our structured memorization program. Systematic approach with regular revision.",
      icon: Heart,
      duration: "2-4 years",
      students: "150+",
      rating: "4.8",
      level: "All Levels",
      features: ["Structured Program", "Daily Revision", "Progress Tracking"],
      color: "green"
    },
    {
      title: "Nazra & Quran Recitation",
      description: "Improve your fluency and pronunciation with daily practice. Focus on beautiful recitation and advanced Tajweed rules.",
      icon: Volume2,
      duration: "6-8 months",
      students: "300+",
      rating: "4.9",
      level: "Intermediate",
      features: ["Fluent Reading", "Advanced Tajweed", "Beautiful Recitation", "Qira'at Styles"],
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "green":
        return "bg-green-50 text-green-600 border-green-200";
      case "purple":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-700";
      case "green":
        return "bg-green-100 text-green-700";
      case "purple":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section id="courses" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6 text-primary">
            Our Comprehensive Quran & Arabic Courses
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose from our carefully designed courses that cater to students of all ages and levels.
            Each course is structured to ensure steady progress and deep understanding.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <Card key={index} className="relative group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center ${getColorClasses(course.color)}`}>
                  <course.icon className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getBadgeClasses(course.color)}>{course.level}</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">{course.rating}</span>
                    </div>
                  </div>

                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {course.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{course.students} students</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-primary">What You'll Learn:</h4>
                  <ul className="space-y-1">
                    {course.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => router.push('/courses')}
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg hover:bg-primary/10 transition-colors"
          >
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
}