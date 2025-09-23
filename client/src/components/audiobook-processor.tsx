import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Clock, Users, MapPin, Music } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ProcessingResult {
  id: string;
  title: string;
  author: string;
  youtubeUrl: string;
  duration: number;
  transcript: {
    fullText: string;
    segments: any[];
    words?: any[];
  };
  chapters: BookChapter[];
  entities: ExtractedEntity[];
  processedAt: string;
}

interface BookChapter {
  id: string;
  number: number;
  title: string;
  startTime: number;
  endTime: number;
  transcript: string;
  entities: string[];
  summary: string;
}

interface ExtractedEntity {
  id: string;
  name: string;
  category: string;
  type: string;
  mentions: EntityMention[];
  description?: string;
  importance: number;
  sentiment: string;
}

interface EntityMention {
  timestamp: number;
  context: string;
  confidence: number;
  sentiment: string;
}

export function AudiobookProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processCompleteBook = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Processing complete book...");
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/process-complete-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setProgress(100);
        setCurrentStep("Complete!");
      } else {
        setError(data.error || 'Processing failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Process error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudiobook = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Initializing...");
    setError(null);
    setResult(null);

    try {
      // Simulate progress updates
      const steps = [
        "Reading text file...",
        "Getting YouTube timing info...", 
        "Cleaning and structuring text...",
        "Creating timestamped chapters...",
        "Extracting entities with timing...",
        "Finalizing processing..."
      ];

      for (let i = 0; i < steps.length - 1; i++) {
        setCurrentStep(steps[i]);
        setProgress((i / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCurrentStep(steps[steps.length - 1]);
      setProgress(95);

      const response = await apiRequest("POST", "/api/process-merle-book", {});
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setProgress(100);
        setCurrentStep("Complete!");
      } else {
        throw new Error(data.error || "Processing failed");
      }

    } catch (err) {
      setError(err.message || "Failed to process audiobook");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'person':
      case 'people':
        return <Users className="h-4 w-4" />;
      case 'place':
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'song':
      case 'album':
      case 'music':
        return <Music className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Process Merle Haggard Book
          </CardTitle>
          <CardDescription>
            Upload the "My House of Memories" text file to extract complete content aligned with YouTube timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Button 
                onClick={processCompleteBook}
                disabled={isProcessing}
                className="flex items-center gap-2 w-full"
              >
                <Download className="h-4 w-4" />
                {isProcessing ? "Processing Complete Book..." : "Process Complete Book (Recommended)"}
              </Button>
              
              <Button 
                onClick={processAudiobook}
                disabled={isProcessing}
                variant="outline"
                className="flex items-center gap-2 w-full"
              >
                <Download className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Process Text File (Legacy)"}
              </Button>
            </div>
            
            {isProcessing && (
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">{currentStep}</div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Processing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.chapters.length}</div>
                  <div className="text-sm text-muted-foreground">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.entities.length}</div>
                  <div className="text-sm text-muted-foreground">Entities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(result.duration)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{Math.floor(result.transcript.fullText.length / 1000)}K</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapters */}
          <Card>
            <CardHeader>
              <CardTitle>Book Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.chapters.map((chapter) => (
                  <div key={chapter.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">
                        Chapter {chapter.number}: {chapter.title}
                      </h3>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(chapter.startTime)} - {formatTimestamp(chapter.endTime)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{chapter.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {chapter.entities.slice(0, 5).map((entity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                      {chapter.entities.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{chapter.entities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Entities */}
          <Card>
            <CardHeader>
              <CardTitle>Key Entities Extracted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.entities
                  .sort((a, b) => b.importance - a.importance)
                  .slice(0, 12)
                  .map((entity) => (
                    <div key={entity.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(entity.category)}
                        <h4 className="font-medium">{entity.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {entity.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {entity.mentions.length} mentions
                        </Badge>
                      </div>
                      {entity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {entity.description.length > 100 
                            ? `${entity.description.substring(0, 100)}...`
                            : entity.description
                          }
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Importance: {entity.importance}/100</span>
                        <span>•</span>
                        <span>Sentiment: {entity.sentiment}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}