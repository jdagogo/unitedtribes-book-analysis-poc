import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PDFUpload } from '@/components/pdf-upload';
import { PDFUploadProgress } from '@/components/pdf-upload-progress';
import { PDFUploadSimple } from '@/components/pdf-upload-simple';
import { PDFUploadEnhanced } from '@/components/pdf-upload-enhanced';
import { 
  ArrowLeft, 
  FileText, 
  Database, 
  BookOpen,
  Clock,
  Search,
  FolderOpen,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Transcript {
  id: string;
  title: string;
  source: string;
  wordCount: number;
  entityCount: number;
  uploadDate: string;
  processingTime: number;
  files: {
    metadata: string;
    transcript: string;
    analysis: string;
  };
}

export default function PDFAnalyze() {
  const [, setLocation] = useLocation();
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch list of processed transcripts
  const { data: transcripts, isLoading, refetch } = useQuery({
    queryKey: ['transcripts', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/transcripts');
      if (!response.ok) throw new Error('Failed to fetch transcripts');
      const data = await response.json();
      return data.transcripts as Transcript[];
    }
  });

  const handleUploadComplete = (data: any) => {
    // Refresh the transcript list
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatFileSize = (words: number) => {
    const estimatedKB = Math.round(words * 6 / 1024); // Rough estimate: 6 bytes per word
    return `~${estimatedKB} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              PDF Transcript Analysis
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Upload PDF transcripts for comprehensive entity extraction and structured analysis
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 p-1.5 h-auto">
            <TabsTrigger value="upload" className="gap-2 text-base py-2.5">
              <FileText className="h-4 w-4" />
              Upload PDF
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2 text-base py-2.5">
              <Database className="h-4 w-4" />
              Transcript Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <PDFUploadEnhanced onUploadComplete={handleUploadComplete} />
            
            {/* Features Card */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Processing Pipeline</CardTitle>
                <CardDescription className="text-base">
                  Your PDF goes through our comprehensive analysis system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Text Extraction</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clean extraction with artifact removal
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Entity Detection</h4>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        People, places, organizations, events
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Theme Analysis</h4>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Identify key themes and topics
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Structured Output</h4>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        JSON, TXT, and Markdown files
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Performance Targets</CardTitle>
                <CardDescription className="text-base">
                  Optimized for book-length transcripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-base font-medium">765 KB PDF</span>
                    <span className="text-base font-semibold text-green-600 dark:text-green-400">{'< 5 seconds'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-base font-medium">20,000-60,000 words</span>
                    <span className="text-base font-semibold text-blue-600 dark:text-blue-400">Full extraction</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-base font-medium">Entity Detection</span>
                    <span className="text-base font-semibold text-purple-600 dark:text-purple-400">50+ entities</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-medium">Output Files</span>
                    <span className="text-base font-semibold text-orange-600 dark:text-orange-400">3 structured files</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            {isLoading ? (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="py-12 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ) : transcripts && transcripts.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold">
                    Processed Transcripts ({transcripts.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    size="default"
                    onClick={() => refetch()}
                    className="text-sm"
                  >
                    Refresh
                  </Button>
                </div>
                
                {transcripts.map((transcript) => (
                  <Card 
                    key={transcript.id}
                    className="hover:shadow-xl transition-all transform hover:scale-[1.01]"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{transcript.title}</h4>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            Source: {transcript.source}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{transcript.wordCount.toLocaleString()}</span> words
                            </span>
                            <span className="flex items-center gap-1.5 text-sm">
                              <Database className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{transcript.entityCount}</span> entities
                            </span>
                            <span className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{transcript.processingTime.toFixed(1)}s</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(transcript.uploadDate)}
                          </span>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setLocation(`/transcript/${transcript.id}`);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="default"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(transcript.files.transcript, '_blank');
                              }}
                              className="p-2"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button
                              size="default"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(transcript.files.analysis, '_blank');
                              }}
                              className="p-2"
                            >
                              <BookOpen className="h-5 w-5" />
                            </Button>
                            <Button
                              size="default"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(transcript.files.metadata, '_blank');
                              }}
                              className="p-2"
                            >
                              <Download className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="py-12 text-center">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">No Transcripts Yet</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                    Upload your first PDF transcript to get started
                  </p>
                  <Button 
                    size="default"
                    onClick={() => {
                      const tabsList = document.querySelector('[role="tablist"]');
                      const uploadTab = tabsList?.querySelector('[value="upload"]') as HTMLElement;
                      uploadTab?.click();
                    }}
                    className="text-base px-6 py-2.5"
                  >
                    Upload PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected Transcript Details */}
        {selectedTranscript && (
          <Card className="max-w-4xl mx-auto mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedTranscript.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTranscript(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedTranscript.wordCount.toLocaleString()}
                  </p>
                  <p className="text-base text-gray-600">Words</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-3xl font-bold text-purple-600">
                    {selectedTranscript.entityCount}
                  </p>
                  <p className="text-base text-gray-600">Entities</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-3xl font-bold text-green-600">
                    {selectedTranscript.processingTime.toFixed(1)}s
                  </p>
                  <p className="text-base text-gray-600">Processing</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-3xl font-bold text-orange-600">3</p>
                  <p className="text-base text-gray-600">Files</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(selectedTranscript.files.transcript, '_blank')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Transcript
                </Button>
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => window.open(selectedTranscript.files.analysis, '_blank')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Analysis
                </Button>
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => window.open(selectedTranscript.files.metadata, '_blank')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  View Metadata
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}