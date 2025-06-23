
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Stethoscope, Pill, Clock, Shield, Brain, FileText, Users, CheckCircle } from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "AI Conversation",
      description: "Natural conversation interface that understands your symptoms and health concerns with empathy and medical knowledge."
    },
    {
      icon: Search,
      title: "Symptom Analysis",
      description: "Advanced AI analyzes your symptoms using medical databases and pattern recognition to identify potential causes."
    },
    {
      icon: Stethoscope,
      title: "Health Assessment", 
      description: "Comprehensive health evaluation based on your conversation and symptom patterns with detailed analysis."
    },
    {
      icon: Pill,
      title: "Treatment Suggestions",
      description: "Personalized recommendations for medications, lifestyle changes, and next steps based on your specific situation."
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get preliminary health insights and recommendations within minutes, not hours or days."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your health data is encrypted and secure. HIPAA compliant with full privacy protection and data ownership."
    }
  ];

  const additionalFeatures = [
    {
      icon: Brain,
      title: "Machine Learning",
      description: "Continuously improving AI that learns from medical research and anonymized patient data."
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Comprehensive health reports you can share with your healthcare provider."
    },
    {
      icon: Users,
      title: "Multiple Profiles",
      description: "Manage health consultations for family members with separate secure profiles."
    },
    {
      icon: CheckCircle,
      title: "Follow-up Care",
      description: "Track your symptoms over time and get follow-up recommendations based on progress."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800">Features</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <br />
            <span className="text-blue-600">Smart Health Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our AI-powered platform provides comprehensive health analysis, symptom evaluation, 
            and personalized recommendations to help you make informed healthcare decisions.
          </p>
          <Link to="/consultation">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full">
              Start Your Health Consultation
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets healthcare expertise to provide you with the best possible health insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
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

      {/* Additional Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Additional features that make HealthVoice AI your complete health companion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience AI-Powered Healthcare?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust HealthVoice AI for their preliminary health analysis and recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button size="lg" variant="secondary" className="px-8 py-4 rounded-full">
                Start Free Consultation
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="px-8 py-4 rounded-full border-white text-white hover:bg-white hover:text-blue-600">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
