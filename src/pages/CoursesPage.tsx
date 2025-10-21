"use client";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { BookOpen, Heart, Volume2, Clock, Star, Book, BookMarked, BookText, BookKey, BookA } from "lucide-react";
import { useRouter } from "next/navigation";

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
    },
    {
        title: "Tajweed Mastery",
        description: "Deep dive into the rules of Tajweed with expert instructors. Perfect for those who want to perfect their recitation.",
        icon: Book,
        duration: "6-12 months",
        students: "180+",
        rating: "4.9",
        level: "Intermediate to Advanced",
        features: ["Advanced Rules", "Practical Application", "Individual Feedback", "Certification"],
        color: "blue"
    },
    {
        title: "Quranic Arabic",
        description: "Understand the language of the Quran. Learn Arabic grammar, vocabulary, and sentence structure directly from the Quranic text.",
        icon: BookMarked,
        duration: "1-2 years",
        students: "220+",
        rating: "4.7",
        level: "All Levels",
        features: ["Grammar", "Vocabulary", "Sentence Structure", "Quranic Context"],
        color: "green"
    },
    {
        title: "Tafseer & Reflection",
        description: "Deepen your understanding of the Quran through comprehensive Tafseer and practical applications in daily life.",
        icon: BookText,
        duration: "1 year",
        students: "160+",
        rating: "4.8",
        level: "Intermediate to Advanced",
        features: ["Quranic Themes", "Contextual Understanding", "Practical Applications"],
        color: "purple"
    },
    {
        title: "Islamic Studies for Kids",
        description: "Engaging and interactive Islamic education for children, covering Aqeedah, Fiqh, Seerah, and Islamic manners.",
        icon: BookKey,
        duration: "Ongoing",
        students: "250+",
        rating: "4.9",
        level: "Children",
        features: ["Aqeedah", "Fiqh", "Seerah", "Islamic Manners"],
        color: "blue"
    },
    {
        title: "Quranic Calligraphy",
        description: "Learn the beautiful art of Arabic calligraphy with a focus on Quranic verses and Islamic art.",
        icon: BookA,
        duration: "6 months",
        students: "120+",
        rating: "4.7",
        level: "All Levels",
        features: ["Naskh Script", "Thuluth Script", "Composition", "Islamic Art"],
        color: "green"
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

export function CoursesPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background pt-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-6">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4">Our Comprehensive Courses</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Explore our wide range of Quranic and Islamic studies courses designed for all ages and levels.
                    </p>
                </div>
            </div>

            {/* Courses Grid */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <Card key={index} className="relative group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 h-full flex flex-col">
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
                                        <CardDescription className="text-foreground">
                                            {course.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="mt-auto">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.duration}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {course.features.map((feature, i) => (
                                                <div key={i} className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button className="w-full mt-4" variant="outline">
                                            Learn More
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-semibold mb-4">Can't find what you're looking for?</h3>
                        <p className="text-muted-foreground mb-6">Contact us for custom learning plans or group discounts.</p>
                        <Button onClick={() => router.push('/#contact')}>
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
