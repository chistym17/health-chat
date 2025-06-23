
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, Award, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 via-cyan-50 to-green-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200/25 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Trust badges */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              AI Certified
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Trusted by 10K+
            </Badge>
          </div>
        </div>

        {/* Main hero content */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Smart Health Analysis.
            <br />
            <span className="text-blue-600">AI-Powered Care.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your personal AI healthcare assistant that analyzes symptoms, 
            identifies potential causes, and provides personalized health recommendations—instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/conversation">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Start Health Consultation
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600">
              Learn How It Works
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Trusted by 10,000+ users worldwide for preliminary health insights
          </p>
        </div>

        {/* Company logos section */}
        <div className="mt-20">
          <p className="text-center text-gray-500 mb-8">Trusted by healthcare professionals worldwide</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-gray-400 font-semibold">MedTech</div>
            <div className="text-gray-400 font-semibold">HealthCorp</div>
            <div className="text-gray-400 font-semibold">WellnessAI</div>
            <div className="text-gray-400 font-semibold">CareSystem</div>
            <div className="text-gray-400 font-semibold">MedAssist</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
