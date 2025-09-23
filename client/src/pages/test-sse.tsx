import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSSE() {
  const [messages, setMessages] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const connectSSE = () => {
    const newSessionId = `test_${Date.now()}`;
    setSessionId(newSessionId);
    
    const source = new EventSource(`/api/progress/${newSessionId}`);
    
    source.onopen = () => {
      setConnected(true);
      setMessages(prev => [...prev, '✅ Connected to SSE']);
    };
    
    source.onmessage = (event) => {
      setMessages(prev => [...prev, `📨 Message: ${event.data}`]);
    };
    
    source.onerror = (error) => {
      setMessages(prev => [...prev, `❌ Error: ${JSON.stringify(error)}`]);
      setConnected(false);
    };
    
    setEventSource(source);
  };
  
  const disconnect = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setConnected(false);
      setMessages(prev => [...prev, '🔌 Disconnected']);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>SSE Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={connectSSE} disabled={connected}>
              Connect to SSE
            </Button>
            <Button onClick={disconnect} disabled={!connected} variant="outline">
              Disconnect
            </Button>
          </div>
          
          {sessionId && (
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              Session ID: {sessionId}
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">Messages:</h3>
            <div className="h-64 overflow-y-auto border rounded p-2 space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm font-mono">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}