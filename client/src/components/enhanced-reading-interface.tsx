import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BookChapter, BookAnalysis } from '../../../shared/schema';

interface EnhancedReadingInterfaceProps {
  bookAnalysis: BookAnalysis;
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  onEntityClick: (entity: any) => void;
  className?: string;
}

// Component to handle proper pagination within chapters
export function EnhancedReadingInterface({
  bookAnalysis,
  currentChapter,
  onChapterChange,
  onEntityClick,
  className = ""
}: EnhancedReadingInterfaceProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [wordsPerPage] = useState(250); // Standard reading page size
  
  const { chapters } = bookAnalysis;
  const chapter = chapters[currentChapter];
  
  if (!chapter) {
    return <div className="p-6 text-center">Chapter not found</div>;
  }

  // Split chapter content into pages
  const words = chapter.content.split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);
  const currentPageWords = words.slice(
    currentPage * wordsPerPage,
    (currentPage + 1) * wordsPerPage
  );
  const currentPageText = currentPageWords.join(' ');

  // Calculate progress within current chapter
  const chapterProgress = ((currentPage + 1) / totalPages) * 100;
  
  // Calculate overall book progress
  const overallProgress = ((currentChapter + (currentPage + 1) / totalPages) / chapters.length) * 100;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapter < chapters.length - 1) {
      // Move to next chapter
      onChapterChange(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapter > 0) {
      // Move to previous chapter
      onChapterChange(currentChapter - 1);
      // Go to last page of previous chapter
      const prevChapter = chapters[currentChapter - 1];
      const prevWords = prevChapter.content.split(/\s+/);
      const prevTotalPages = Math.ceil(prevWords.length / wordsPerPage);
      setCurrentPage(prevTotalPages - 1);
    }
  };

  // Reset page when chapter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [currentChapter]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chapter header with progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{chapter.title}</h1>
              <p className="text-muted-foreground">
                Chapter {chapter.chapterNumber} of {chapters.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <BookOpen className="h-3 w-3 mr-1" />
                Page {currentPage + 1} of {totalPages}
              </Badge>
              {chapter.audioTimestamp && (
                <Badge variant="outline">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio Available
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Chapter Progress</span>
              <span>{Math.round(chapterProgress)}%</span>
            </div>
            <Progress value={chapterProgress} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Book Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Main reading content */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div 
              className="text-content leading-relaxed"
              style={{ 
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: 'Georgia, serif'
              }}
            >
              {currentPageText.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentChapter === 0 && currentPage === 0}
              data-testid="prev-page-button"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentPage > 0 ? 'Previous Page' : 'Previous Chapter'}
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              <span>•</span>
              <span>
                {currentPageWords.length} words
              </span>
              <span>•</span>
              <span>
                ~{Math.ceil(currentPageWords.length / 200)} min read
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentChapter === chapters.length - 1 && currentPage === totalPages - 1}
              data-testid="next-page-button"
            >
              {currentPage < totalPages - 1 ? 'Next Page' : 'Next Chapter'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reading stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{words.length.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Words in Chapter</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{totalPages}</div>
              <div className="text-xs text-muted-foreground">Total Pages</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{Math.ceil(words.length / 200)}</div>
              <div className="text-xs text-muted-foreground">Minutes to Read</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{chapter.audioDuration || 0}s</div>
              <div className="text-xs text-muted-foreground">Audio Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}