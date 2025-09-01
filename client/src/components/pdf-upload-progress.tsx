import { useState, useCallback, useEffect } from 'react';
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
  BookOpen,
  Database,
  Clock,
  X,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  title: string;
  description?: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  startTime?: number;
  endTime?: number;
  details?: string;
}

interface ProcessingStats {
  pagesProcessed?: number;
  totalPages?: number;
  wordsExtracted?: number;
  entitiesFound?: number;
  processingSpeed?: number;
  elapsedTime?: number;
  estimatedRemaining?: number;
}

interface PDFUploadProgressProps {
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function PDFUploadProgress({ onUploadComplete, onError, onCancel }: PDFUploadProgressProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({});
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      title: 'Uploading file',
      status: 'waiting'
    },
    {
      id: 'extract',
      title: 'Extracting text from PDF',
      status: 'waiting'
    },
    {
      id: 'analyze',
      title: 'Analyzing entities and themes',
      status: 'waiting'
    },
    {
      id: 'generate',
      title: 'Generating analysis files',
      status: 'waiting'
    },
    {
      id: 'finalize',
      title: 'Creating interactive transcript',
      status: 'waiting'
    }
  ]);

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

  const updateStep = (stepId: string, updates: Partial<ProcessingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const connectToSSE = (sessionId: string) => {
    console.log('🔌 Connecting to SSE with sessionId:', sessionId);
    const source = new EventSource(`/api/progress/${sessionId}`);
    
    source.onopen = () => {
      console.log('✅ SSE connection opened');
    };
    
    source.onmessage = (event) => {
      console.log('📨 SSE message received:', event.data);
      try {
        const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'upload_complete':
          updateStep('upload', { 
            status: 'complete', 
            details: `${(data.fileSize / 1024).toFixed(0)} KB uploaded` 
          });
          setCurrentStepIndex(1);
          setOverallProgress(20);
          break;
          
        case 'text_extraction_progress':
          updateStep('extract', { 
            status: 'processing',
            details: `Page ${data.currentPage}/${data.totalPages}`,
            description: `Extracted ${data.wordsExtracted?.toLocaleString() || 0} words`
          });
          setProcessingStats(prev => ({
            ...prev,
            pagesProcessed: data.currentPage,
            totalPages: data.totalPages,
            wordsExtracted: data.wordsExtracted,
            processingSpeed: data.processingSpeed
          }));
          setOverallProgress(20 + (data.currentPage / data.totalPages * 20));
          break;
          
        case 'text_extraction_complete':
          updateStep('extract', { 
            status: 'complete',
            details: `${data.totalWords?.toLocaleString()} words from ${data.totalPages} pages`
          });
          setCurrentStepIndex(2);
          setOverallProgress(40);
          break;
          
        case 'entity_analysis_progress':
          updateStep('analyze', {
            status: 'processing',
            details: `Found ${data.totalEntities} entities`,
            description: data.entityBreakdown ? 
              `${data.entityBreakdown.people || 0} people, ${data.entityBreakdown.organizations || 0} orgs, ${data.entityBreakdown.places || 0} places` : 
              undefined
          });
          setProcessingStats(prev => ({
            ...prev,
            entitiesFound: data.totalEntities
          }));
          setOverallProgress(40 + (data.progress || 0) * 0.3);
          break;
          
        case 'entity_analysis_complete':
          updateStep('analyze', {
            status: 'complete',
            details: `${data.totalEntities} entities extracted`
          });
          setCurrentStepIndex(3);
          setOverallProgress(70);
          break;
          
        case 'file_generation_progress':
          updateStep('generate', {
            status: 'processing',
            details: data.currentFile
          });
          setOverallProgress(70 + (data.filesGenerated / data.totalFiles * 20));
          break;
          
        case 'file_generation_complete':
          updateStep('generate', {
            status: 'complete',
            details: 'All files generated'
          });
          setCurrentStepIndex(4);
          setOverallProgress(90);
          break;
          
        case 'process_complete':
          updateStep('finalize', {
            status: 'complete',
            details: 'Ready to view!'
          });
          setOverallProgress(100);
          setIsProcessing(false);
          if (onUploadComplete) {
            onUploadComplete(data.result);
          }
          break;
          
        case 'process_error':
          const failedStep = steps.find(s => s.status === 'processing');
          if (failedStep) {
            updateStep(failedStep.id, {
              status: 'error',
              details: data.error
            });
          }
          setError(data.error);
          setIsProcessing(false);
          if (onError) {
            onError(data.error);
          }
          break;
          
        case 'statistics':
          setProcessingStats(prev => ({
            ...prev,
            elapsedTime: data.elapsedTime,
            estimatedRemaining: data.estimatedRemaining
          }));
          break;
      }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    source.onerror = (error) => {
      console.error('❌ SSE error:', error);
      // Only show error if we're still processing
      if (isProcessing) {
        setError('Connection to server lost. Please try again.');
        setIsProcessing(false);
      }
      source.close();
    };
    
    setEventSource(source);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError(null);
      setOverallProgress(0);
      setCurrentStepIndex(0);
      
      // Reset all steps
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'waiting', 
        details: undefined,
        description: undefined 
      })));
      
      // Generate session ID
      const newSessionId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Connect to SSE for progress updates
      connectToSSE(newSessionId);
      
      // Start upload
      updateStep('upload', { status: 'processing' });
      
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

      // Parse response to get the final result
      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      // If SSE didn't complete, manually update the final state
      if (result.success && result.data) {
        updateStep('finalize', {
          status: 'complete',
          details: 'Ready to view!'
        });
        setOverallProgress(100);
        setIsProcessing(false);
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      
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
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const cancelProcessing = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    
    if (sessionId) {
      // Send cancel request to server
      fetch(`/api/cancel-processing/${sessionId}`, { method: 'POST' });
    }
    
    setIsProcessing(false);
    setSelectedFile(null);
    setError('Processing cancelled');
    
    if (onCancel) {
      onCancel();
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setError(null);
    setIsProcessing(false);
    setOverallProgress(0);
    setCurrentStepIndex(-1);
    setProcessingStats({});
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          PDF Transcript Upload with Real-Time Progress
        </CardTitle>
        <CardDescription>
          Upload a PDF transcript and watch the processing progress in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProcessing && !selectedFile && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your PDF here or click to browse
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Maximum file size: 50MB
            </p>
            
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload">
              <Button asChild variant="outline" className="cursor-pointer">
                <span>
                  <FileText className="mr-2 h-4 w-4" />
                  Select PDF File
                </span>
              </Button>
            </label>
          </div>
        )}

        {selectedFile && !isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={uploadFile} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Start Processing
                </Button>
                <Button variant="outline" onClick={reset}>
                  Choose Different File
                </Button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Processing Progress</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.round(overallProgress)}% Complete
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              {processingStats.elapsedTime && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Elapsed: {formatTime(processingStats.elapsedTime)}</span>
                  {processingStats.estimatedRemaining && (
                    <span>Remaining: ~{formatTime(processingStats.estimatedRemaining)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Steps</h4>
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg transition-all
                    ${step.status === 'processing' ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' : ''}
                    ${step.status === 'complete' ? 'bg-green-50 dark:bg-green-950' : ''}
                    ${step.status === 'error' ? 'bg-red-50 dark:bg-red-950' : ''}
                    ${step.status === 'waiting' ? 'opacity-60' : ''}
                  `}
                >
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        Step {index + 1}: {step.title}
                      </span>
                      {step.details && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({step.details})
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics */}
            {Object.keys(processingStats).length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Processing Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {processingStats.totalPages && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Pages: </span>
                      <span className="font-medium">
                        {processingStats.pagesProcessed || 0}/{processingStats.totalPages}
                      </span>
                    </div>
                  )}
                  {processingStats.wordsExtracted && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Words: </span>
                      <span className="font-medium">
                        {processingStats.wordsExtracted.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {processingStats.entitiesFound !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Entities: </span>
                      <span className="font-medium">
                        {processingStats.entitiesFound}
                      </span>
                    </div>
                  )}
                  {processingStats.processingSpeed && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Speed: </span>
                      <span className="font-medium">
                        {processingStats.processingSpeed.toFixed(1)} pages/sec
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={cancelProcessing}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Processing
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-medium">Processing Error</p>
              <p className="text-sm mt-1">{error}</p>
              <Button size="sm" variant="outline" onClick={reset} className="mt-2">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}