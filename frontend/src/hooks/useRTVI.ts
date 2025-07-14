"use client"
import { useState, useCallback, useRef, useEffect } from 'react';
import { RTVIClient, RTVIEvent, Participant, BotLLMTextData } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { RTVIState, TranscriptData, ChatMessage } from '../types/rtvi';

export const useRTVI = (autoStart: boolean = true) => {
  const [rtviState, setRtviState] = useState<RTVIState>({
    isConnected: false,
    isBotConnected: false,
    isBotReady: false,
    transportState: 'disconnected',
    currentSpeaker: '',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const rtviClientRef = useRef<RTVIClient | null>(null);
  const audioRef = useRef<HTMLDivElement | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      return updated;
    });
  }, []);

  const updateLastMessage = useCallback((text: string, isInterim: boolean = false) => {
    setMessages(prev => {
      if (prev.length === 0) {
        return prev;
      }
      const lastMessage = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, text, isInterim }
      ];
    });
  }, []);

  const setupEventHandlers = useCallback((client: RTVIClient) => {
    client.on(RTVIEvent.TransportStateChanged, (state: string) => {
      setRtviState(prev => ({ ...prev, transportState: state }));
    });

    client.on(RTVIEvent.Connected, () => {
      setRtviState(prev => ({ ...prev, isConnected: true }));
    });

    client.on(RTVIEvent.Disconnected, () => {
      setRtviState(prev => ({ ...prev, isConnected: false }));
    });

    client.on(RTVIEvent.BotConnected, () => {
      setRtviState(prev => ({ ...prev, isBotConnected: true }));
    });

    client.on(RTVIEvent.BotDisconnected, () => {
      setRtviState(prev => ({ ...prev, isBotConnected: false }));
    });

    client.on(RTVIEvent.BotReady, () => {
      setRtviState(prev => ({ ...prev, isBotReady: true }));
    });

    client.on(RTVIEvent.TrackStarted, (track: MediaStreamTrack, participant?: Participant) => {
      if (!participant || participant.local || !audioRef.current) return;
      
      const audio = document.createElement("audio");
      audio.srcObject = new MediaStream([track]);
      audio.autoplay = true;
      audioRef.current.appendChild(audio);
    });

    client.on(RTVIEvent.UserStartedSpeaking, () => {
      setRtviState(prev => ({ ...prev, currentSpeaker: 'user' }));
    });

    client.on(RTVIEvent.UserStoppedSpeaking, () => {
      setRtviState(prev => ({ ...prev, currentSpeaker: '' }));
    });

    client.on(RTVIEvent.BotStartedSpeaking, () => {
      setRtviState(prev => ({ ...prev, currentSpeaker: 'bot' }));
      addMessage({ type: 'bot', text: '' });
    });

    client.on(RTVIEvent.BotStoppedSpeaking, () => {
      setRtviState(prev => ({ ...prev, currentSpeaker: '' }));
    });

    client.on(RTVIEvent.UserTranscript, (transcript: TranscriptData) => {
      if (transcript.final) {
        addMessage({ type: 'user', text: transcript.text });
      } else {
        setMessages(prev => {
          if (prev.length === 0 || prev[prev.length - 1].type !== 'user' || !prev[prev.length - 1].isInterim) {
            return [...prev, {
              id: Date.now().toString(),
              type: 'user',
              text: transcript.text,
              timestamp: new Date(),
              isInterim: true
            }];
          } else {
            return [
              ...prev.slice(0, -1),
              { ...prev[prev.length - 1], text: transcript.text }
            ];
          }
        });
      }
    });

    client.on(RTVIEvent.BotTranscript, (data: BotLLMTextData) => {
      updateLastMessage(data.text, false);

      console.log('in rtvi Bot transcript:', data.text);
      // Pattern match for completion phrase
      if (
        typeof data.text === 'string' &&
        data.text.toLowerCase().includes('information gathering complete. ready for diagnosis.')
      ) {
        alert('Information gathering complete. Ready for diagnosis!');
      }
    });

    client.on(RTVIEvent.ServerMessage, (data) => {
      // Handle any server messages here if needed
    });

    client.on(RTVIEvent.Error, (message) => {
      setError(`RTVI Error: ${message}`);
    });

    client.on(RTVIEvent.MessageError, (message) => {
      setError(`Message Error: ${message}`);
    });
  }, [addMessage, updateLastMessage]);

  const startBot = useCallback(async () => {
    if (isConnecting || rtviState.isConnected) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_RTVI_BASE_URL || "http://localhost:8000/";
      const transport = new DailyTransport();
      const client = new RTVIClient({
        transport,
        params: {
          baseUrl,
        },
        enableMic: true,
        enableCam: false,
        timeout: 30 * 1000,
      });

      rtviClientRef.current = client;
      setupEventHandlers(client);

      await client.initDevices();
      await client.connect();
    } catch (e) {
      setError(`Connection error: ${e}`);
    } finally {
      setIsConnecting(false);
    }
  }, [setupEventHandlers, isConnecting, rtviState.isConnected]);

  const disconnect = useCallback(() => {
    if (rtviClientRef.current) {
      rtviClientRef.current.disconnect();
      rtviClientRef.current = null;
    }
    setRtviState({
      isConnected: false,
      isBotConnected: false,
      isBotReady: false,
      transportState: 'disconnected',
      currentSpeaker: '',
    });
    setMessages([]);
    setError(null);
    setHasAutoStarted(false);
  }, []);

  // Auto-start connection when component mounts
  useEffect(() => {
    if (autoStart && !hasAutoStarted && !isConnecting && !rtviState.isConnected) {
      setHasAutoStarted(true);
      startBot();
    }
  }, [autoStart, hasAutoStarted, isConnecting, rtviState.isConnected, startBot]);

  return {
    rtviState,
    messages,
    isConnecting,
    error,
    startBot,
    disconnect,
    audioRef,
  };
}; 