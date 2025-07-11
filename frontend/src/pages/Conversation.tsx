import { useState } from "react";
import Navigation from "@/components/Navigation";
import InstructionsPanel from "@/components/InstructionsPanel";
import VoiceRecorder from "@/components/VoiceRecorder";
import ChatWidget from "@/components/ChatWidget";
import DemoModal from "@/components/DemoModal";
import AnimationStyles from "@/components/AnimationStyles";
import { Message, createVoiceMessage, createBotResponse, getInitialMessage } from "@/utils/chatUtils";
import { DemoVoice } from "@/data/demoVoiceData";
import { createDemoAudioBlob, getDemoMessageContent } from "@/utils/demoUtils";

const Conversation = () => {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Helper to check if the audio is a demo audio (by presence of demoVoiceId)
  const isDemoAudio = (audioBlob: Blob & { demoVoiceId?: string }): boolean => {
    return Boolean(audioBlob && (audioBlob as any).demoVoiceId);
  };

  // Real audio submission handler
  const sendRealAudioToBackend = async (audioBlob: Blob) => {
    console.log("🔄 Starting real audio processing in Conversation page...");
    setIsProcessing(true);
    setMessages(prev => [...prev, createVoiceMessage("0:00")]);
    
    try {
      console.log("Sending audio to backend from Conversation page...");
      const formData = new FormData();
      formData.append("audio", audioBlob, "user_audio.wav");
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/api/audio`, {
        method: "POST",
        body: formData,
      });
      
      console.log("📥 Received response from backend, status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("📋 Backend response data:", data);
      
      // Handle different response types
      if (data.type === "diagnosis") {
        console.log("✅ Received diagnosis response");
        setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
        console.log("📝 Transcribed text:", data.transcribed_text);
        console.log("🤖 AI response:", data.message);
      } else if (data.type === "info") {
        console.log("ℹ️ Received info response");
        setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
      } else if (data.type === "followup") {
        console.log("❓ Received followup response");
        setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
      } else if (data.type === "error") {
        console.error("❌ Received error response:", data.message);
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
      } else {
        console.warn("⚠️ Unknown response type:", data.type);
        setMessages(prev => [...prev, { type: "bot", content: "Received unexpected response from server." }]);
      }
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error("❌ Error in real audio processing:", error);
      setIsProcessing(false);
      setMessages(prev => [...prev, { 
        type: "bot", 
        content: `Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    }
  };

  // Demo audio submission handler (HTTP API)
  const sendDemoAudioToBackend = async (demoVoiceId: string) => {
    console.log("🔄 Starting demo audio processing in Conversation page...");
    setIsProcessing(true);
    setMessages(prev => [...prev, {
      type: 'user',
      content: `🎤 Demo Voice Message (${demoVoiceId})`
    }]);
    
    try {
      console.log("📤 Sending demo request to backend...");
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/api/demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ demo_voice_id: demoVoiceId }),
      });
      
      console.log("📥 Received response from backend, status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend error:", errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("📋 Backend response data:", data);
      
      if (data.type === "diagnosis") {
        console.log("✅ Received diagnosis response");
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
        console.log("📝 Transcribed text:", data.transcribed_text);
        console.log("🤖 AI response:", data.message);
      } else if (data.type === "error") {
        console.error("❌ Received error response:", data.message);
        setMessages(prev => [...prev, { type: "bot", content: data.message }]);
      } else {
        console.warn("⚠️ Unknown response type:", data.type);
        setMessages(prev => [...prev, { type: "bot", content: "Received unexpected response from server." }]);
      }
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error("❌ Error in demo audio processing:", error);
      setIsProcessing(false);
      setMessages(prev => [...prev, {
        type: "bot", 
        content: `Error processing demo audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    }
  };

  // Main handler for audio submission
  const handleAudioSubmission = async (audioBlob: Blob & { demoVoiceId?: string }) => {
    if (isDemoAudio(audioBlob)) {
      // If it's a demo audio, send demoVoiceId to backend via WebSocket
      await sendDemoAudioToBackend((audioBlob as any).demoVoiceId);
    } else {
      // Otherwise, treat as real user audio
      await sendRealAudioToBackend(audioBlob);
    }
  };

  // Demo handler (called from modal)
  const handleDemoSubmission = async (demoVoice: DemoVoice) => {
    // Attach demoVoiceId to a dummy blob for the handler
    const dummyBlob = new Blob(["demo"], { type: "audio/mp3" }) as Blob & { demoVoiceId?: string };
    dummyBlob.demoVoiceId = demoVoice.id;
    await handleAudioSubmission(dummyBlob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-2 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Instructions & Voice Input */}
          <div className="md:w-5/12 w-full flex flex-col gap-6">
            <InstructionsPanel onDemoClick={() => setIsDemoModalOpen(true)} />
            <VoiceRecorder onAudioSubmit={handleAudioSubmission} isProcessing={isProcessing} />
                  </div>
          {/* Right: Chat Widget */}
          <div className="md:w-7/12 w-full flex flex-col">
            <ChatWidget messages={messages} isProcessing={isProcessing} />
                  </div>
                </div>
            </div>
            
      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSendDemo={handleDemoSubmission}
      />
      
      <AnimationStyles />
    </div>
  );
};

export default Conversation;
