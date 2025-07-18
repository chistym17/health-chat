import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioContext } from "@/context/AudioContext";
import { Message, createVoiceMessage, createBotResponse, getInitialMessage } from "@/utils/chatUtils";
import Navigation from "@/components/Navigation";
import { Bot, Loader2, Search, Volume2 } from "lucide-react";

const ChatPage = () => {
  const { audioInfo } = useAudioContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<"idle" | "processing" | "searching" | "replying">("idle");
  const [aiTranscript, setAiTranscript] = useState<string>("");

  useEffect(() => {
    if (!audioInfo) {
      navigate("/conversation");
      return;
    }

    // Handle real audio
    const sendRealAudio = async () => {
      if (audioInfo.type !== "real") return;
      
      setIsProcessing(true);
      setProgress("processing");
      setMessages(prev => [...prev, createVoiceMessage("0:00")]);
      
      try {
        const formData = new FormData();
        formData.append("audio", audioInfo.audioBlob, "user_audio.wav");
        
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/api/audio`, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Backend error:", errorText);
          throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        setProgress("searching");
        
        // Handle different response types
        if (data.type === "diagnosis") {
          setProgress("replying");
          // Add transcribed text as user message
          setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
          // Add AI response
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setAiTranscript(data.transcribed_text || "Transcription not available");
        } else if (data.type === "info") {
          setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setAiTranscript(data.transcribed_text || "Transcription not available");
        } else if (data.type === "followup") {
          setMessages(prev => [...prev, { type: "user", content: data.transcribed_text }]);
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setAiTranscript(data.transcribed_text || "Transcription not available");
        } else if (data.type === "error") {
          console.error("❌ Received error response:", data.message);
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
        } else {
          console.warn("⚠️ Unknown response type:", data.type);
          setMessages(prev => [...prev, { type: "bot", content: "Received unexpected response from server." }]);
        }
        
        setIsProcessing(false);
        setTimeout(() => setProgress("idle"), 2000);
        
      } catch (error) {
        console.error("❌ Error in real audio processing:", error);
        setIsProcessing(false);
        setProgress("idle");
        setMessages(prev => [...prev, { 
          type: "bot", 
          content: `Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }]);
      }
    };

    // Handle demo audio
    const sendDemoAudio = async () => {
      if (audioInfo.type !== "demo") return;
      
      setIsProcessing(true);
      setProgress("processing");
      setMessages(prev => [...prev, {
        type: 'user',
        content: `🎤 Demo Voice Message (${audioInfo.demoVoiceId})`
      }]);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/api/demo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ demo_voice_id: audioInfo.demoVoiceId }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Backend error:", errorText);
          throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        setProgress("searching");
        
        if (data.type === "diagnosis") {
          setProgress("replying");
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setAiTranscript(data.transcribed_text || "Transcription not available");
        } else if (data.type === "error") {
          console.error("❌ Received error response:", data.message);
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
        } else {
          console.warn("⚠️ Unknown response type:", data.type);
          setMessages(prev => [...prev, { type: "bot", content: "Received unexpected response from server." }]);
        }
        
        setIsProcessing(false);
        setTimeout(() => setProgress("idle"), 2000);
        
      } catch (error) {
        console.error("❌ Error in demo audio processing:", error);
        setIsProcessing(false);
        setProgress("idle");
        setMessages(prev => [...prev, { 
          type: "bot", 
          content: `Error processing demo audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }]);
      }
    };

    // Start the chat flow
    if (audioInfo.type === "real") {
      sendRealAudio();
    } else if (audioInfo.type === "demo") {
      setMessages([getInitialMessage()]); // Reset for new chat
      sendDemoAudio();
    }
  }, [audioInfo, navigate]);

  if (!audioInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Chat Messages */}
          <div className="lg:w-2/3 w-full">
            <div className="bg-white/90 rounded-2xl shadow-2xl p-6 min-h-[600px] flex flex-col border border-blue-100">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="w-7 h-7 text-blue-600" />
                <span className="text-2xl font-semibold text-gray-800">AI Health Assistant</span>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Transcript and Additional Info */}
          <div className="lg:w-1/3 w-full">
            <div className="bg-white/90 rounded-2xl shadow-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Analysis Details
              </h3>
              
              {/* Progress States */}
              {progress === "processing" && (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-blue-600 font-medium">Processing your voice...</span>
                </div>
              )}
              {progress === "searching" && (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Search className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-purple-700 font-medium">Searching medical knowledge...</span>
                </div>
              )}
              {progress === "replying" && (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Volume2 className="w-6 h-6 text-green-600 animate-bounce" />
                  <span className="text-green-700 font-medium">Preparing response...</span>
                </div>
              )}
              
              {/* Transcript */}
              {aiTranscript && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Voice Transcript:</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-600 text-sm">
                    {aiTranscript}
                  </div>
                </div>
              )}
              
              {/* Voice Reply Placeholder */}
              {progress === "idle" && aiTranscript && (
                <div className="border-t pt-4">
                  <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-semibold flex items-center justify-center gap-2 transition mb-2 cursor-not-allowed" disabled>
                    <Volume2 className="w-4 h-4" />
                    Voice Reply (Coming Soon)
                  </button>
                  <span className="text-gray-400 text-xs text-center block">
                    You will soon be able to listen to the AI's response as audio.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 