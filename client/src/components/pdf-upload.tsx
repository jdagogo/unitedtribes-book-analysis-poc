import { useState, useCallback } from 'react';
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
  Database
} from 'lucide-react';

interface PDFUploadProps {
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UploadStatus {
  stage: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  data?: any;
}

export function PDFUpload({ onUploadComplete, onError }: PDFUploadProps) {
  const [status, setStatus] = useState<UploadStatus>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      } else {
        setStatus({
          stage: 'error',
          progress: 0,
          message: 'Please upload a PDF file'
        });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setStatus({ stage: 'idle', progress: 0, message: '' });
      } else {
        setStatus({
          stage: 'error',
          progress: 0,
          message: 'Please upload a PDF file'
        });
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      // Stage 1: Uploading
      setStatus({
        stage: 'uploading',
        progress: 20,
        message: `Uploading ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)...`
      });

      const formData = new FormData();
      formData.append('pdf', selectedFile);

      // Add timeout to fetch request (60 seconds for large PDFs)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/upload-pdf-transcript', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      // Stage 2: Processing
      setStatus({
        stage: 'processing',
        progress: 40,
        message: 'Extracting text from PDF...'
      });

      // Check if response is ok before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: response.statusText,
          details: 'Server error'
        }));
        throw new Error(errorData.details || errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Check if processing was successful
      if (!result.success) {
        throw new Error(result.details || result.error || 'Processing failed');
      }

      // Stage 3: Analyzing
      setStatus({
        stage: 'analyzing',
        progress: 75,
        message: `Analyzing content (${result.data?.wordCount?.toLocaleString() || 'unknown'} words)...`
      });

      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 4: Complete
      setStatus({
        stage: 'complete',
        progress: 100,
        message: `Successfully processed! Found ${result.data.entityCount} entities in ${result.data.processingTime.toFixed(1)}s`,
        data: result.data
      });

      if (onUploadComplete) {
        onUploadComplete(result.data);
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload PDF';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Processing timeout - the file may be too large or complex. Please try a smaller file.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Processing took too long. Please try again or use a smaller file.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setStatus({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setStatus({ stage: 'idle', progress: 0, message: '' });
  };

  const getStatusIcon = () => {
    switch (status.stage) {
      case 'uploading':
        return <Upload className="h-5 w-5 animate-pulse" />;
      case 'processing':
        return <FileSearch className="h-5 w-5 animate-spin" />;
      case 'analyzing':
        return <Database className="h-5 w-5 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status.stage) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          PDF Transcript Upload
        </CardTitle>
        <CardDescription>
          Upload a PDF transcript for comprehensive entity extraction and analysis
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
              
              {status.stage === 'idle' && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={uploadFile} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Process PDF
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
        </div>

        {/* Status Display */}
        {status.stage !== 'idle' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>
                {status.message}
              </span>
            </div>
            
            {status.stage !== 'error' && status.stage !== 'complete' && (
              <Progress value={status.progress} className="h-2" />
            )}
            
            {status.stage === 'complete' && status.data && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="space-y-2">
                  <p className="font-medium">Processing Complete!</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-base">Word Count: {status.data.wordCount.toLocaleString()}</div>
                    <div className="text-base">Entities Found: {status.data.entityCount}</div>
                    <div className="text-base">Processing Time: {status.data.processingTime}s</div>
                    <div className="text-base">ID: {status.data.id.substring(0, 8)}...</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(status.data.files.transcript, '_blank')}
                    >
                      View Transcript
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(status.data.files.analysis, '_blank')}
                    >
                      View Analysis
                    </Button>
                    <Button size="sm" onClick={reset}>
                      Upload Another
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {status.stage === 'error' && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="font-medium">Upload Failed</p>
                  <p className="text-base mt-1">{status.message}</p>
                  <Button size="sm" variant="outline" onClick={reset} className="mt-2">
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Features */}
        <div className="border-t pt-4 mt-4">
          <p className="text-base font-medium mb-2">What happens when you upload:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-base text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Text extraction & cleaning</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Entity identification</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Theme analysis</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Quote extraction</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Cross-references</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Structured output</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}