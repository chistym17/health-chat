
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MessageSquare, Stethoscope, Sparkles, ArrowRight, Play, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Voice Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Voice-Powered Health Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience two different ways to interact with our AI health assistant using your voice
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* One-Way Voice Input */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Voice Diagnosis</CardTitle>
                    <p className="text-sm text-gray-600">One-way voice input for health assessment</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    How it works:
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Record your symptoms and health concerns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>AI analyzes your voice input for diagnosis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Receive detailed health assessment and recommendations</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Perfect for:</h4>
                  <p className="text-blue-700 text-sm">
                    Initial health screenings, symptom analysis, and getting preliminary medical advice
                  </p>
                </div>
                
                <Link to="/conversation">
                  <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Mic className="w-5 h-5 mr-2" />
                    Start Voice Diagnosis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Real-Time Conversation */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Live Conversation</CardTitle>
                    <p className="text-sm text-gray-600">Real-time voice chat with AI assistant</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-500" />
                    How it works:
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Have natural conversations with the AI assistant</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Ask questions and get instant voice responses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fill forms and complete tasks using voice commands</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Perfect for:</h4>
                  <p className="text-purple-700 text-sm">
                    Interactive consultations, form filling, and ongoing health discussions
                  </p>
                </div>
                
                <Link to="/voice-chat">
                  <Button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start Live Conversation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Voice Commands Guide */}
          <Card className="bg-gradient-to-r from-slate-100 to-blue-100 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Voice Commands Guide</CardTitle>
                  <p className="text-gray-600">Learn how to interact with our voice assistants</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-green-500" />
                    Basic Commands
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• "Hello" - Greet the assistant</li>
                    <li>• "How are you?" - Check status</li>
                    <li>• "What can you do?" - Learn features</li>
                    <li>• "Stop" - End current action</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    Form Commands
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• "Contact form" - Open form</li>
                    <li>• "My name is John" - Fill name</li>
                    <li>• "My email is john@example.com" - Fill email</li>
                    <li>• "Submit" - Submit form</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    Health Commands
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• "I have a headache" - Report symptoms</li>
                    <li>• "What should I do?" - Get advice</li>
                    <li>• "Tell me about..." - Learn more</li>
                    <li>• "Help" - Get assistance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
