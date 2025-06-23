import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface DemoButtonProps {
  onClick: () => void;
}

const DemoButton = ({ onClick }: DemoButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="bg-white/80 hover:bg-white border-blue-300 text-blue-700 hover:text-blue-800 shadow-md"
    >
      <Play className="w-4 h-4 mr-2" />
      Try Demo
    </Button>
  );
};

export default DemoButton; 