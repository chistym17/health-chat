import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Phone, PhoneOff, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface VoiceBotStatus {
  status: 'not_started' | 'running' | 'finished';
  pid?: number;
  room_url?: string;
  message?: string;
}

const VoiceBotConnector: React.FC = () => {
  const [botStatus, setBotStatus] = useState<VoiceBotStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{ room_url: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:8000';

  // Check bot status on component mount
  useEffect(() => {
    checkBotStatus();
    // Poll status every 10 seconds
    const interval = setInterval(checkBotStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkBotStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/voice/status`);
      if (response.ok) {
        const status = await response.json();
        setBotStatus(status);
        setError(null);
      } else {
        setError('Failed to check bot status');
      }
    } catch (err) {
      setError('Network error checking bot status');
    }
  };

  const connectToBot = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/voice/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const info = await response.json();
        setConnectionInfo(info);
        // Open the room URL in a new tab
        window.open(info.room_url, '_blank');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to connect to voice bot');
      }
    } catch (err) {
      setError('Network error connecting to voice bot');
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (!botStatus) return <XCircle className="w-4 h-4 text-gray-400" />;
    
    switch (botStatus.status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'finished':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!botStatus) return <Badge variant="secondary">Unknown</Badge>;
    
    switch (botStatus.status) {
      case 'running':
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case 'finished':
        return <Badge variant="destructive">Stopped</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Bot Connector
        </CardTitle>
        <CardDescription>
          Connect to the AI voice bot for real-time conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bot Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
          </div>
          
          {botStatus?.pid && (
            <div className="text-sm text-gray-600">
              Process ID: {botStatus.pid}
            </div>
          )}
          
          {botStatus?.room_url && (
            <div className="text-sm text-gray-600 truncate">
              Room: {botStatus.room_url}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Connection Info */}
        {connectionInfo && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              Connected! Room opened in new tab.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={connectToBot}
            disabled={isConnecting || botStatus?.status !== 'running'}
            className="flex-1"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Connect to Bot
              </>
            )}
          </Button>
          
          <Button
            onClick={checkBotStatus}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Make sure your microphone is enabled</p>
          <p>• Speak clearly and naturally</p>
          <p>• Try saying "I want to fill a form" to start</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceBotConnector; 