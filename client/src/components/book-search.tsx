import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, ChevronRight, BookOpen } from 'lucide-react';
import '../styles/book-search.css';

interface SearchResult {
  pageNumber: number;
  chapter: string;
  chapterTitle: string;
  context: string;
  startIndex: number;
  endIndex: number;
  matchStart: number;
  matchEnd: number;
}

interface BookSearchProps {
  fullText: string;
  pages: any[];
  onNavigate: (pageIndex: number, highlightText?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  initialSearchTerm?: string;
}

export const BookSearch: React.FC<BookSearchProps> = ({
  fullText,
  pages,
  onNavigate,
  isOpen,
  onClose,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  // When initialSearchTerm changes (e.g., from entity pill click), update the search
  useEffect(() => {
    if (initialSearchTerm && isOpen) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm, isOpen]);

  // Perform search when term changes (debounced)
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fullText]);

  const performSearch = useCallback((term: string) => {
    if (!fullText || !term) return;
    
    setIsSearching(true);
    const searchResults: SearchResult[] = [];
    const lowerTerm = term.toLowerCase();
    const lowerText = fullText.toLowerCase();
    
    // Find all occurrences
    let startIndex = 0;
    while (startIndex < lowerText.length) {
      const matchIndex = lowerText.indexOf(lowerTerm, startIndex);
      if (matchIndex === -1) break;
      
      // Get more context (150 chars before and after for better readability)
      const contextStart = Math.max(0, matchIndex - 150);
      const contextEnd = Math.min(fullText.length, matchIndex + term.length + 150);
      let context = fullText.substring(contextStart, contextEnd);
      
      // Track how much we trim from the start for accurate highlighting
      let trimmedFromStart = 0;
      
      // Clean up context - trim to word boundaries
      if (contextStart > 0) {
        const firstSpace = context.indexOf(' ');
        if (firstSpace > 0 && firstSpace < 20) {
          trimmedFromStart = firstSpace + 1;
          context = context.substring(firstSpace + 1);
        }
      }
      if (contextEnd < fullText.length) {
        const lastSpace = context.lastIndexOf(' ');
        if (lastSpace > context.length - 20) {
          context = context.substring(0, lastSpace);
        }
      }
      
      // Find which page this match is on
      let currentPosition = 0;
      let foundPage = null;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageLength = page.content.length;
        
        if (currentPosition + pageLength > matchIndex) {
          foundPage = {
            pageNumber: page.pageNumber,
            chapter: page.chapter,
            chapterTitle: page.chapterTitle,
            pageIndex: i
          };
          break;
        }
        currentPosition += pageLength;
      }
      
      if (foundPage) {
        // Calculate match position within context, accounting for trimming
        const matchStartInContext = matchIndex - contextStart - trimmedFromStart;
        const matchEndInContext = matchStartInContext + term.length;
        
        searchResults.push({
          pageNumber: foundPage.pageNumber,
          chapter: foundPage.chapter,
          chapterTitle: foundPage.chapterTitle,
          context: context,
          startIndex: contextStart,
          endIndex: contextEnd,
          matchStart: matchStartInContext,
          matchEnd: matchEndInContext
        });
      }
      
      startIndex = matchIndex + 1;
    }
    
    setResults(searchResults);
    setIsSearching(false);
  }, [fullText, pages]);

  const handleResultClick = (result: SearchResult, index: number) => {
    // Find the page index
    const pageIndex = pages.findIndex(p => p.pageNumber === result.pageNumber);
    if (pageIndex !== -1) {
      setSelectedResultIndex(index);
      onNavigate(pageIndex, searchTerm);
      // Don't close immediately - let user see where they're going
      setTimeout(() => {
        onClose();
        setSearchTerm('');
        setResults([]);
      }, 500);
    }
  };

  const highlightMatch = (text: string, matchStart: number, matchEnd: number) => {
    const before = text.substring(0, matchStart);
    const match = text.substring(matchStart, matchEnd);
    const after = text.substring(matchEnd);
    
    return (
      <span className="text-gray-700 leading-relaxed text-[15px]">
        ...{before}
        <mark className="bg-yellow-300 font-bold text-black px-1 py-0.5 rounded-sm">
          {match}
        </mark>
        {after}...
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Modal - Beautiful styling matching text selection modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[750px] max-w-[90vw] max-h-[80vh] flex flex-col animate-slideDown border border-gray-100">
        {/* Gradient Header - Match text selection modal */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-8 pt-8 pb-6 rounded-t-3xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Title with Icon */}
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg">
              <Search size={24} className="drop-shadow-lg" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight drop-shadow-lg">
              Search & Discover
            </h3>
          </div>

          {/* Subtitle */}
          <p className="text-white/90 text-[15px] mt-3 leading-relaxed font-medium pl-16">
            Search for any word, phrase, or cultural reference in Just Kids
          </p>
        </div>
        
        {/* Search Input Section */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-200">
          
          {/* Search Input with better styling */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for any word, phrase, or name..."
              className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-[16px] shadow-sm hover:shadow-md"
              autoFocus
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <Search className="text-gray-400" size={20} />
              )}
            </div>
          </div>
          
          {/* Quick Discovery Pills - Beautiful styling */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Discovery</p>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Robert', emoji: '👨‍🎨' },
                { name: 'Dylan', emoji: '🎸' },
                { name: 'Warhol', emoji: '🎨' },
                { name: 'Hotel Chelsea', emoji: '🏨' },
                { name: 'Rimbaud', emoji: '✍️' }
              ].map(entity => (
                <button
                  key={entity.name}
                  onClick={() => setSearchTerm(entity.name)}
                  className="group relative px-4 py-2 text-[14px] font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200/50 hover:border-blue-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-base">{entity.emoji}</span>
                    {entity.name}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Results Count */}
          {results.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Found <span className="font-semibold text-blue-600">{results.length}</span> matches
            </div>
          )}
        </div>
        
        {/* Results with beautiful styling */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
          {results.length === 0 && searchTerm.length >= 2 && !isSearching && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-[16px]">No matches found for</p>
              <p className="text-gray-700 font-semibold text-lg mt-1">"{searchTerm}"</p>
            </div>
          )}
          
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result, index)}
              className={`
                group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                ${selectedResultIndex === index 
                  ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }
              `}
            >
              {/* Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full shadow-md">
                    Page {result.pageNumber}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {result.chapterTitle}
                  </span>
                </div>
                <div className="p-1.5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <ChevronRight className="text-blue-600" size={16} />
                </div>
              </div>
              
              {/* Context with Highlighted Match */}
              <div className="pl-1">
                <div className="text-[15px] leading-relaxed">
                  {highlightMatch(result.context, result.matchStart, result.matchEnd)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default BookSearch;