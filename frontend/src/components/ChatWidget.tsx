import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import { Message } from "../utils/chatUtils";

interface ChatWidgetProps {
  messages: Message[];
  isProcessing: boolean;
}

const ChatWidget = ({ messages, isProcessing }: ChatWidgetProps) => {
  return (
    <Card className="h-[600px] flex flex-col bg-white/90 backdrop-blur-md border-blue-200 shadow-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600 animate-bounce" />
          AI Health Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg transition-all duration-200 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white ml-auto animate-pop'
                  : 'bg-gray-200 text-gray-900 animate-fade-in'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  Processing your voice message...
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWidget; 