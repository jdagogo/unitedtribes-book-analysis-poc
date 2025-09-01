import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, BookOpen, ChevronLeft, ChevronRight, Link as LinkIcon, Search } from 'lucide-react';
import type { BookAnalysis, BookChapter, Entity, EntityMention } from '../../../shared/schema';
import { SmartEntityText } from './smart-entity-text';

interface BookReaderProps {
  bookAnalysis: BookAnalysis;
  entitiesMap: Map<string, Entity>;
  onEntityClick: (entity: Entity | undefined, mention?: EntityMention) => void;
}

export function BookReader({ bookAnalysis, entitiesMap, onEntityClick }: BookReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showCrossMediaConnections, setShowCrossMediaConnections] = useState(false);
  
  const { book, chapters, crossMediaConnections, stats } = bookAnalysis;
  const chapter = chapters[currentChapter];

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const previousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const formatPageRange = (start?: number, end?: number) => {
    if (!start && !end) return '';
    if (start && end) return `Pages ${start}-${end}`;
    if (start) return `Page ${start}+`;
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Book Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Book className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{book.title}</CardTitle>
              <p className="text-lg text-muted-foreground mb-2">by {book.author}</p>
              <p className="text-sm text-muted-foreground mb-3">{book.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{book.genre}</Badge>
                <Badge variant="outline">{book.pageCount} pages</Badge>
                <Badge variant="outline">{book.publishedYear}</Badge>
                <Badge variant="outline">{book.publisher}</Badge>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>📖 {stats.chaptersCount} chapters</span>
                <span>🔗 {crossMediaConnections.sharedEntities.length} shared entities</span>
                <span>📊 {stats.totalEntities} total entities</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cross-Media Connections Panel */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Cross-Media Discovery
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCrossMediaConnections(!showCrossMediaConnections)}
            >
              {showCrossMediaConnections ? 'Hide' : 'Show'} Connections
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showCrossMediaConnections && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Shared Entities with Podcast</h4>
                <div className="flex flex-wrap gap-1">
                  {crossMediaConnections.sharedEntities.map((entityName) => (
                    <Badge 
                      key={entityName} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      onClick={() => {
                        // Find entity by name and trigger click
                        const entity = Array.from(entitiesMap.values()).find(e => e.name === entityName);
                        onEntityClick(entity);
                      }}
                    >
                      {entityName}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.keyThemes.map((theme) => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="font-medium mb-2">Fresh Air Audio Connection</h4>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Live Audio Available</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  The complete Fresh Air interview audio is embedded throughout this book, providing Terry Gross's in-depth conversation about these same life events.
                </p>
              </div>
              
              <h4 className="font-medium mb-2">Narrative Overlaps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {crossMediaConnections.narrativeOverlaps.map((overlap, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {overlap}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chapter Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chapter {chapter.chapterNumber}: {chapter.title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousChapter}
                disabled={currentChapter === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground px-2">
                {currentChapter + 1} of {chapters.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {formatPageRange(chapter.pageStart ?? undefined, chapter.pageEnd ?? undefined)}
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <SmartEntityText
                text={chapter.content}
                onEntityClick={onEntityClick}
                className="leading-relaxed"
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chapter List */}
      <Card>
        <CardHeader>
          <CardTitle>All Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapters.map((chap, index) => (
              <button
                key={chap.id}
                onClick={() => setCurrentChapter(index)}
                className={`p-3 text-left rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  index === currentChapter 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="font-medium text-sm mb-1">
                  Chapter {chap.chapterNumber}: {chap.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPageRange(chap.pageStart ?? undefined, chap.pageEnd ?? undefined)}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}