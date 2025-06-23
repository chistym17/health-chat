import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { demoVoices, DemoVoice } from "@/data/demoVoiceData";
import DemoVoiceCard from "./DemoVoiceCard";
import { Send, X } from "lucide-react";

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

  const handleSendDemo = () => {
    if (selectedDemo) {
      onSendDemo(selectedDemo);
      onClose();
      setSelectedDemo(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Try Demo Voice Messages</span>
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
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Select a demo voice message to see how the AI responds. Click play to hear the audio, then select and send.
          </p>
          
          <div className="space-y-3">
            {demoVoices.map((demoVoice) => (
              <DemoVoiceCard
                key={demoVoice.id}
                demoVoice={demoVoice}
                selected={selectedDemo?.id === demoVoice.id}
                onSelect={() => setSelectedDemo(demoVoice)}
                onPlay={() => handlePlayAudio(demoVoice.audio)}
              />
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSendDemo}
              disabled={!selectedDemo}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Send className="w-4 h-4 mr-2" />
              Send This Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal; 