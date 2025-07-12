import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MessageSquare, 
  Stethoscope, 
  Calendar, 
  User, 
  Mail, 
  Heart,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Bot,
  Volume2
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Healthcare-Focused",
      description: "Specialized in medical appointments and health guidance"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "HIPAA Compliant",
      description: "Patient privacy and data security prioritized"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Availability",
      description: "Schedule appointments anytime, day or night"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Instant Confirmation",
      description: "Get appointment confirmations immediately"
    }
  ];

  const voiceCommands = [
    "I need an appointment",
    "My name is John Smith", 
    "My email is john@example.com",
    "I have a headache",
    "It's urgent",
    "Submit appointment"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-cyan-50/40 to-slate-100/30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Healia
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 max-w-3xl mx-auto">
              Your AI Healthcare Assistant for Seamless Appointment Scheduling
            </h2>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the future of healthcare with voice-powered appointment scheduling. 
              Simply speak to schedule appointments, get health guidance, and manage your care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/voice-chat')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Chat
              </Button>
              <Button 
                onClick={() => navigate('/voice-input')}
                variant="outline"
                size="lg"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Voice Input Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Main Modes Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Choose Your Healthcare Experience
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Two powerful ways to interact with your healthcare assistant
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Real-time Conversation Card */}
          <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Interactive
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Real-time Voice Conversation</CardTitle>
                  <p className="text-sm text-slate-600">Two-way healthcare assistant</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Have a natural conversation with your healthcare assistant. Schedule appointments, 
                ask health questions, and get personalized guidance through voice interaction.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-500" />
                  What you can do:
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Schedule appointments with voice commands
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Get health advice and symptom guidance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Natural conversation flow
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Real-time appointment form filling
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/voice-chat')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Start Conversation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice Input Card */}
          <Card className="relative overflow-hidden border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
              <Bot className="w-4 h-4 inline mr-1" />
              Demo
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Voice Input Testing</CardTitle>
                  <p className="text-sm text-slate-600">Test your microphone</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Test your microphone and voice input capabilities. Record voice messages, 
                see real-time transcription, and experience different voice options.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                  Features:
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Microphone testing and calibration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Real-time voice transcription
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Multiple voice options
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                    Voice message recording
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/voice-input')}
                  variant="outline"
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Test Voice Input
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Commands Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Voice Commands for Healthcare
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Use these voice commands to interact with your healthcare assistant
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {voiceCommands.map((command, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-blue-200 hover:border-blue-300 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        "{command}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Why Choose Healia?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Advanced healthcare technology designed for your convenience and safety
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Healthcare Reimagined?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your voice-powered healthcare journey today with Healia
          </p>
          <Button 
            onClick={() => navigate('/voice-chat')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home; 