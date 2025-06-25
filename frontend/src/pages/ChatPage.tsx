import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioContext } from "@/context/AudioContext";
import ChatWidget from "@/components/ChatWidget";
import { Message, createVoiceMessage, createBotResponse, getInitialMessage } from "@/utils/chatUtils";

const ChatPage = () => {
  const { audioInfo } = useAudioContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [isProcessing, setIsProcessing] = useState(false);
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
      setMessages(prev => [...prev, createVoiceMessage("0:00")]);
      try {
        const formData = new FormData();
        formData.append("audio", audioInfo.audioBlob, "user_audio.wav");
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

    // Handle demo audio
    const sendDemoAudio = () => {
      if (audioInfo.type !== "demo") return;
      setIsProcessing(true);
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
      <div className="max-w-2xl mx-auto px-2 py-8">
        {/* Audio player and transcript (if demo) */}
        <div className="mb-8">
          {audioInfo.type === "real" ? (
            <audio controls src={URL.createObjectURL(audioInfo.audioBlob)} className="w-full rounded shadow" />
          ) : (
            <div className="space-y-2">
              <audio controls src={`/audio/demo/${audioInfo.demoVoiceId.replace(/_/g, '-')}.mp3`} className="w-full rounded shadow" />
              <div className="bg-gray-100 rounded p-3 text-gray-700 text-sm">
                <span className="font-semibold">Transcript:</span> {audioInfo.transcript}
              </div>
            </div>
          )}
        </div>
        {/* Chat widget */}
        <ChatWidget messages={messages} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default ChatPage; 