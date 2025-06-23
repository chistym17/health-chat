import { Card, CardContent } from "@/components/ui/card";
import { Mic, Info, Sparkles, Volume2, ChevronRight } from "lucide-react";
import DemoButton from "./DemoButton";

interface InstructionsPanelProps {
  onDemoClick: () => void;
}

const InstructionsPanel = ({ onDemoClick }: InstructionsPanelProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-blue-200 shadow-xl animate-fade-in">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-lg animate-pop">
              <Mic className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 animate-bounce" />
            Voice-Enabled Health Assistant
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Tap the microphone, speak about your symptoms, and get instant AI-powered health advice.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-green-500" />
              Speak clearly
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              Describe symptoms
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Get instant analysis
            </div>
          </div>
          
          {/* Demo Section */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Start</h3>
              <p className="text-gray-600 text-sm mb-4">
                Try our demo voices to see how it works, or record your own voice input below.
              </p>
            </div>
            <div className="flex justify-center">
              <DemoButton onClick={onDemoClick} />
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm font-medium">
                ↓ OR ↓
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Give your own voice input using the microphone below
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructionsPanel; 