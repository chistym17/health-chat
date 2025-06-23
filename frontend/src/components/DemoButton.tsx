import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";

interface DemoButtonProps {
  onClick: () => void;
}

const DemoButton = ({ onClick }: DemoButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="bg-gray-700 hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold"
    >
      <Sparkles className="w-5 h-5 mr-3" />
      <Play className="w-5 h-5 mr-2" />
      Try Demo Voices
    </Button>
  );
};

export default DemoButton; 