import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Book, Clock, Users } from 'lucide-react';
import { NativeAudioPlayer } from '@/components/native-audio-player';

interface AudiobookChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  startTime: number;
  endTime: number;
  keyEntities: string[];
  keyTopics: string[];
}

interface AudiobookData {
  id: string;
  title: string;
  author: string;
  chapters: AudiobookChapter[];
  totalWords: number;
  audioDuration: number;
  youtubeUrl: string;
  processedAt: string;
}

interface SearchResult {
  chapterNumber: number;
  chapterTitle: string;
  matchCount: number;
  snippets: string[];
  startTime: number;
  endTime: number;
  relevanceScore: number;
}

export default function AudiobookReader() {
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fetch the latest processed audiobook
  const { data: audiobookData, isLoading, error } = useQuery({
    queryKey: ['/api/audiobook'],
    select: (response: any) => response.data as AudiobookData
  });

  // Search function
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/audiobook/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openYouTubeAtTime = (startTime: number) => {
    if (audiobookData?.youtubeUrl) {
      const url = `${audiobookData.youtubeUrl}&t=${startTime}s`;
      window.open(url, '_blank');
    }
  };

  const openAudioPlayer = () => {
    setIsPlayerOpen(true);
  };

  const handleChapterChange = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Book className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-800">Loading audiobook...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging for troubleshooting
  console.log('Audiobook Reader Debug:', {
    isLoading,
    error: error?.message,
    hasData: !!audiobookData,
    chaptersCount: audiobookData?.chapters?.length,
    audiobookDataStructure: audiobookData ? Object.keys(audiobookData) : 'no data',
    firstChapter: audiobookData?.chapters?.[0] ? {
      id: audiobookData.chapters[0].id,
      title: audiobookData.chapters[0].title,
      hasContent: !!audiobookData.chapters[0].content
    } : 'no first chapter'
  });

  if (error) {
    console.error('Audiobook fetch error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Audiobook</h2>
              <p className="text-gray-600 mb-4">Error: {error.message}</p>
              <div className="space-x-4">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => window.location.href = '/process-audiobook'}
                  data-testid="button-process-book"
                >
                  Process Complete Book
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!audiobookData || !audiobookData.chapters || audiobookData.chapters.length === 0) {
    console.log('Showing no audiobook message because:', {
      noData: !audiobookData,
      noChapters: !audiobookData?.chapters,
      emptyChapters: audiobookData?.chapters?.length === 0
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Audiobook Available</h2>
              <p className="text-gray-600 mb-4">Please process the complete book first.</p>
              <Button 
                onClick={() => window.location.href = '/process-audiobook'}
                data-testid="button-process-book"
              >
                Process Complete Book
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentChapter = audiobookData.chapters.find(ch => ch.number === selectedChapter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-book-title">
                {audiobookData.title}
              </h1>
              <p className="text-lg text-gray-600" data-testid="text-book-author">
                by {audiobookData.author}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span data-testid="text-duration">{formatTime(audiobookData.audioDuration)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Book className="h-4 w-4" />
                <span data-testid="text-word-count">{audiobookData.totalWords.toLocaleString()} words</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search the entire book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button onClick={performSearch} data-testid="button-search">
              Search
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Chapters ({audiobookData.chapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {audiobookData.chapters.map(chapter => (
                      <div
                        key={chapter.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChapter === chapter.number
                            ? 'bg-amber-100 border-2 border-amber-300'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedChapter(chapter.number)}
                        data-testid={`chapter-${chapter.number}`}
                      >
                        <div className="font-medium text-sm mb-1">{chapter.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatTime(chapter.startTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {chapter.wordCount} words
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="chapter" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chapter" data-testid="tab-chapter">Chapter</TabsTrigger>
                <TabsTrigger value="search" data-testid="tab-search">
                  Search Results ({searchResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapter" className="mt-4">
                {currentChapter && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl" data-testid="text-chapter-title">
                          {currentChapter.title}
                        </CardTitle>
                        <Button
                          onClick={openAudioPlayer}
                          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                          data-testid="button-play-youtube"
                        >
                          <Play className="h-4 w-4" />
                          Play Audio ({formatTime(currentChapter.startTime)})
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentChapter.keyTopics.map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentChapter.keyEntities.slice(0, 8).map(entity => (
                          <Badge key={entity} variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="text-chapter-content">
                          {currentChapter.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <div className="space-y-4">
                  {searchResults.length === 0 && searchQuery && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No results found for "{searchQuery}"</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {searchResults.map((result, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 
                            className="font-semibold text-lg cursor-pointer text-amber-700 hover:text-amber-800"
                            onClick={() => setSelectedChapter(result.chapterNumber)}
                            data-testid={`search-result-${index}`}
                          >
                            {result.chapterTitle}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {result.matchCount} matches
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openYouTubeAtTime(result.startTime)}
                              data-testid={`button-play-search-${index}`}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              {formatTime(result.startTime)}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {result.snippets.map((snippet, snippetIndex) => (
                            <div 
                              key={snippetIndex}
                              className="bg-gray-50 p-3 rounded text-sm leading-relaxed"
                              data-testid={`snippet-${index}-${snippetIndex}`}
                            >
                              ...{snippet}...
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Native Audio Player */}
      {currentChapter && (
        <NativeAudioPlayer
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          currentChapter={currentChapter}
          allChapters={audiobookData.chapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            startTime: ch.startTime,
            endTime: ch.endTime,
            content: ch.content,
            wordCount: ch.wordCount
          }))}
          onChapterChange={handleChapterChange}
          title={audiobookData.title}
          author={audiobookData.author}
        />
      )}
    </div>
  );
}