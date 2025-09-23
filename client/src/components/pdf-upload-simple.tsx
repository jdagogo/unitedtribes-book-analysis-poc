import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileSearch,
  Database,
  FolderOpen,
  Sparkles
} from 'lucide-react';

interface PDFUploadSimpleProps {
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

const PROGRESS_STEPS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'extract', label: 'Extract Text', icon: FileSearch },
  { id: 'analyze', label: 'Analyze', icon: Database },
  { id: 'generate', label: 'Generate Files', icon: FolderOpen },
  { id: 'complete', label: 'Complete', icon: CheckCircle }
];

export function PDFUploadSimple({ onUploadComplete, onError }: PDFUploadSimpleProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Polling function to check progress
  const checkProgress = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/progress-status/${sessionId}`);
      
      if (!response.ok) {
        // Session not found - might be completed or failed
        console.log('Session not found, checking if processing completed');
        return;
      }
      
      const status = await response.json();
      console.log('📊 Progress status:', status);
      
      // Update UI based on status
      setProgress(status.progress || 0);
      setCurrentStep(status.currentStep || 0);
      setStatusMessage(status.message || 'Processing...');
      
      if (status.complete) {
        // Processing complete
        if (status.error) {
          setError(status.error);
          setIsProcessing(false);
          if (onError) onError(status.error);
        } else if (status.result) {
          setIsProcessing(false);
          if (onUploadComplete) onUploadComplete(status.result);
        }
        
        // Stop polling
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling even if there's an error
    }
  }, [onUploadComplete, onError]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setCurrentStep(0);
      setStatusMessage('Starting upload...');
      
      // Generate session ID
      const newSessionId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      console.log('📋 Generated session ID:', newSessionId);
      
      // Start polling for progress
      pollingInterval.current = setInterval(() => {
        checkProgress(newSessionId);
      }, 1500); // Poll every 1.5 seconds
      
      // Upload the file
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('sessionId', newSessionId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      const response = await fetch('/api/upload-pdf-transcript', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('📤 Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: response.statusText 
        }));
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      // Parse the response
      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      // Stop polling if we got the result directly
      if (result.success && result.data) {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
        
        setProgress(100);
        setCurrentStep(5);
        setStatusMessage('Processing complete!');
        setIsProcessing(false);
        
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      }
      // Otherwise, continue polling for progress

    } catch (error) {
      console.error('Upload error:', error);
      
      // Stop polling on error
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      
      let errorMessage = 'Failed to upload PDF';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Processing timeout - please try a smaller file';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep(0);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    setStatusMessage('');
    setSessionId(null);
    
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Transcript Upload
        </CardTitle>
        <CardDescription>
          Upload a PDF for entity extraction and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
            ${selectedFile ? 'bg-gray-50 dark:bg-gray-900' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-lg">{selectedFile.name}</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              
              {!isProcessing && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={uploadFile} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Start Processing
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Choose Different File
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="text-xl font-medium">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Maximum file size: 50MB
                </p>
              </div>
              
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload-simple"
              />
              <label htmlFor="pdf-upload-simple">
                <Button asChild variant="outline" className="cursor-pointer">
                  <span>
                    <FileText className="mr-2 h-4 w-4" />
                    Select PDF File
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Progress Display */}
        {isProcessing && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Status Message */}
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-base">{statusMessage}</span>
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {PROGRESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep - 1;
                const isComplete = index < currentStep - 1;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-1 ${
                      isComplete ? 'text-green-600' : 
                      isActive ? 'text-blue-600' : 
                      'text-gray-400'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isComplete ? 'bg-green-100 dark:bg-green-900' :
                      isActive ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs">{step.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Session Info for debugging */}
            {sessionId && (
              <div className="text-xs text-gray-500 font-mono">
                Session: {sessionId.substring(0, 20)}...
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-medium">Upload Failed</p>
              <p className="text-base mt-1">{error}</p>
              <Button size="sm" variant="outline" onClick={reset} className="mt-2">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {!isProcessing && progress === 100 && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <p className="font-medium">Processing Complete!</p>
              <p className="text-base mt-1">Your PDF has been successfully processed.</p>
              <Button size="sm" onClick={reset} className="mt-2">
                Upload Another
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}