import { Card, CardContent } from "./ui/card";
import { Star, Quote } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Testimonials() {
  const testimonials = [
    {
      name: "Fatima Ahmed",
      role: "Mother of 8-year-old student",
      location: "Karachi, Pakistan",
      content: `We have been incredibly pleased with Qari Shahid’s online Quran teaching for our two children—a 10-year-old son and a 14-year-old daughter. From the very beginning, he showed great patience, professionalism, and a deep understanding of how to engage students at different learning levels. \n\n

      Qari Shahid combines excellent Tajweed knowledge with a gentle, encouraging teaching style. Our son, who is quite energetic, looks forward to every lesson, and our daughter has developed a much stronger connection to her recitation and understanding of the Quran. He explains the rules clearly, corrects mistakes kindly, and always makes sure the children truly understand before moving forward.\n \n\n

      We especially appreciate his punctuality, consistent communication, and the way he incorporates Islamic etiquette and values into each session. His ability to keep both kids motivated—despite their different ages and personalities—is truly impressive. \n\n

      We highly recommend Qari Shahid to any family looking for a dedicated, knowledgeable, and caring Quran teacher. He has made a wonderful impact on our children’s Quran learning journey, Alhamdulillah.`,
      rating: 5,
    },
    {
      name: "Muhammad Hassan",
      role: "Adult Student",
      location: "London, UK",
      content: "As an adult learner, I was a bit nervous, but my teacher made me feel so comfortable. The lessons are flexible and I can see real progress. The 1-on-1 attention is exactly what I needed.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1588194200910-af009d36fc75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdXJhbiUyMGFyYWJpYyUyMGJvb2t8ZW58MXx8fHwxNzU2OTMzNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Aisha Khan",
      role: "University Student",
      location: "Toronto, Canada",
      content: "I started learning Quran memorization 6 months ago. The structured approach and regular revision system has helped me memorize 5 Surahs already. Alhamdulillah!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1649030839339-3d117544fcb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGxlYXJuaW5nJTIwcXVyYW58ZW58MXx8fHwxNzU2OTMzNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Ali Rahman",
      role: "Father of twin daughters",
      location: "Dubai, UAE",
      content: "Both my daughters love their Quran classes. The teacher uses engaging methods to keep them interested. Their Arabic pronunciation has improved dramatically in just 3 months.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1617755870291-1f0de453ad30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGNvbXB1dGVyfGVufDF8fHx8MTc1NjkzMzc2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <section id="testimonials" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6 text-primary">
            What Our Students and Parents Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real stories from our community of learners who have transformed their Quranic journey with us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-primary/20" />
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-primary text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Join hundreds of satisfied students and families</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-medium text-primary">4.9/5</span>
            <span className="text-muted-foreground">from 500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}