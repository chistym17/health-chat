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
  const wsRef = useRef<WebSocket | null>(null);

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
        const response = await fetch("/api/audio", {
          method: "POST",
          body: formData,
        });
        setProgress("searching");
        // Simulate AI processing (replace with real response handling)
        setTimeout(() => {
          setMessages(prev => [...prev, createBotResponse()]);
          setIsProcessing(false);
          setProgress("replying");
          setTimeout(() => setProgress("idle"), 2000);
        }, 2000);
      } catch (error) {
        setIsProcessing(false);
        setProgress("idle");
        setMessages(prev => [...prev, { type: "bot", content: "Error sending audio to backend." }]);
      }
    };

    // Handle demo audio
    const sendDemoAudio = () => {
      if (audioInfo.type !== "demo") return;
      setIsProcessing(true);
      setProgress("processing");
      setMessages(prev => [...prev, {
        type: 'user',
        content: `🎤 Demo Voice Message (${audioInfo.demoVoiceId})`
      }]);
      const ws = new WebSocket("ws://localhost:8000/ws/demo");
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ demo_voice_id: audioInfo.demoVoiceId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "diagnosis") {
          setProgress("replying");
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          setAiTranscript(data.message);
          setIsProcessing(false);
          setTimeout(() => setProgress("idle"), 2000);
          ws.close();
        } else if (data.type === "error") {
          setIsProcessing(false);
          setProgress("idle");
          setMessages(prev => [...prev, { type: "bot", content: data.message }]);
          ws.close();
        } else if (data.type === "demo_processing") {
          setProgress("searching");
        }
      };
      ws.onerror = () => {
        setIsProcessing(false);
        setProgress("idle");
        setMessages(prev => [...prev, { type: "bot", content: "WebSocket error with demo voice." }]);
        ws.close();
      };
    };

    // Start the chat flow
    if (audioInfo.type === "real") {
      sendRealAudio();
    } else if (audioInfo.type === "demo") {
      setMessages([getInitialMessage()]); // Reset for new chat
      sendDemoAudio();
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line
  }, [audioInfo, navigate]);

  if (!audioInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full bg-white/90 rounded-2xl shadow-2xl p-10 min-h-[500px] flex flex-col items-center border border-blue-100 justify-center">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-7 h-7 text-blue-600" />
            <span className="text-2xl font-semibold text-gray-800">AI Health Response</span>
          </div>
          {/* Loading/progress states */}
          {progress === "processing" && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              <span className="text-blue-600 font-medium text-lg">Processing your voice...</span>
            </div>
          )}
          {progress === "searching" && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <Search className="w-7 h-7 text-purple-500 animate-pulse" />
              <span className="text-purple-700 font-medium text-lg">Searching medical knowledge...</span>
            </div>
          )}
          {progress === "replying" && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <Volume2 className="w-7 h-7 text-green-600 animate-bounce" />
              <span className="text-green-700 font-medium text-lg">Preparing voice reply...</span>
            </div>
          )}
          {/* Transcript and voice reply placeholder */}
          {progress === "idle" && aiTranscript && (
            <div className="w-full mt-4 flex flex-col items-center">
              <div className="bg-gray-100 rounded p-5 text-gray-700 text-lg w-full max-w-2xl mx-auto shadow">
                <span className="font-semibold">Transcript:</span>
                <div className="mt-2 whitespace-pre-line">{aiTranscript}</div>
              </div>
              <div className="flex flex-col items-center gap-2 mt-8 w-full">
                <button className="w-full max-w-xs py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-semibold flex items-center justify-center gap-2 transition mb-2 cursor-not-allowed" disabled>
                  <Volume2 className="w-5 h-5" />
                  Voice Reply (Coming Soon)
                </button>
                <span className="text-gray-400 text-sm">You will soon be able to listen to the AI's response as audio.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 