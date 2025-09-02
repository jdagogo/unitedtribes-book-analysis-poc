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
      
      // Clean up context - trim to word boundaries
      if (contextStart > 0) {
        const firstSpace = context.indexOf(' ');
        if (firstSpace > 0 && firstSpace < 20) {
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
        // Calculate match position within context
        const matchStartInContext = matchIndex - contextStart;
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
      <span className="text-gray-700 leading-relaxed">
        ...{before}
        <mark className="bg-yellow-300 font-semibold text-black px-0.5 rounded-sm">
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
      
      {/* Search Modal - Responsive sizing */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-w-[90vw] max-h-[75vh] flex flex-col animate-slideDown">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                <Search size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Search & Discover</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for any word, phrase, or name..."
              className="w-full px-4 py-2.5 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-base"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <Search className="text-gray-400" size={20} />
              )}
            </div>
          </div>
          
          {/* Quick Discovery Pills */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Quick Discovery:</div>
            <div className="flex flex-wrap gap-2">
              {['Robert', 'Dylan', 'Warhol', 'Chelsea Hotel', 'Rimbaud'].map(entity => (
                <button
                  key={entity}
                  onClick={() => setSearchTerm(entity)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  {entity}
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
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {results.length === 0 && searchTerm.length >= 2 && !isSearching && (
            <div className="text-center py-12 text-gray-500">
              No matches found for "{searchTerm}"
            </div>
          )}
          
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result, index)}
              className={`
                group p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedResultIndex === index 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                }
              `}
            >
              {/* Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-600">
                    Page {result.pageNumber}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm font-medium text-gray-700">
                    {result.chapterTitle}
                  </span>
                </div>
                <ChevronRight className="text-blue-500 group-hover:translate-x-1 transition-transform" size={18} />
              </div>
              
              {/* Context with Highlighted Match */}
              <div className="pl-2">
                <div className="text-sm">
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