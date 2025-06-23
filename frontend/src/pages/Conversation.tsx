import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Mic, Square, Info, Sparkles, Volume2, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";

const Conversation = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm your AI healthcare assistant. I can now understand your voice! Click the microphone button below and start speaking to describe your symptoms or health concerns. I'll analyze your voice input and provide personalized recommendations."
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleAudioSubmission(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleAudioSubmission = (audioBlob: Blob) => {
    setIsProcessing(true);
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: `🎤 Voice message (${formatTime(recordingTime)})` 
    }]);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I've received your voice message and I'm processing it. Based on what you've described, I can help identify potential causes and suggest next steps. Please note that this is for informational purposes only and should not replace professional medical advice."
      }]);
      setIsProcessing(false);
    }, 2000);
    console.log('Audio blob to send to backend:', audioBlob);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-2 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Instructions & Voice Input */}
          <div className="md:w-5/12 w-full flex flex-col gap-6">
            <Card className="bg-white/80 backdrop-blur-md border-blue-200 shadow-xl animate-fade-in">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
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
                </div>
              </CardContent>
            </Card>
            {/* Voice Recording Interface */}
            <Card className="bg-white/90 backdrop-blur-md border-blue-200 shadow-xl animate-fade-in flex-1 flex flex-col items-center justify-center">
              <CardContent className="flex flex-col items-center gap-6 py-8">
                {isRecording && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-mono text-red-600 animate-pulse">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      Recording...
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 shadow-2xl transition-transform duration-200 active:scale-95 animate-pop"
                    >
                      <Mic className="w-10 h-10 animate-pulse" />
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl transition-transform duration-200 active:scale-95 animate-pop"
                    >
                      <Square className="w-10 h-10" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  {isRecording 
                    ? "Tap the stop button when you're done speaking"
                    : isProcessing 
                      ? "Processing your message..."
                      : "Tap the microphone to start recording your message"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Right: Chat Widget */}
          <div className="md:w-7/12 w-full flex flex-col">
            <Card className="h-[600px] flex flex-col bg-white/90 backdrop-blur-md border-blue-200 shadow-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-blue-600 animate-bounce" />
                  AI Health Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                        message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg transition-all duration-200 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto animate-pop'
                          : 'bg-gray-200 text-gray-900 animate-fade-in'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          Processing your voice message...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes pop { 0% { transform: scale(0.7);} 80% { transform: scale(1.1);} 100% { transform: scale(1);} }
        .animate-pop { animation: pop 0.4s cubic-bezier(.4,0,.2,1); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default Conversation;
