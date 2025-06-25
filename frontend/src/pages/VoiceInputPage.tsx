import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructionsPanel from "@/components/InstructionsPanel";
import VoiceRecorder from "@/components/VoiceRecorder";
import DemoModal from "@/components/DemoModal";
import { DemoVoice } from "@/data/demoVoiceData";
import { useAudioContext } from "@/context/AudioContext";
import AnimationStyles from "@/components/AnimationStyles";

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
      <div className="max-w-2xl mx-auto px-2 py-8">
        <InstructionsPanel onDemoClick={() => setIsDemoModalOpen(true)} />
        <div className="mt-8">
          <VoiceRecorder onAudioSubmit={handleAudioSubmission} isProcessing={isProcessing} />
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