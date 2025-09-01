import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Volume2, Eye, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartEntityText } from '@/components/smart-entity-text';
import type { BookChapter, BookAnalysis, Entity, EntityMention } from '../../../shared/schema';

interface BookContentReaderProps {
  bookAnalysis: BookAnalysis;
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  onEntityClick: (entity: Entity | undefined, mention?: EntityMention) => void;
  className?: string;
}

// Fixed pagination component that properly handles page-by-page reading
export function BookContentReader({
  bookAnalysis,
  currentChapter,
  onChapterChange,
  onEntityClick,
  className = ""
}: BookContentReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [readingMode, setReadingMode] = useState('light');
  
  const wordsPerPage = 250; // Standard page size for comfortable reading
  
  const { chapters } = bookAnalysis;
  const chapter = chapters[currentChapter];
  
  if (!chapter) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Chapter not found</p>
      </div>
    );
  }

  // Split chapter content into manageable pages
  const paragraphs = chapter.content.split('\n\n').filter(p => p.trim().length > 0);
  const words = chapter.content.split(/\s+/);
  const totalWords = words.length;
  const totalPages = Math.ceil(totalWords / wordsPerPage);
  
  // Get current page content
  const startWordIndex = currentPage * wordsPerPage;
  const endWordIndex = Math.min(startWordIndex + wordsPerPage, totalWords);
  const currentPageWords = words.slice(startWordIndex, endWordIndex);
  const currentPageText = currentPageWords.join(' ');
  
  // Split into paragraphs for better formatting
  const currentPageParagraphs = currentPageText.split(/\.\s+(?=[A-Z])/).filter(p => p.trim().length > 0);

  // Calculate progress
  const chapterProgress = ((currentPage + 1) / totalPages) * 100;
  const overallProgress = ((currentChapter + (currentPage + 1) / totalPages) / chapters.length) * 100;

  const fontSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const readingModes = {
    light: 'bg-white text-black',
    dark: 'bg-gray-900 text-white', 
    sepia: 'bg-amber-50 text-amber-900'
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (currentChapter < chapters.length - 1) {
      // Move to next chapter
      onChapterChange(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (currentChapter > 0) {
      // Move to previous chapter
      onChapterChange(currentChapter - 1);
      // Set to last page of previous chapter
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
      {/* Chapter header with progress and controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{chapter.title}</h1>
              <p className="text-muted-foreground">
                Chapter {chapter.chapterNumber} of {chapters.length}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Reading mode selector */}
              <Select value={readingMode} onValueChange={setReadingMode}>
                <SelectTrigger className="w-32">
                  <Eye className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Font size selector */}
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-32">
                  <Type className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">X-Large</SelectItem>
                </SelectContent>
              </Select>
              
              <Badge variant="secondary">
                <BookOpen className="h-3 w-3 mr-1" />
                Page {currentPage + 1} of {totalPages}
              </Badge>
              
              {chapter.audioTimestamp && (
                <Badge variant="outline">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio
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

      {/* Main reading content with proper pagination */}
      <Card className={`${readingModes[readingMode as keyof typeof readingModes]} transition-colors`}>
        <CardContent className="p-8">
          <div 
            className={`prose prose-lg max-w-none ${fontSizes[fontSize as keyof typeof fontSizes]}`}
            style={{ 
              lineHeight: '1.8',
              fontFamily: readingMode === 'sepia' ? 'Georgia, serif' : 'inherit'
            }}
          >
            {currentPageParagraphs.map((paragraph, index) => (
              <div
                key={`page-${currentPage}-para-${index}`}
                className="mb-6"
                data-testid={`paragraph-${index}`}
              >
                <SmartEntityText
                  text={paragraph + (paragraph.endsWith('.') ? '' : '.')}
                  onEntityClick={onEntityClick}
                  className="leading-relaxed"
                  analysis={bookAnalysis}
                />
              </div>
            ))}
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
              <span>Page {currentPage + 1} of {totalPages}</span>
              <span>•</span>
              <span>{currentPageWords.length} words</span>
              <span>•</span>
              <span>~{Math.ceil(currentPageWords.length / 200)} min read</span>
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

      {/* Reading statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-lg">{totalWords.toLocaleString()}</div>
              <div className="text-muted-foreground">Words in Chapter</div>
            </div>
            <div>
              <div className="font-semibold text-lg">{totalPages}</div>
              <div className="text-muted-foreground">Total Pages</div>
            </div>
            <div>
              <div className="font-semibold text-lg">{Math.ceil(totalWords / 200)}</div>
              <div className="text-muted-foreground">Est. Reading Time (min)</div>
            </div>
            <div>
              <div className="font-semibold text-lg">{Math.round((chapter.audioDuration || 0) / 60)}</div>
              <div className="text-muted-foreground">Audio Duration (min)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}