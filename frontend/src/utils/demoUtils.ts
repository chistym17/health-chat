import { DemoVoice } from "@/data/demoVoiceData";
import { createVoiceMessage } from "./chatUtils";

export const createDemoAudioBlob = async (demoVoice: DemoVoice): Promise<Blob> => {
  try {
    // Fetch the audio file from the public directory
    const response = await fetch(demoVoice.audio);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    
    // Convert the response to a blob
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error('Error creating demo audio blob:', error);
    // Return an empty blob as fallback
    return new Blob([], { type: 'audio/mp3' });
  }
};

export const createDemoUserMessage = (demoVoice: DemoVoice) => {
  return createVoiceMessage(`Demo: ${demoVoice.speaker}`);
};

export const getDemoMessageContent = (demoVoice: DemoVoice) => {
  return `🎤 Demo Voice Message (${demoVoice.speaker}): ${demoVoice.transcript}`;
}; 