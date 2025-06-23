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
  content: "I've received your voice message and I'm processing it. Based on what you've described, I can help identify potential causes and suggest next steps. Please note that this is for informational purposes only and should not replace professional medical advice."
});

export const getInitialMessage = (): Message => ({
  type: 'bot',
  content: "Hello! I'm your AI healthcare assistant. I can now understand your voice! Click the microphone button below and start speaking to describe your symptoms or health concerns. I'll analyze your voice input and provide personalized recommendations."
}); 