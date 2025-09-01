import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressDebugProps {
  sessionId: string | null;
  isProcessing: boolean;
}

export function ProgressDebug({ sessionId, isProcessing }: ProgressDebugProps) {
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId || !isProcessing) {
      setDebugData(null);
      setPollCount(0);
      return;
    }

    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/progress-status/${sessionId}`);
        setPollCount(prev => prev + 1);
        
        if (!response.ok) {
          setError(`Progress not found (${response.status})`);
          setDebugData(null);
        } else {
          const data = await response.json();
          setDebugData(data);
          setError(null);
        }
      } catch (err) {
        setError(`Fetch error: ${err}`);
      }
    };

    // Poll immediately and then every 1.5 seconds
    checkProgress();
    const interval = setInterval(checkProgress, 1500);

    return () => clearInterval(interval);
  }, [sessionId, isProcessing]);

  if (!sessionId) return null;

  return (
    <Card className="mt-4 border-2 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-yellow-600">🐛 Progress Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 font-mono text-sm">
          <div>Session ID: {sessionId}</div>
          <div>Poll Count: {pollCount}</div>
          <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
          {error && (
            <div className="text-red-600">Error: {error}</div>
          )}
          {debugData && (
            <>
              <div className="text-green-600">✅ Progress Found!</div>
              <div>Step: {debugData.currentStep}/{debugData.totalSteps}</div>
              <div>Progress: {debugData.progress}%</div>
              <div>Message: {debugData.message}</div>
              <div>Complete: {debugData.complete ? 'Yes' : 'No'}</div>
              {debugData.details && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>Details:</div>
                  <pre className="text-xs">{JSON.stringify(debugData.details, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}