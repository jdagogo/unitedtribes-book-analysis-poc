import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFUploadSimple } from '@/components/pdf-upload-simple';

export default function TestProgress() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (data: any) => {
    console.log('✅ Upload complete:', data);
    setResult(data);
    setError(null);
  };

  const handleError = (err: string) => {
    console.error('❌ Upload error:', err);
    setError(err);
    setResult(null);
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PDF Upload Progress Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This page tests the simplified polling-based progress system.
            </p>
            <p className="text-sm font-mono mb-4">
              System: Polling every 1.5 seconds for progress updates
            </p>
          </CardContent>
        </Card>

        <PDFUploadSimple 
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />

        {result && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Success! Processing Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-white dark:bg-gray-900 p-3 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
              <Button onClick={reset} className="mt-4">
                Reset
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">
                Error Occurred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button onClick={reset} className="mt-4">
                Reset
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✅ Using simple polling mechanism (no SSE)</p>
              <p>✅ Progress updates every 1.5 seconds</p>
              <p>✅ Fallback to response data if polling fails</p>
              <p>✅ 2-minute timeout protection</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}