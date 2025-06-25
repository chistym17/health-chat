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
    setIsProcessing(true);
    setMessages(prev => [...prev, createVoiceMessage("0:00")]);
    try {
      // Example: POST to /api/audio (adjust as needed)
      const formData = new FormData();
      formData.append("audio", audioBlob, "user_audio.wav");
      const response = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });
      // Simulate AI processing (replace with real response handling)
      setTimeout(() => {
        setMessages(prev => [...prev, createBotResponse()]);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setMessages(prev => [...prev, { type: "bot", content: "Error sending audio to backend." }]);
    }
  };

  // Demo audio submission handler (WebSocket)
  const sendDemoAudioToBackend = async (demoVoiceId: string) => {
    setIsProcessing(true);
    setMessages(prev => [...prev, {
      type: 'user',
      content: `🎤 Demo Voice Message (${demoVoiceId})`
    }]);
    try {
      const ws = new WebSocket("ws://localhost:8000/ws/demo");
      ws.onopen = () => {
        ws.send(JSON.stringify({ demo_voice_id: demoVoiceId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "diagnosis") {
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setIsProcessing(false);
          ws.close();
        } else if (data.type === "error") {
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setIsProcessing(false);
          ws.close();
        } else if (data.type === "demo_processing") {
          // Optionally show a processing message
        }
      };
      ws.onerror = () => {
        setIsProcessing(false);
        setMessages(prev => [...prev, { type: "bot", content: "WebSocket error with demo voice." }]);
        ws.close();
      };
    } catch (error) {
      setIsProcessing(false);
      setMessages(prev => [...prev, { type: "bot", content: "Error sending demo audio to backend." }]);
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
