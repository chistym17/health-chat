import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Stethoscope, Pill, Clock, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Conversation",
      description: "Natural conversation interface that understands your symptoms and health concerns with empathy."
    },
    {
      icon: Search,
      title: "Symptom Analysis",
      description: "Advanced AI analyzes your symptoms using medical databases and pattern recognition."
    },
    {
      icon: Stethoscope,
      title: "Health Assessment", 
      description: "Comprehensive health evaluation based on your conversation and symptom patterns."
    },
    {
      icon: Pill,
      title: "Treatment Suggestions",
      description: "Personalized recommendations for medications, lifestyle changes, and next steps."
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get preliminary health insights and recommendations within minutes, not hours."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your health data is encrypted and secure. HIPAA compliant with full privacy protection."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-16">
          <div>
            <Badge className="mb-4 bg-blue-100 text-blue-800">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <br />
              Smart Health Analysis
            </h2>
          </div>
          <Link to="/conversation">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">
              Try It Now
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
    {children}
  </span>
);

export default Features;
