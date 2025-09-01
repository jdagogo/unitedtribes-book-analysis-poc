import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlInput } from "@/components/url-input.tsx";
import { TranscriptInput } from "@/components/transcript-input.tsx";
import { ProcessingState } from "@/components/processing-state.tsx";
import { ResultsDashboard } from "@/components/results-dashboard.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Play, Book, Link2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { justinBieberDemoAnalysis } from "@/data/demo-analysis";
import { merleHaggardDemoAnalysis } from "@/data/merle-haggard-demo";
import { authenticMerleAnalysis } from "@/data/authentic-merle-analysis";

export default function Analyze() {
  const [location] = useLocation();
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemo, setShowDemo] = useState<string | null>(null);
  
  // Handle timestamp parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const timestamp = urlParams.get('t');
    
    if (timestamp && location.includes('/results')) {
      // Show the Merle Haggard analysis with timestamp
      setShowDemo('merle');
    }
  }, [location]);
  
  // Demo podcast IDs - using real completed analysis
  const MERLE_HAGGARD_DEMO_ID = "e75f6415-5238-488d-9de5-5583c2d0a3d6"; // Latest test analysis with more entities
  
  // Query for demo analysis when showing demo
  const { data: demoAnalysis, isLoading: isDemoLoading } = useQuery({
    queryKey: ["podcast", showDemo === 'merle' ? MERLE_HAGGARD_DEMO_ID : null],
    queryFn: async () => {
      if (showDemo === 'merle') {
        const response = await apiRequest("GET", `/api/podcast/${MERLE_HAGGARD_DEMO_ID}`);
        return response.json();
      }
      return null;
    },
    enabled: showDemo === 'merle'
  });

  const analyzeMutation = useMutation({
    mutationFn: async (appleUrl: string) => {
      const response = await apiRequest("POST", "/api/analyze", { appleUrl });
      return response.json();
    },
    onSuccess: (data) => {
      setPodcastId(data.podcastId);
      setIsProcessing(true);
    },
  });

  const analyzeTranscriptMutation = useMutation({
    mutationFn: async (data: { title: string; showName: string; transcript: string; duration?: number }) => {
      const response = await apiRequest("POST", "/api/analyze-transcript", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPodcastId(data.podcastId);
      setIsProcessing(true);
    },
  });

  const analyzePDFMutation = useMutation({
    mutationFn: async (data: { pdfUrl: string; title?: string; showName?: string; duration?: number }) => {
      const response = await apiRequest("POST", "/api/analyze-pdf", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPodcastId(data.podcastId);
      setIsProcessing(true);
    },
  });

  const handleAnalysisStart = (url: string) => {
    analyzeMutation.mutate(url);
  };

  const handleTranscriptAnalysis = (data: { title: string; showName: string; transcript: string; duration?: number }) => {
    analyzeTranscriptMutation.mutate(data);
  };

  const handlePDFAnalysis = (data: { pdfUrl: string; title?: string; showName?: string; duration?: number }) => {
    analyzePDFMutation.mutate(data);
  };

  const handleAnalysisComplete = () => {
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to UnitedTribes
            </Button>
          </Link>

          {/* Quick Media Navigation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 mb-3 text-center font-medium">🎵 Quick Access to All Merle Haggard Content</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" className="bg-white border-blue-300 hover:bg-blue-50">
                <Play className="mr-2 h-4 w-4" />
                Podcast (Current)
              </Button>
              <Link href="/book">
                <Button variant="outline" size="sm" className="bg-white border-green-300 hover:bg-green-50">
                  <Book className="mr-2 h-4 w-4" />
                  Book Reader
                </Button>
              </Link>
              <Link href="/cross-media">
                <Button variant="outline" size="sm" className="bg-white border-purple-300 hover:bg-purple-50">
                  <Link2 className="mr-2 h-4 w-4" />
                  Cross-Media
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Media Discovery Analysis
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Extract navigation triggers and cross-media connections from podcast content
            </p>
            
            {/* Demo Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowDemo('merle')}
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                <Zap className="mr-2 h-4 w-4" />
                See Real Merle Haggard Analysis
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Start processing Justin Bieber PDF
                  const pdfData = {
                    pdfUrl: "https://storage.googleapis.com/replit-objstore-845adf3a-0ac1-4c6c-9d54-667ba86aad52/attached_assets/Justin%20Bieber,%20NYTimes%20Popcast_1754196885272.pdf",
                    title: "Justin Bieber Analysis",
                    showName: "NYTimes Popcast",
                    duration: 2400
                  };
                  analyzePDFMutation.mutate(pdfData);
                }}
                className="bg-purple-50 border-purple-200 hover:bg-purple-100"
                disabled={analyzePDFMutation.isPending}
              >
                <Zap className="mr-2 h-4 w-4" />
                {analyzePDFMutation.isPending ? 'Processing...' : 'Analyze Justin Bieber PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && podcastId && (
          <ProcessingState podcastId={podcastId} onComplete={handleAnalysisComplete} />
        )}

        {/* Results Dashboard */}
        {!isProcessing && podcastId && (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setPodcastId(null);
                setIsProcessing(false);
              }}
            >
              Start New Analysis
            </Button>
            <ResultsDashboard 
            podcastId={podcastId} 
            initialTimestamp={(() => {
              const urlParams = new URLSearchParams(location.split('?')[1] || '');
              const timestamp = urlParams.get('t');
              return timestamp ? parseInt(timestamp) : undefined;
            })()} 
          />
          </div>
        )}

        {/* Demo Results */}
        {showDemo && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {showDemo === 'merle' ? 'Real Merle Haggard Analysis' : 'Justin Bieber Analysis Demo'}
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowDemo(null)}>×</Button>
              </div>
              <CardDescription>
                {showDemo === 'merle' 
                  ? 'This is actual UnitedTribes analysis from the uploaded PDF - real entity extraction and contextual navigation'
                  : 'This is what proper UnitedTribes analysis should look like - 80-150+ navigation triggers'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showDemo === 'merle' ? (
                <ResultsDashboard 
                  analysis={authenticMerleAnalysis} 
                  initialTimestamp={(() => {
                    const urlParams = new URLSearchParams(location.split('?')[1] || '');
                    const timestamp = urlParams.get('t');
                    return timestamp ? parseInt(timestamp) : undefined;
                  })()} 
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(justinBieberDemoAnalysis.categories).map(([category, data]) => (
                      <div key={category} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">{category}</h3>
                        <div className="text-2xl font-bold text-purple-600">{data.count}</div>
                        <div className="text-xs text-muted-foreground">triggers</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      Total Navigation Triggers: {justinBieberDemoAnalysis.totalNavigationTriggers}
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300">
                      This demonstrates UnitedTribes' power - comprehensive entity extraction for seamless media discovery
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Input */}
        {!podcastId && !showDemo && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Contextual Navigation Engine
              </CardTitle>
              <CardDescription>
                Enter a podcast URL, paste transcript text, or upload a PDF transcript to extract 80-150+ navigation triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="url">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url">Apple Podcasts URL</TabsTrigger>
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-6">
                  <UrlInput 
                    onSubmit={handleAnalysisStart}
                    isLoading={analyzeMutation.isPending}
                  />
                  {analyzeMutation.error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400">{analyzeMutation.error.message}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="text" className="mt-6">
                  <TranscriptInput 
                    onSubmit={handleTranscriptAnalysis}
                    onPDFSubmit={handlePDFAnalysis}
                    isLoading={analyzeTranscriptMutation.isPending}
                  />
                  {analyzeTranscriptMutation.error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400">{analyzeTranscriptMutation.error.message}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="pdf" className="mt-6">
                  <TranscriptInput 
                    onSubmit={handleTranscriptAnalysis}
                    onPDFSubmit={handlePDFAnalysis}
                    isLoading={analyzePDFMutation.isPending}
                  />
                  {analyzePDFMutation.error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400">{analyzePDFMutation.error.message}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}