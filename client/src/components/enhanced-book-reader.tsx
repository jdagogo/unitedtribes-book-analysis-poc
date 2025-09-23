import { useState, useRef, useEffect } from 'react';
import { Book, BookOpen, ChevronLeft, ChevronRight, Play, Pause, Bookmark, Share, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BookAnalysis, BookChapter, Entity, EntityMention } from '../../../shared/schema';
import { SmartEntityText } from './smart-entity-text';
import { EnhancedAudioPlayer } from './enhanced-audio-player';
import { BookContentReader } from './book-content-reader';

interface EnhancedBookReaderProps {
  bookAnalysis: BookAnalysis;
  entitiesMap: Map<string, Entity>;
  onEntityClick: (entity: Entity | undefined, mention?: EntityMention) => void;
}

export function EnhancedBookReader({ bookAnalysis, entitiesMap, onEntityClick }: EnhancedBookReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showCrossMediaConnections, setShowCrossMediaConnections] = useState(false);
  const [audioSyncEnabled, setAudioSyncEnabled] = useState(true);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [readingMode, setReadingMode] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fontSize, setFontSize] = useState('medium');
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [highlightedParagraph, setHighlightedParagraph] = useState<number | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { book, chapters, crossMediaConnections, stats } = bookAnalysis;
  const chapter = chapters[currentChapter];

  // Reading preferences
  const fontSizes = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const readingModeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  };

  // Navigation functions
  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      scrollToTop();
    }
  };

  const previousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Bookmark functions
  const toggleBookmark = (chapterId: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(chapterId)) {
      newBookmarks.delete(chapterId);
    } else {
      newBookmarks.add(chapterId);
    }
    setBookmarks(newBookmarks);
  };

  // Audio sync with text highlighting
  const handleAudioTimeUpdate = (time: number) => {
    setCurrentAudioTime(time);
    
    if (audioSyncEnabled && chapter?.audioTimestamp !== null) {
      // Calculate which paragraph should be highlighted based on audio time
      const relativeTime = time - (chapter.audioTimestamp || 0);
      const paragraphs = chapter.content.split('\n\n');
      const timePerParagraph = (chapter.audioDuration || 0) / paragraphs.length;
      const paragraphIndex = Math.floor(relativeTime / timePerParagraph);
      
      if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
        setHighlightedParagraph(paragraphIndex);
      }
    }
  };

  // Format page range display
  const formatPageRange = (start?: number, end?: number): string => {
    if (!start && !end) return '';
    if (start && end) return `Pages ${start}-${end}`;
    if (start) return `Page ${start}+`;
    return '';
  };

  // Enhanced content rendering with audio sync highlighting
  const renderChapterContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => (
      <div
        key={index}
        className={`mb-4 p-3 rounded-lg transition-all duration-300 ${
          audioSyncEnabled && highlightedParagraph === index
            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
        }`}
        data-testid={`paragraph-${index}`}
      >
        <SmartEntityText
          text={paragraph}
          onEntityClick={onEntityClick}
          className={`leading-relaxed ${fontSizes[fontSize as keyof typeof fontSizes]}`}
          analysis={bookAnalysis}
        />
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Book Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Book className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2" data-testid="book-title">{book.title}</CardTitle>
              <p className="text-lg text-muted-foreground mb-2">by {book.author}</p>
              <p className="text-sm text-muted-foreground mb-3">{book.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{book.genre}</Badge>
                <Badge variant="outline">{book.pageCount} pages</Badge>
                <Badge variant="outline">{book.publishedYear}</Badge>
                <Badge variant="outline">{book.publisher}</Badge>
                {book.audioUrl && <Badge variant="outline" className="bg-green-50 text-green-700">🎧 Audiobook</Badge>}
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                <span>📖 {stats.chaptersCount} chapters</span>
                <span>🔗 {crossMediaConnections.sharedEntities.length} shared entities</span>
                <span>📊 {stats.totalEntities} total entities</span>
                <span>⏱️ {Math.round((book.audioDuration || 0) / 3600)} hours audio</span>
              </div>

              {/* Reading Controls */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                  data-testid="toggle-audio-player"
                >
                  {showAudioPlayer ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {showAudioPlayer ? 'Hide Audio' : 'Show Audio'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBookmark(chapter.id)}
                  data-testid="toggle-bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarks.has(chapter.id) ? 'fill-current' : ''}`} />
                  Bookmark
                </Button>
                
                <Button variant="outline" size="sm" data-testid="share-chapter">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Audio Player */}
      {showAudioPlayer && book.audioUrl && (
        <EnhancedAudioPlayer
          audioUrl={book.audioUrl}
          chapters={chapters}
          currentChapter={currentChapter}
          onChapterChange={setCurrentChapter}
          onTimeUpdate={handleAudioTimeUpdate}
          data-testid="enhanced-audio-player"
        />
      )}

      {/* Reading Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reading Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger data-testid="font-size-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Reading Mode</Label>
              <Select value={readingMode} onValueChange={(value: any) => setReadingMode(value)}>
                <SelectTrigger data-testid="reading-mode-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="audio-sync"
                checked={audioSyncEnabled}
                onCheckedChange={setAudioSyncEnabled}
                data-testid="audio-sync-toggle"
              />
              <Label htmlFor="audio-sync">Audio Sync Highlighting</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Media Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cross-Media Discovery</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCrossMediaConnections(!showCrossMediaConnections)}
              data-testid="toggle-cross-media"
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
                  {crossMediaConnections.sharedEntities.map((entityName) => {
                    // Try multiple matching strategies to find the entity
                    const entity = Array.from(entitiesMap.values()).find(e => 
                      e.name === entityName || 
                      e.name.toLowerCase() === entityName.toLowerCase() ||
                      e.aliases?.includes(entityName) ||
                      e.id === entityName.toLowerCase().replace(/\s+/g, '-')
                    );
                    
                    console.log(`🔍 Looking for entity "${entityName}":`, entity ? 'Found' : 'Not found', entity);
                    
                    return (
                      <Badge 
                        key={entityName} 
                        variant="secondary" 
                        className={`text-xs transition-colors ${
                          entity 
                            ? 'cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-105' 
                            : 'cursor-default opacity-75'
                        }`}
                        onClick={() => {
                          if (entity) {
                            console.log(`✅ Clicking entity "${entityName}":`, entity);
                            onEntityClick(entity);
                          } else {
                            console.warn(`❌ Entity "${entityName}" not found in entitiesMap`);
                            // Create a fallback entity for missing entities
                            const fallbackEntity = {
                              id: entityName.toLowerCase().replace(/\s+/g, '-'),
                              name: entityName,
                              type: 'Unknown' as const,
                              description: `Cross-media reference: ${entityName}`,
                              category: 'Unknown' as const,
                              aliases: [],
                              wikiDataId: null,
                              sentiment: 'neutral' as const,
                              importance: 5
                            };
                            onEntityClick(fallbackEntity);
                          }
                        }}
                        data-testid={`entity-badge-${entityName.replace(/\s+/g, '-').toLowerCase()}`}
                        title={entity ? `Click to view details about ${entityName}` : `${entityName} (limited info available)`}
                      >
                        {entityName}
                        {entity ? ' 🔗' : ' ❓'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.keyThemes.map((theme) => (
                    <Badge key={theme} variant="outline" className="text-xs" data-testid={`theme-${theme.replace(/\s+/g, '-').toLowerCase()}`}>
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
                  The complete Fresh Air interview audio connects directly with these autobiography chapters.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Enhanced Chapter Reading */}
      <Card className={`${readingModeClasses[readingMode]} transition-colors duration-300`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chapter {chapter.chapterNumber}: {chapter.title}
              {bookmarks.has(chapter.id) && <Bookmark className="h-4 w-4 fill-current text-yellow-500" />}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousChapter}
                disabled={currentChapter === 0}
                data-testid="button-prev-chapter"
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
                data-testid="button-next-chapter"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {formatPageRange(chapter.pageStart ?? undefined, chapter.pageEnd ?? undefined)}
            {audioSyncEnabled && chapter.audioTimestamp !== null && (
              <span className="ml-4">🎧 Audio Chapter</span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Replace with paginated reading interface */}
          <BookContentReader
            bookAnalysis={bookAnalysis}
            currentChapter={currentChapter}
            onChapterChange={setCurrentChapter}
            onEntityClick={onEntityClick}
          />
        </CardContent>
      </Card>

      {/* Chapter Navigation Grid */}
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
                data-testid={`chapter-nav-${index}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">
                    Chapter {chap.chapterNumber}: {chap.title}
                  </div>
                  {bookmarks.has(chap.id) && (
                    <Bookmark className="h-3 w-3 fill-current text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPageRange(chap.pageStart ?? undefined, chap.pageEnd ?? undefined)}
                  {chap.audioTimestamp !== null && <span className="ml-2">🎧</span>}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}