"use client";

import { Button } from "./ui/button";
import { Calendar, Gift, Clock, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTrialRequest } from "@/contexts/trial-request-context";

export function FinalCTA() {
  const { openDialog } = useTrialRequest();
  const benefits = [
    "No commitment required",
    "Meet your qualified teacher",
    "Assess your current level",
    "Get a personalized learning plan"
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1588194200910-af009d36fc75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdXJhbiUyMGFyYWJpYyUyMGJvb2t8ZW58MXx8fHwxNzU2OTMzNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Quran Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 text-sm">
              <Gift className="w-4 h-4" />
              <span>3-Day Free Trial: 30-Minute Sessions</span>
            </div>
            <h2 className="text-3xl lg:text-5xl leading-tight">
              Ready to Begin Your Quranic Journey?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Take the first step towards mastering Quran recitation and Tajweed with our 3-day free trial.
              Enjoy three 30-minute sessions with a qualified teacher to experience our teaching style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <ul className="space-y-3 text-left">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg">30-Minute Session</span>
                </div>
                <div className="text-2xl mb-4 text-green-300 font-medium">✓ 3 Days Free Trial</div>
                <h3 className="text-xl mb-4">Experience our teaching approach with:</h3>
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 transition-colors text-lg py-6"
                  onClick={() => openDialog()}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Start Your Free Trial today!
                </Button>
              </div>

              <p className="text-sm text-white/80">
                Available slots filling fast. Book now to secure your preferred time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl mb-1">500+</div>
              <div className="text-sm text-white/80">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">4.9★</div>
              <div className="text-sm text-white/80">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">24/7</div>
              <div className="text-sm text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}