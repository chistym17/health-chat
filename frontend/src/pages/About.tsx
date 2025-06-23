
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Target, Users, Award, Shield, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Every feature we build starts with the question: How does this help our users get better healthcare?"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your health data is sacred. We use enterprise-grade encryption and never share your personal information."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We're constantly pushing the boundaries of what's possible with AI in healthcare."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Quality healthcare insights should be available to everyone, everywhere, at any time."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "Board-certified physician with 15+ years in internal medicine and healthcare AI."
    },
    {
      name: "Alex Chen",
      role: "CTO & Co-Founder",
      description: "Former Google AI researcher specializing in natural language processing and machine learning."
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Product",
      description: "Healthcare technology veteran with experience at leading medical device companies."
    },
    {
      name: "Dr. James Park",
      role: "AI Research Lead",
      description: "PhD in Computer Science, published researcher in medical AI and symptom analysis."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-100 text-blue-800">About Us</Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Healthcare
              <br />
              <span className="text-blue-600">One Conversation at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're on a mission to make quality healthcare accessible to everyone through the power of AI. 
              Our platform combines cutting-edge artificial intelligence with medical expertise to provide 
              instant, accurate, and personalized health insights.
            </p>
            <Link to="/consultation">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full">
                Experience HealthVoice AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Healthcare should be proactive, not reactive. We believe everyone deserves immediate access 
                to reliable health information and guidance, regardless of their location, time of day, or 
                economic situation.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                By combining artificial intelligence with medical expertise, we're creating a world where 
                preliminary health analysis is instant, accurate, and always available when you need it most.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="grid gap-6">
                <div className="flex items-start">
                  <Award className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">10,000+ Users Helped</h3>
                    <p className="text-gray-600 text-sm">Across 50+ countries worldwide</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">HIPAA Compliant</h3>
                    <p className="text-gray-600 text-sm">Enterprise-grade security and privacy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Lightbulb className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">95% Accuracy Rate</h3>
                    <p className="text-gray-600 text-sm">In symptom analysis and recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at HealthVoice AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A diverse group of healthcare professionals, AI researchers, and technology experts 
              working together to transform healthcare.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3 text-sm">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
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
            Join Us in Transforming Healthcare
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're seeking health insights or want to be part of our mission, 
            we're here to support you on your healthcare journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button size="lg" variant="secondary" className="px-8 py-4 rounded-full">
                Start Your Consultation
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="px-8 py-4 rounded-full border-white text-white hover:bg-white hover:text-blue-600">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
