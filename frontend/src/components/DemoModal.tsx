import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { demoVoices, DemoVoice } from "@/data/demoVoiceData";
import DemoVoiceCard from "./DemoVoiceCard";
import { Send, X, Play, Mic } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendDemo: (demoVoice: DemoVoice) => void;
}

const DemoModal = ({ isOpen, onClose, onSendDemo }: DemoModalProps) => {
  const [selectedDemo, setSelectedDemo] = useState<DemoVoice | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handlePlayAudio = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.play();
    setPlayingAudio(audioPath);
    
    audio.onended = () => {
      setPlayingAudio(null);
    };
  };

  const handleUseAudio = (demoVoice: DemoVoice) => {
    onSendDemo(demoVoice);
    onClose();
    setSelectedDemo(null);
  };

  const handleSendDemo = () => {
    if (selectedDemo) {
      onSendDemo(selectedDemo);
      onClose();
      setSelectedDemo(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
            <span className="flex items-center gap-2">
              <Mic className="w-6 h-6 text-blue-600" />
              Try Demo Voice Messages
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-gray-600 text-center text-lg">
            Select a demo voice message to see how the AI responds. Click play to hear the audio, then use it directly or select and send.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {demoVoices.map((demoVoice) => (
              <div key={demoVoice.id} className="space-y-3">
                <DemoVoiceCard
                  demoVoice={demoVoice}
                  selected={selectedDemo?.id === demoVoice.id}
                  onSelect={() => setSelectedDemo(demoVoice)}
                  onPlay={() => handlePlayAudio(demoVoice.audio)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePlayAudio(demoVoice.audio)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Audio
                  </Button>
                  <Button
                    onClick={() => handleUseAudio(demoVoice)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Use This Audio
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-6 border-t">
            <Button
              onClick={handleSendDemo}
              disabled={!selectedDemo}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-8 py-3 text-lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Selected Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal; 