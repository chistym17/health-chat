
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import VoiceBotConnector from "@/components/VoiceBotConnector";

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
          <VoiceBotConnector />
        </div>
      </section>
      
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
