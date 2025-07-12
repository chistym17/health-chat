import { useRTVI } from '@/hooks/useRTVI';
import { ChatMessage } from '@/types/rtvi';
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VoiceCommandHelper } from "@/components/VoiceCommandHelper";
import { ContactForm } from "@/components/ContactForm";
import { useContactFormTrigger } from "@/hooks/useContactFormTrigger";
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Volume2, 
  VolumeX,
  Settings,
  MoreVertical,
  Trash2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const VoiceChat = () => {
  const navigate = useNavigate();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const {
    rtviState,
    messages,
    isConnecting,
    error,
    startBot,
    disconnect,
    audioRef,
  } = useRTVI(true);

  const handleFieldUpdate = useCallback((field: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFormSubmit = useCallback(() => {
    alert('Your form has been submitted successfully!');
    
    setFormFields({
      name: '',
      email: '',
      message: ''
    });
    
    setIsContactFormOpen(false);
  }, [formFields, isContactFormOpen]);

  const handleOpenForm = useCallback(() => {
    setIsContactFormOpen(true);
  }, []);

  useContactFormTrigger(messages, handleOpenForm, handleFieldUpdate, handleFormSubmit);

  const scrollToBottom = () => {
    audioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-cyan-50/40 to-slate-100/30 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/20 backdrop-blur-lg border-b border-blue-200/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-slate-700 hover:bg-blue-100/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-800 font-semibold">Voice Assistant</h1>
                <p className="text-sm text-slate-600">
                  {rtviState.currentSpeaker === 'user' ? 'Listening...' : rtviState.currentSpeaker === 'bot' ? 'Speaking...' : rtviState.isBotReady ? 'Online' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          {/* Speaker Display */}
          <div className="relative">
            {/* Main Speaker Circle */}
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-500",
              rtviState.currentSpeaker === 'bot' 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/50 animate-pulse" 
                : rtviState.currentSpeaker === 'user'
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50"
                : "bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg"
            )}>
              {rtviState.currentSpeaker === 'bot' ? (
                <div className="relative">
                  {/* Bot Icon */}
                  <Bot className="w-12 h-12 text-white animate-bounce" />
                  
                  {/* Vibrating Rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" style={{ animationDelay: '1s' }}></div>
                </div>
              ) : rtviState.currentSpeaker === 'user' ? (
                <div className="relative">
                  {/* User Icon */}
                  <User className="w-12 h-12 text-white" />
                  
                  {/* Listening Animation */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse">
                    <div className="w-full h-full bg-red-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Default Icon */}
                  <Mic className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            
            {/* Status Text */}
            <div className="mt-6 text-center">
              <h2 className={cn(
                "text-2xl font-bold mb-2 transition-all duration-300",
                rtviState.currentSpeaker === 'bot' 
                  ? "text-blue-600" 
                  : rtviState.currentSpeaker === 'user'
                  ? "text-indigo-600"
                  : "text-gray-600"
              )}>
                {rtviState.currentSpeaker === 'bot' 
                  ? 'AI Speaking' 
                  : rtviState.currentSpeaker === 'user'
                  ? 'Listening...'
                  : rtviState.isBotReady 
                  ? 'Ready to Chat'
                  : isConnecting 
                  ? 'Connecting...'
                  : 'Disconnected'
                }
              </h2>
              
              <p className={cn(
                "text-sm transition-all duration-300",
                rtviState.currentSpeaker === 'bot' 
                  ? "text-blue-500" 
                  : rtviState.currentSpeaker === 'user'
                  ? "text-indigo-500"
                  : "text-gray-500"
              )}>
                {rtviState.currentSpeaker === 'bot' 
                  ? 'Processing your request...' 
                  : rtviState.currentSpeaker === 'user'
                  ? 'Speak now to interact'
                  : rtviState.isBotReady 
                  ? 'Start a conversation or try voice commands'
                  : isConnecting 
                  ? 'Establishing connection...'
                  : 'Click connect to start'
                }
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 text-sm">{error}</p>
              <Button 
                onClick={startBot} 
                className="mt-2 text-xs"
                variant="outline"
              >
                Retry Connection
              </Button>
            </div>
          )}

          {/* Connection Status */}
          {!rtviState.isConnected && !isConnecting && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-600 text-sm">Not connected to voice bot</p>
              <Button 
                onClick={startBot} 
                className="mt-2"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect to Bot'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="relative z-10 flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg max-w-xs lg:max-w-md",
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900',
                    message.isInterim && 'opacity-70'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Command Helper */}
      <VoiceCommandHelper />

      {/* Contact Form */}
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        name={formFields.name}
        email={formFields.email}
        message={formFields.message}
        onFieldUpdate={handleFieldUpdate}
      />

      {/* Audio Element */}
      <div ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceChat; 