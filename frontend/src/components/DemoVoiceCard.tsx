import { DemoVoice } from "@/data/demoVoiceData";
import { useRef } from "react";
import { Play, Volume2 } from "lucide-react";

interface DemoVoiceCardProps {
  demoVoice: DemoVoice;
  selected: boolean;
  onSelect: () => void;
  onPlay: () => void;
}

const DemoVoiceCard = ({ demoVoice, selected, onSelect, onPlay }: DemoVoiceCardProps) => {
  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg border shadow-md transition-all duration-200 cursor-pointer ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onPlay(); }}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
        >
          <Play className="w-5 h-5 text-blue-600" />
        </button>
        <span className="font-semibold text-gray-800">{demoVoice.speaker}</span>
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="accent-blue-600 ml-auto"
        />
      </div>
      <div className="flex items-center gap-2 text-gray-700 text-sm">
        <Volume2 className="w-4 h-4 text-blue-400" />
        <span>{demoVoice.transcript}</span>
      </div>
    </div>
  );
};

export default DemoVoiceCard; 