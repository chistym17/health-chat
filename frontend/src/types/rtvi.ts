import { RTVIClient, RTVIEvent, RTVIMessage, Participant, BotLLMTextData, Transport } from "@pipecat-ai/client-js";

export interface TranscriptData {
  text: string;
  final: boolean;
}

export interface RTVIState {
  isConnected: boolean;
  isBotConnected: boolean;
  isBotReady: boolean;
  transportState: string;
  currentSpeaker: 'user' | 'bot' | '';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  isInterim?: boolean;
  timestamp: Date;
}

export type { RTVIClient, RTVIEvent, RTVIMessage, Participant, BotLLMTextData, Transport }; 