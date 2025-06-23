
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AudioVisualizer from "@/components/AudioVisualizer";
import { useToast } from "@/hooks/use-toast";

const StartConsultation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

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
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      if (!conversationStarted) {
        setConversationStarted(true);
        toast({
          title: "Consultation Started",
          description: "Please describe your symptoms or health concerns."
        });
      }
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to start the consultation.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append('audio', audioBlob, 'recording.wav');
    // const response = await fetch('/api/process-audio', {
    //   method: 'POST',
    //   body: formData
    // });
    
    // Mock API processing
    setTimeout(async () => {
      setIsProcessing(false);
      
      // Mock AI response
      const mockResponses = [
        "Thank you for sharing your symptoms. Based on what you've described, I'd like to ask a few follow-up questions to better understand your condition.",
        "I understand your concerns. Let me analyze the symptoms you've mentioned and provide some initial insights.",
        "From your description, there are several potential causes we should explore. Can you tell me more about when these symptoms started?"
      ];
      
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setAiResponse(response);
      
      // Start AI speaking animation
      setIsAiSpeaking(true);
      
      // TODO: Replace with actual text-to-speech API
      // const ttsResponse = await fetch('/api/text-to-speech', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: response })
      // });
      // const audioUrl = await ttsResponse.blob();
      
      // Mock audio playback (you'll replace this with actual TTS audio)
      setTimeout(() => {
        setIsAiSpeaking(false);
        toast({
          title: "AI Analysis Complete",
          description: "You can now respond or ask follow-up questions."
        });
      }, 3000);
      
    }, 2000);

    setAudioBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Health Consultation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Speak naturally about your symptoms and health concerns. Our AI will listen, 
            analyze, and provide personalized health insights and recommendations.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Volume2 className="w-6 h-6 text-blue-600" />
              Voice Consultation
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Audio Visualizer */}
            <div className="flex justify-center">
              <AudioVisualizer isActive={isRecording || isAiSpeaking} />
            </div>

            {/* Status Display */}
            <div className="text-center">
              {!conversationStarted && (
                <p className="text-gray-600">Click the microphone to start your consultation</p>
              )}
              {isRecording && (
                <p className="text-blue-600 font-medium">🎤 Listening... Speak about your symptoms</p>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is analyzing your symptoms...</span>
                </div>
              )}
              {isAiSpeaking && (
                <p className="text-green-600 font-medium">🤖 AI is speaking...</p>
              )}
            </div>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-2">AI Health Assistant:</h3>
                <p className="text-blue-800">{aiResponse}</p>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>

              {audioBlob && !isProcessing && (
                <Button
                  onClick={sendAudio}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send for Analysis
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Click the microphone button to start recording</li>
                <li>Describe your symptoms, pain, or health concerns clearly</li>
                <li>Click the stop button when you're finished speaking</li>
                <li>Send your recording for AI analysis</li>
                <li>Listen to the AI's response and follow-up questions</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* API Integration Placeholders */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 API Integration Points:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Audio processing: POST /api/process-audio</li>
            <li>• Text-to-speech: POST /api/text-to-speech</li>
            <li>• Health analysis: POST /api/analyze-symptoms</li>
            <li>• Conversation history: GET/POST /api/conversation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartConsultation;
