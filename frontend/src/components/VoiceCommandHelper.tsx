import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

const VOICE_COMMANDS = [
  {
    category: 'Basic Commands',
    commands: [
      { command: 'Hello', description: 'Greet the assistant' },
      { command: 'How are you?', description: 'Ask about the assistant\'s status' },
      { command: 'What can you do?', description: 'Learn about available features' },
      { command: 'Stop', description: 'Stop the current action' },
      { command: 'Thank you', description: 'Express gratitude' },
    ]
  },
  {
    category: 'Forms',
    commands: [
      { command: 'Contact form', description: 'Open contact form directly' },
      { command: 'I want to fill contact form', description: 'Open contact form directly' },
      { command: 'Fill contact form', description: 'Open contact form directly' },
    ]
  },
  {
    category: 'Contact Form Fields',
    commands: [
      { command: 'My name is John Smith', description: 'Fills the name field' },
      { command: 'Name is John Smith', description: 'Fills the name field' },
      { command: 'My email is john@example.com', description: 'Fills the email field' },
      { command: 'Email is john@example.com', description: 'Fills the email field' },
      { command: 'My message is hello world', description: 'Fills the message field' },
      { command: 'I want to say hello world', description: 'Fills the message field' },
    ]
  },
  {
    category: 'Form Submission',
    commands: [
      { command: 'Submit', description: 'Submit the form and close it' },
      { command: 'Send', description: 'Submit the form and close it' },
      { command: 'Done', description: 'Submit the form and close it' },
      { command: 'Finish', description: 'Submit the form and close it' },
      { command: 'Complete', description: 'Submit the form and close it' },
      { command: 'That\'s it', description: 'Submit the form and close it' },
    ]
  },
  {
    category: 'Conversation',
    commands: [
      { command: 'Tell me a joke', description: 'Request a joke' },
      { command: 'What\'s the weather?', description: 'Ask about weather' },
      { command: 'What time is it?', description: 'Get current time' },
      { command: 'Help', description: 'Get help and guidance' },
    ]
  }
];

export const VoiceCommandHelper: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="fixed bottom-4 left-4 w-80 bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg z-30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Voice Commands</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {VOICE_COMMANDS.map((category) => (
              <div key={category.category} className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.commands.map((cmd, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mic className="w-3 h-3 text-blue-500" />
                        <Badge variant="outline" className="text-xs font-mono bg-blue-50">
                          "{cmd.command}"
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 ml-5">
                        {cmd.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 