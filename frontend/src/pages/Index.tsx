
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import VoiceBotConnector from "@/components/VoiceBotConnector";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Voice Bot Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try Our Voice Bot
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience real-time AI conversation with our voice-powered assistant. 
              Connect to start talking with the AI and try filling out forms using just your voice.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Voice Bot Connector */}
            <VoiceBotConnector />
            
            {/* Direct Link to Voice Chat */}
            <div className="md:w-1/2 w-full flex flex-col items-center justify-center">
              <div className="w-full max-w-xl min-h-[520px] bg-white/90 rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-blue-100 justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <span className="text-xl font-semibold text-gray-800">Direct Voice Chat</span>
                </div>
                <p className="text-gray-700 text-base mb-4 text-center">
                  Jump directly into a voice conversation with our AI assistant. Experience real-time speech recognition, AI responses, and form filling capabilities.
                </p>
                <Link to="/voice-chat">
                  <Button className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md font-semibold flex items-center justify-center gap-2 transition mb-4">
                    <Mic className="w-5 h-5" />
                    Start Voice Chat
                  </Button>
                </Link>
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-gray-500 text-sm mt-4 text-center">
                    Click <span className="font-semibold">Start Voice Chat</span> to begin your conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
