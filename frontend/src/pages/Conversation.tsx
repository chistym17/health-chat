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

  const handleAudioSubmission = (audioBlob: Blob) => {
    setIsProcessing(true);
    
    // Add user message indicating voice input
    setMessages(prev => [...prev, createVoiceMessage("0:00")]);
    
    // Simulate AI processing
    setTimeout(() => {
      setMessages(prev => [...prev, createBotResponse()]);
      setIsProcessing(false);
    }, 2000);
    
    // TODO: Send audioBlob to backend
    console.log('Audio blob to send to backend:', audioBlob);
  };

  const handleDemoSubmission = async (demoVoice: DemoVoice) => {
    setIsProcessing(true);
    
    // Add demo message with transcript
    setMessages(prev => [...prev, {
      type: 'user',
      content: getDemoMessageContent(demoVoice)
    }]);
    
    // Create audio blob from demo file
    const audioBlob = await createDemoAudioBlob(demoVoice);
    
    // Simulate AI processing
    setTimeout(() => {
      setMessages(prev => [...prev, createBotResponse()]);
      setIsProcessing(false);
    }, 2000);
    
    // TODO: Send audioBlob to backend
    console.log('Demo audio blob to send to backend:', audioBlob);
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
