import React, { createContext, useContext, useState, ReactNode } from "react";

export type AudioInfo =
  | { type: "real"; audioBlob: Blob }
  | { type: "demo"; demoVoiceId: string; transcript: string };

interface AudioContextType {
  audioInfo: AudioInfo | null;
  setAudioInfo: (info: AudioInfo | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  return (
    <AudioContext.Provider value={{ audioInfo, setAudioInfo }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}; 