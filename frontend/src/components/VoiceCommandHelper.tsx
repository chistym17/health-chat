import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Stethoscope,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

const VOICE_COMMANDS = [
  {
    category: 'Basic Commands',
    commands: [
      { command: 'Hello', description: 'Greet the healthcare assistant' },
      { command: 'How are you?', description: 'Ask about the assistant\'s status' },
      { command: 'What can you do?', description: 'Learn about healthcare features' },
      { command: 'Stop', description: 'Stop the current action' },
      { command: 'Thank you', description: 'Express gratitude' },
    ]
  },
  {
    category: 'Appointment Scheduling',
    commands: [
      { command: 'I need an appointment', description: 'Start appointment scheduling' },
      { command: 'Schedule appointment', description: 'Open appointment form' },
      { command: 'Book appointment', description: 'Open appointment form' },
      { command: 'I need to see a doctor', description: 'Start appointment scheduling' },
    ]
  },
  {
    category: 'Appointment Information',
    commands: [
      { command: 'My name is John Smith', description: 'Fills the patient name field' },
      { command: 'My email is john@example.com', description: 'Fills the email field' },
      { command: 'I have a headache', description: 'Fills the appointment reason field' },
      { command: 'I\'m experiencing chest pain', description: 'Fills the appointment reason field' },
      { command: 'I feel dizzy', description: 'Fills the appointment reason field' },
    ]
  },
  {
    category: 'Urgency & Submission',
    commands: [
      { command: 'It\'s urgent', description: 'Sets high urgency level' },
      { command: 'This is an emergency', description: 'Sets emergency urgency' },
      { command: 'Submit appointment', description: 'Submit the appointment form' },
      { command: 'Schedule appointment', description: 'Submit the appointment form' },
      { command: 'Confirm appointment', description: 'Submit the appointment form' },
    ]
  },
  {
    category: 'Healthcare',
    commands: [
      { command: 'I have symptoms', description: 'Report health symptoms' },
      { command: 'What should I do?', description: 'Get health advice' },
      { command: 'Is this serious?', description: 'Ask about symptom severity' },
      { command: 'Help', description: 'Get healthcare assistance' },
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
            <Stethoscope className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Healthcare Commands</CardTitle>
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
                  {category.category === 'Appointment Scheduling' && <Calendar className="w-4 h-4 mr-2" />}
                  {category.category === 'Appointment Information' && <User className="w-4 h-4 mr-2" />}
                  {category.category === 'Urgency & Submission' && <Stethoscope className="w-4 h-4 mr-2" />}
                  {category.category === 'Healthcare' && <MessageSquare className="w-4 h-4 mr-2" />}
                  {category.category === 'Basic Commands' && <Mic className="w-4 h-4 mr-2" />}
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