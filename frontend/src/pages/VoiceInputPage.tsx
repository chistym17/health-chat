import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructionsPanel from "@/components/InstructionsPanel";
import VoiceRecorder from "@/components/VoiceRecorder";
import DemoModal from "@/components/DemoModal";
import { DemoVoice } from "@/data/demoVoiceData";
import { useAudioContext } from "@/context/AudioContext";
import AnimationStyles from "@/components/AnimationStyles";
import Navigation from "@/components/Navigation";
import { Mic, Sparkles } from "lucide-react";

const VoiceInputPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setAudioInfo } = useAudioContext();
  const navigate = useNavigate();

  // Handle real audio submission
  const handleAudioSubmission = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setAudioInfo({ type: "real", audioBlob });
    navigate("/conversation/chat");
  };

  // Handle demo audio selection
  const handleDemoSubmission = async (demoVoice: DemoVoice) => {
    setIsProcessing(true);
    setAudioInfo({ type: "demo", demoVoiceId: demoVoice.id, transcript: demoVoice.transcript });
    navigate("/conversation/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row gap-12 items-stretch justify-center">
          {/* Demo voices (left) */}
          <div className="md:w-1/2 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-xl min-h-[520px] bg-white/90 rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-blue-100 justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <span className="text-xl font-semibold text-gray-800">Try Demo Voices</span>
              </div>
              <p className="text-gray-700 text-base mb-4 text-center">
                Not sure what to say? Try one of our pre-recorded medical scenarios to see how the AI responds. This is a great way to explore the system without recording your own voice.
              </p>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-800 text-white rounded-lg shadow-md font-semibold flex items-center justify-center gap-2 transition mb-4"
              >
                <Sparkles className="w-5 h-5" />
                Open Demo Voices
              </button>
              <div className="flex-1 flex flex-col justify-end">
                <p className="text-gray-500 text-sm mt-4 text-center">
                  Select a demo and click <span className="font-semibold">Use This Audio</span> to continue.
                </p>
              </div>
            </div>
          </div>
          {/* User voice input (right) */}
          <div className="md:w-1/2 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-xl min-h-[520px] bg-white/90 rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-blue-100 justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-800">Your Voice Input</span>
              </div>
              <p className="text-gray-700 text-base mb-4 text-center">
                Record your own voice describing your symptoms or health concerns. Speak clearly and naturally—our AI will analyze your input and provide helpful recommendations.
              </p>
              <VoiceRecorder onAudioSubmit={handleAudioSubmission} isProcessing={isProcessing} />
              <div className="flex-1 flex flex-col justify-end">
                <p className="text-gray-500 text-sm mt-4 text-center">
                  After recording, click the stop button and your message will be analyzed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSendDemo={handleDemoSubmission}
      />
      <AnimationStyles />
    </div>
  );
};

export default VoiceInputPage; 