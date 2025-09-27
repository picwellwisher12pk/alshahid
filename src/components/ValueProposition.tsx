import { Calendar, Award, User } from "lucide-react";

export function ValueProposition() {
  const features = [
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Learn at your own pace, on your own time. Perfect for busy families and working professionals.",
      color: "blue"
    },
    {
      icon: Award,
      title: "Expert Tutors",
      description: "Taught by qualified and compassionate Islamic scholars with years of teaching experience.",
      color: "green"
    },
    {
      icon: User,
      title: "Personalized Sessions",
      description: "Dedicated 1-on-1 classes for focused learning and individual attention to your progress.",
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "green":
        return "bg-green-50 text-green-600 border-green-100";
      case "purple":
        return "bg-purple-50 text-purple-600 border-purple-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6 text-primary">
            Your Journey to Learning the Quran Starts Here
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Whether you're a parent wanting your child to begin their Quranic education or an adult eager to perfect your recitation, 
            we make learning accessible and engaging. Our one-on-one sessions ensure personalized attention, 
            helping you achieve your goals with confidence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mx-auto mb-6 ${getColorClasses(feature.color)}`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl mb-4 text-primary">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}