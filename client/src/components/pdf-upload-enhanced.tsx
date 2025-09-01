import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDebug } from './progress-debug';
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
  Sparkles,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PDFUploadEnhancedProps {
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

const PROGRESS_STEPS = [
  { 
    id: 'upload', 
    label: 'Uploading', 
    icon: Upload,
    color: 'blue',
    description: 'Transferring your PDF to the server'
  },
  { 
    id: 'extract', 
    label: 'Extracting', 
    icon: FileSearch,
    color: 'purple',
    description: 'Reading and parsing PDF content'
  },
  { 
    id: 'analyze', 
    label: 'Analyzing', 
    icon: Database,
    color: 'green',
    description: 'Finding entities and patterns'
  },
  { 
    id: 'generate', 
    label: 'Generating', 
    icon: FolderOpen,
    color: 'orange',
    description: 'Creating output files'
  },
  { 
    id: 'complete', 
    label: 'Complete', 
    icon: CheckCircle,
    color: 'emerald',
    description: 'Processing finished successfully'
  }
];

export function PDFUploadEnhanced({ onUploadComplete, onError }: PDFUploadEnhancedProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [stats, setStats] = useState<any>(null);
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const timeInterval = useRef<NodeJS.Timeout | null>(null);

  // Update processing time
  useEffect(() => {
    if (isProcessing && !timeInterval.current) {
      startTime.current = Date.now();
      timeInterval.current = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime.current) / 1000));
      }, 100);
    } else if (!isProcessing && timeInterval.current) {
      clearInterval(timeInterval.current);
      timeInterval.current = null;
    }
  }, [isProcessing]);

  // Polling function to check progress
  const checkProgress = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/progress-status/${sessionId}`);
      
      if (!response.ok) {
        console.log('Session not found, checking if processing completed');
        return;
      }
      
      const status = await response.json();
      console.log('📊 Progress status:', status);
      
      // Update UI based on status
      setProgress(status.progress || 0);
      setCurrentStep(status.currentStep || 0);
      setStatusMessage(status.message || 'Processing...');
      
      if (status.details) {
        setStats(status.details);
      }
      
      if (status.complete) {
        // Processing complete
        if (status.error) {
          setError(status.error);
          setIsProcessing(false);
          if (onError) onError(status.error);
        } else if (status.result) {
          setIsProcessing(false);
          setStats(status.result);
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
    }
  }, [onUploadComplete, onError]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
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
      setProcessingTime(0);
      setStatusMessage('Initializing upload...');
      setStats(null);
      
      // Generate session ID
      const newSessionId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      console.log('📋 Generated session ID:', newSessionId);
      
      // Start polling for progress
      pollingInterval.current = setInterval(() => {
        checkProgress(newSessionId);
      }, 1500);
      
      // Upload the file
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('sessionId', newSessionId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
        setStats(result.data);
        
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      }

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
    setProcessingTime(0);
    setStats(null);
    
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader className="pb-8">
        <CardTitle className="flex items-center gap-3 text-3xl">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Transcript Processor
          </span>
        </CardTitle>
        <CardDescription className="text-lg mt-2">
          Upload your PDF for comprehensive entity extraction and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          className={`
            relative border-3 border-dashed rounded-2xl p-10 text-center transition-all
            ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-[1.02]' : 'border-gray-300 dark:border-gray-600'}
            ${selectedFile ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800' : ''}
            ${isProcessing ? 'opacity-75' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl">
                  <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl">{selectedFile.name}</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(0)} KB ready to process
                  </p>
                </div>
              </div>
              
              {!isProcessing && (
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={uploadFile} 
                    className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Zap className="h-5 w-5" />
                    Start Processing
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={reset}
                    className="text-lg px-6 py-6"
                  >
                    Choose Different File
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full">
                  <Upload className="h-16 w-16 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold mb-2">
                    Drop your PDF here
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    or click below to browse your files
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-500 mt-2">
                    Maximum file size: 50MB • PDF format only
                  </p>
                </div>
              </div>
              
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload-enhanced"
                disabled={isProcessing}
              />
              <label htmlFor="pdf-upload-enhanced">
                <Button 
                  asChild 
                  variant="outline" 
                  className="cursor-pointer text-lg px-8 py-6 border-2"
                >
                  <span>
                    <FileText className="mr-2 h-5 w-5" />
                    Select PDF File
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Progress Display */}
        {isProcessing && (
          <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl">
            {/* Main Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Overall Progress</span>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-mono font-bold text-blue-600">
                    {formatTime(processingTime)}
                  </span>
                  <span className="text-2xl font-bold text-purple-600 ml-4">
                    {progress}%
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-4 bg-gray-200" />
            </div>
            
            {/* Current Status */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xl font-medium">{statusMessage}</span>
            </div>
            
            {/* Step Progress */}
            <div className="grid grid-cols-5 gap-2">
              {PROGRESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep - 1;
                const isComplete = index < currentStep - 1;
                const isPending = index >= currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`
                      relative p-4 rounded-xl transition-all duration-300
                      ${isComplete ? 'bg-green-100 dark:bg-green-900 scale-95' : 
                        isActive ? 'bg-blue-100 dark:bg-blue-900 scale-105 shadow-lg' : 
                        'bg-gray-100 dark:bg-gray-800 opacity-50'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`
                        p-3 rounded-full transition-all
                        ${isComplete ? 'bg-green-500' :
                          isActive ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-400'}
                      `}>
                        {isActive ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : isComplete ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : (
                          <Icon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <span className={`
                        text-base font-semibold
                        ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}
                      `}>
                        {step.label}
                      </span>
                      {isActive && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {step.description}
                        </span>
                      )}
                    </div>
                    
                    {index < PROGRESS_STEPS.length - 1 && (
                      <ArrowRight className={`
                        absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5
                        ${isComplete ? 'text-green-500' : 'text-gray-400'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Live Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                {stats.wordCount && (
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.wordCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Words</p>
                  </div>
                )}
                {stats.entityCount && (
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.entityCount}
                    </p>
                    <p className="text-sm text-gray-600">Entities</p>
                  </div>
                )}
                {stats.processingTime && (
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.processingTime.toFixed(1)}s
                    </p>
                    <p className="text-sm text-gray-600">Total Time</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-2 border-red-300 bg-red-50 dark:bg-red-950">
            <XCircle className="h-6 w-6 text-red-600" />
            <AlertDescription>
              <p className="font-bold text-xl mb-2">Processing Failed</p>
              <p className="text-lg">{error}</p>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={reset} 
                className="mt-4 text-base"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {!isProcessing && progress === 100 && stats && (
          <Alert className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <Sparkles className="h-8 w-8 text-green-600" />
            <AlertDescription>
              <p className="font-bold text-2xl mb-3 text-green-800 dark:text-green-200">
                Processing Complete!
              </p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.wordCount?.toLocaleString() || '—'}
                  </p>
                  <p className="text-base text-gray-600">Words Processed</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.entityCount || '—'}
                  </p>
                  <p className="text-base text-gray-600">Entities Found</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.processingTime?.toFixed(1) || processingTime}s
                  </p>
                  <p className="text-base text-gray-600">Processing Time</p>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={reset} 
                className="text-lg px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Upload Another PDF
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Debug Panel - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <ProgressDebug sessionId={sessionId} isProcessing={isProcessing} />
        )}
      </CardContent>
    </Card>
  );
}