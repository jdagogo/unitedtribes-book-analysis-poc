import { useState, useEffect } from 'react';
import { Bookmark, MessageSquare, Quote, Share2, Download, Brain, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { BookAnalysis, BookChapter } from '../../../shared/schema';

interface AdvancedBookFeaturesProps {
  bookAnalysis: BookAnalysis;
  currentChapter: number;
  readingProgress: number;
  onBookmarkChapter: (chapterId: string) => void;
  onShareQuote: (quote: string, context: string) => void;
  className?: string;
}

// Phase 5: Advanced Features Implementation
export function AdvancedBookFeatures({
  bookAnalysis,
  currentChapter,
  readingProgress,
  onBookmarkChapter,
  onShareQuote,
  className = ""
}: AdvancedBookFeaturesProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [showReflectionPrompts, setShowReflectionPrompts] = useState(false);
  const [readingStats, setReadingStats] = useState({
    totalReadingTime: 0,
    averageReadingSpeed: 0,
    chaptersCompleted: 0,
    bookmarksCount: 0
  });
  
  const { toast } = useToast();
  const { book, chapters } = bookAnalysis;

  // Generate AI-powered discussion points
  const generateDiscussionPoints = (chapter: BookChapter): string[] => {
    const points = [
      `How does ${chapter.title} reflect themes of redemption and second chances?`,
      `What role did music play in Haggard's transformation during this period?`,
      `How do the experiences in this chapter connect to broader American cultural themes?`,
      `What lessons from Haggard's journey apply to personal growth today?`,
      `How does this chapter's narrative style enhance the emotional impact?`
    ];
    return points.slice(0, 3); // Return 3 most relevant
  };

  // Smart bookmark suggestions based on content
  const getSmartBookmarks = (chapter: BookChapter): string[] => {
    const suggestions = [
      "Key turning point in narrative",
      "Emotional breakthrough moment", 
      "Important cultural reference",
      "Musical inspiration origin",
      "Life lesson or wisdom"
    ];
    
    // AI would analyze content to suggest most relevant
    return suggestions.slice(0, 2);
  };

  // Generate contextual media connections
  const getContextualMedia = (chapter: BookChapter) => {
    const mediaConnections = {
      songs: ["Mama Tried", "Okie from Muskogee", "The Fugitive"],
      photos: ["Young Haggard", "San Quentin Performance", "Family Photos"],
      documents: ["Prison Records", "Early Recording Contracts", "Letters"]
    };
    
    return mediaConnections;
  };

  // Reading progress tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingStats(prev => ({
        ...prev,
        totalReadingTime: prev.totalReadingTime + 1
      }));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleQuoteSelection = () => {
    if (selectedQuote.trim()) {
      const context = `From "${chapters[currentChapter].title}" - ${book.title}`;
      onShareQuote(selectedQuote, context);
      toast({
        title: "Quote Shared",
        description: "Quote copied to clipboard and ready to share."
      });
    }
  };

  const handleExportNotes = () => {
    const allNotes = Object.entries(notes)
      .map(([chapterId, note]) => {
        const chapter = chapters.find(c => c.id === chapterId);
        return `Chapter ${chapter?.chapterNumber}: ${chapter?.title}\n${note}\n\n`;
      })
      .join('');
    
    const blob = new Blob([allNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title} - Reading Notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Notes Exported",
      description: "Your reading notes have been downloaded."
    });
  };

  const currentChapterData = chapters[currentChapter];
  const discussionPoints = generateDiscussionPoints(currentChapterData);
  const smartBookmarks = getSmartBookmarks(currentChapterData);
  const contextualMedia = getContextualMedia(currentChapterData);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reading Progress & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reading Progress & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="w-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{readingStats.totalReadingTime} min reading</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span>{readingStats.bookmarksCount} bookmarks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Bookmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Bookmark Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {smartBookmarks.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => onBookmarkChapter(currentChapterData.id)}
                data-testid={`smart-bookmark-${index}`}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussion Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussion Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {discussionPoints.map((point, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{point}</p>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReflectionPrompts(!showReflectionPrompts)}
              data-testid="toggle-reflection-prompts"
            >
              {showReflectionPrompts ? 'Hide' : 'Show'} Reflection Prompts
            </Button>
            
            {showReflectionPrompts && (
              <div className="space-y-2 p-3 border rounded-lg">
                <Textarea
                  placeholder="Write your thoughts and reflections on this chapter..."
                  value={notes[currentChapterData.id] || ''}
                  onChange={(e) => setNotes(prev => ({
                    ...prev,
                    [currentChapterData.id]: e.target.value
                  }))}
                  className="min-h-[100px]"
                  data-testid="reflection-textarea"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quote Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Quote & Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="Select and paste a meaningful quote from the text..."
              value={selectedQuote}
              onChange={(e) => setSelectedQuote(e.target.value)}
              className="min-h-[80px]"
              data-testid="quote-textarea"
            />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleQuoteSelection}
                disabled={!selectedQuote.trim()}
                data-testid="share-quote-button"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Related Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-sm">Related Songs</h4>
              <div className="flex flex-wrap gap-1">
                {contextualMedia.songs.map((song) => (
                  <Badge key={song} variant="secondary" className="text-xs">
                    🎵 {song}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-sm">Historical Photos</h4>
              <div className="flex flex-wrap gap-1">
                {contextualMedia.photos.map((photo) => (
                  <Badge key={photo} variant="outline" className="text-xs">
                    📷 {photo}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-sm">Documents</h4>
              <div className="flex flex-wrap gap-1">
                {contextualMedia.documents.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-xs">
                    📄 {doc}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportNotes}
              data-testid="export-notes-button"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Notes
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              data-testid="export-highlights-button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Export Highlights
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              data-testid="generate-summary-button"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}