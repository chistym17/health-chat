
import { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

const AudioVisualizer = ({ isActive }: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(5).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(5).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 100));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center justify-center gap-1 h-16 w-32">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-2 rounded-full transition-all duration-150 ${
            isActive ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          style={{
            height: isActive ? `${Math.max(height, 10)}%` : '10%'
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
