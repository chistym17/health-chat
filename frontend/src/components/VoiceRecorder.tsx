import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square } from "lucide-react";
import { formatTime } from "../utils/timeUtils";

interface VoiceRecorderProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const VoiceRecorder = ({ onAudioSubmit, isProcessing }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
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
        onAudioSubmit(audioBlob);
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

  return (
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
  );
};

export default VoiceRecorder; 