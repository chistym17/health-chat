export interface Message {
  type: 'user' | 'bot';
  content: string;
}

export const createVoiceMessage = (recordingTime: string): Message => ({
  type: 'user',
  content: `🎤 Voice message (${recordingTime})`
});

export const createBotResponse = (): Message => ({
  type: 'bot',
  content: "I've received your voice message and I'm analyzing it. Based on your symptoms, I can help identify potential causes and suggest next steps. Please note this is for informational purposes only."
});

export const getInitialMessage = (): Message => ({
  type: 'bot',
  content: "Hello! I'm your AI healthcare assistant. I can understand your voice! Click the microphone below and start speaking to describe your symptoms."
}); 