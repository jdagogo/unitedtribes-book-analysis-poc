import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { DiscoveryCard } from './discovery-card';
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
  originalSearchTerm?: string; // Track what the user originally searched for
}

interface BookSearchProps {
  fullText: string;
  pages: any[];
  onNavigate: (pageIndex: number, highlightText?: string, context?: string) => void;
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
  const [originalSearchTerm, setOriginalSearchTerm] = useState(initialSearchTerm); // Store the original user input
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  const [showDiscoveryCard, setShowDiscoveryCard] = useState(false);

  // Define entity aliases - maps entity names to their variants
  // Note: We handle Robert Mapplethorpe specially to avoid duplicates
  const entityAliases: Record<string, string[]> = {
    'Hotel Chelsea': ['Hotel Chelsea', 'Chelsea Hotel', 'the Chelsea'],
    'Chelsea Hotel': ['Hotel Chelsea', 'Chelsea Hotel', 'the Chelsea'],
    'the Chelsea': ['Hotel Chelsea', 'Chelsea Hotel', 'the Chelsea']
  };
  
  // Map search terms to proper entity names for Discovery functionality
  const getDiscoveryTerm = (term: string): string => {
    const lowerTerm = term.toLowerCase();
    // Max's always refers to Max's Kansas City in Just Kids context
    if (lowerTerm === "max's" || lowerTerm === "maxs") {
      return "Max's Kansas City";
    }
    // Map various Robert references to full name for discovery
    if (lowerTerm === "robert" || lowerTerm === "bobby" || lowerTerm === "mapplethorpe") {
      return "Robert Mapplethorpe";
    }
    // Map all Chelsea Hotel variants to the standard name
    if (lowerTerm === "the chelsea" || lowerTerm === "chelsea hotel") {
      return "Hotel Chelsea";
    }
    return term;
  };

  // When initialSearchTerm changes (e.g., from entity pill click), update the search
  useEffect(() => {
    if (initialSearchTerm && isOpen) {
      setSearchTerm(initialSearchTerm);
      setOriginalSearchTerm(initialSearchTerm);
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
  }, [searchTerm, pages]);

  const performSearch = useCallback((term: string) => {
    if (!pages || pages.length === 0 || !term) return;
    
    // Store the original search term when user performs a search
    console.log('🔎 PERFORMING SEARCH FOR:', term);
    setOriginalSearchTerm(term);
    
    setIsSearching(true);
    const searchResults: SearchResult[] = [];
    
    // Build the full text from actual page contents to ensure positions match
    const fullText = pages.map(p => p.content).join(' ');
    
    // Normalize apostrophes and special characters in search term
    const normalizeText = (text: string) => {
      return text
        .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // Convert smart quotes to straight apostrophe
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // Convert smart double quotes to straight quotes
        .toLowerCase();
    };
    
    // Helper function to check if a "Robert" instance refers to Mapplethorpe
    // Note: In "Just Kids", most "Robert" references ARE Robert Mapplethorpe
    // So we should include by default unless it's clearly someone else
    const isRobertMapplethorpe = (text: string, position: number) => {
      const lowerText = text.toLowerCase();
      // Get context around the match to check for other Roberts
      const start = Math.max(0, position - 200);
      const end = Math.min(lowerText.length, position + 200);
      const nearbyText = lowerText.substring(start, end);
      
      // Explicitly exclude if it's a different Robert
      const otherRoberts = [
        'robert frost', 
        'robert kennedy', 
        'robert rauschenberg', 
        'robert wilson',
        'robert louis stevenson',
        'robert de niro',
        'robert redford',
        'robert plant',
        'robert johnson',
        'robert burns'
      ];
      
      for (const otherRobert of otherRoberts) {
        if (nearbyText.includes(otherRobert)) return false;
      }
      
      // In "Just Kids", assume Robert means Mapplethorpe unless proven otherwise
      return true;
    };
    
    // Helper function to check if "the Chelsea" refers to the hotel
    const isChelseaHotel = (text: string, position: number) => {
      const lowerText = text.toLowerCase();
      // Get surrounding context (200 chars each direction)
      const start = Math.max(0, position - 200);
      const end = Math.min(lowerText.length, position + 200);
      const nearbyText = lowerText.substring(start, end);
      
      // Hotel-related keywords that indicate "the Chelsea" means the hotel
      const hotelKeywords = ['hotel', 'room', 'lobby', 'floor', 'elevator', 'resident', 'lived', 'stay', 'moved', 'building'];
      // Neighborhood keywords that indicate it's NOT the hotel
      const neighborhoodKeywords = ['neighborhood', 'area', 'district', 'streets of', 'avenue'];
      
      // Check for hotel indicators
      const hasHotelContext = hotelKeywords.some(keyword => nearbyText.includes(keyword));
      const hasNeighborhoodContext = neighborhoodKeywords.some(keyword => nearbyText.includes(keyword));
      
      return hasHotelContext && !hasNeighborhoodContext;
    };
    
    // Determine search strategy based on the term
    const normalizedInputTerm = normalizeText(term);
    let searchTerms: string[] = [];
    
    // Check for entity aliases with case-insensitive lookup
    let aliasMatch = null;
    for (const [key, value] of Object.entries(entityAliases)) {
      if (normalizeText(key) === normalizedInputTerm) {
        aliasMatch = value;
        break;
      }
    }
    
    // Special handling for Robert Mapplethorpe and related searches
    if (normalizedInputTerm === 'robert mapplethorpe') {
      // Search for all variations: full name, just Robert, just Mapplethorpe, and Bobby
      searchTerms = ['Robert Mapplethorpe', 'Mapplethorpe', 'Robert', 'Bobby'];
    } else if (normalizedInputTerm === 'mapplethorpe') {
      // Search for Mapplethorpe and full name
      searchTerms = ['Mapplethorpe', 'Robert Mapplethorpe'];
    } else if (normalizedInputTerm === 'bobby') {
      // Bobby is a nickname for Robert in this context
      searchTerms = ['Bobby', 'Robert'];
    } else if (aliasMatch) {
      searchTerms = aliasMatch;
    } else {
      searchTerms = [term];
    }
    
    // Search for each variant
    searchTerms.forEach(searchVariant => {
      const normalizedSearchTerm = normalizeText(searchVariant);
      const normalizedFullText = normalizeText(fullText);
      
      // Create a version without apostrophes for flexible matching
      const searchTermNoApostrophe = normalizedSearchTerm.replace(/'/g, '');
      const fullTextNoApostrophe = normalizedFullText.replace(/'/g, '');
      
      // Find all occurrences
      let startIndex = 0;
      while (startIndex < normalizedFullText.length) {
        let matchIndex = -1;
        
        // First try exact normalized match
        matchIndex = normalizedFullText.indexOf(normalizedSearchTerm, startIndex);
        
        // If no exact match and search term doesn't have apostrophes, try flexible search
        if (matchIndex === -1 && !normalizedSearchTerm.includes("'")) {
          // Calculate the flexible start index by removing apostrophes before startIndex
          let flexStartIndex = 0;
          for (let i = 0; i < startIndex && i < normalizedFullText.length; i++) {
            if (normalizedFullText[i] !== "'") {
              flexStartIndex++;
            }
          }
          
          let flexIndex = fullTextNoApostrophe.indexOf(searchTermNoApostrophe, flexStartIndex);
          
          if (flexIndex !== -1) {
            // Found a match in the no-apostrophe text
            // Now find the actual position in the original normalized text
            let realIndex = 0;
            let flexCount = 0;
            
            // Map flexible index back to real index by counting characters
            while (flexCount < flexIndex && realIndex < normalizedFullText.length) {
              if (normalizedFullText[realIndex] !== "'") {
                flexCount++;
              }
              realIndex++;
            }
            matchIndex = realIndex;
          }
        }
        
        if (matchIndex === -1) break;
        
        // Apply contextual filtering for special cases
        // For "Robert Mapplethorpe" search, exclude other Roberts
        if (normalizedInputTerm === 'robert mapplethorpe' && normalizedSearchTerm === 'robert') {
          // Check if this "Robert" is actually a different Robert
          if (!isRobertMapplethorpe(fullText, matchIndex)) {
            startIndex = matchIndex + 1;
            continue; // Skip this match
          }
        } 
        // For any Hotel Chelsea related search, apply context filtering to "the Chelsea"
        else if ((normalizedInputTerm === 'hotel chelsea' || 
                  normalizedInputTerm === 'chelsea hotel' || 
                  normalizedInputTerm === 'the chelsea') && 
                 normalizedSearchTerm === 'the chelsea') {
          // Check if this "the Chelsea" refers to the hotel (not neighborhood)
          if (!isChelseaHotel(fullText, matchIndex)) {
            startIndex = matchIndex + 1;
            continue; // Skip this match
          }
        }
        
        // Get more context (150 chars before and after for better readability)
        const contextStart = Math.max(0, matchIndex - 150);
        const contextEnd = Math.min(fullText.length, matchIndex + searchVariant.length + 150);
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
          // Add 1 for the space we added when joining pages
          const pageLength = page.content.length + (i < pages.length - 1 ? 1 : 0);
          
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
          let matchLength = searchVariant.length;
          
          // Special handling for Max's -> Max's Kansas City
          const normalizedSearch = normalizedSearchTerm;
          if (normalizedSearch === "max's" || normalizedSearch === "maxs") {
            // Check if "Kansas City" follows within the context itself
            const contextFromMatch = context.substring(matchStartInContext);
            // Use flexible pattern that matches any apostrophe variant
            const kansasCityMatch = contextFromMatch.match(/^Max.s\s+Kansas\s+City/i);
            if (kansasCityMatch) {
              // Use the full matched length for highlighting
              matchLength = kansasCityMatch[0].length;
            }
          }
          
          const matchEndInContext = matchStartInContext + matchLength;
          
          searchResults.push({
            pageNumber: foundPage.pageNumber,
            chapter: foundPage.chapter,
            chapterTitle: foundPage.chapterTitle,
            context: context,
            startIndex: contextStart,
            endIndex: contextEnd,
            matchStart: matchStartInContext,
            matchEnd: matchEndInContext,
            originalSearchTerm: term // Store the original search term with each result
          });
        }
        
        startIndex = matchIndex + 1;
      }
    });
    
    // Remove duplicate results (same position found by different search terms)
    const uniqueResults = searchResults.filter((result, index, self) => {
      // Keep only the first occurrence of each unique position
      return index === self.findIndex(r => 
        r.pageNumber === result.pageNumber && 
        r.startIndex === result.startIndex &&
        r.endIndex === result.endIndex
      );
    });
    
    // Sort results by page number to maintain chronological order
    uniqueResults.sort((a, b) => a.pageNumber - b.pageNumber);
    
    setResults(uniqueResults);
    setIsSearching(false);
  }, [pages, entityAliases]);

  const handleResultClick = (result: SearchResult, index: number) => {
    // Find the page index
    const pageIndex = pages.findIndex(p => p.pageNumber === result.pageNumber);
    
    if (pageIndex !== -1) {
      setSelectedResultIndex(index);
      
      // Debug logging to track what context is being passed
      console.log('🔍 Search Result Click:', {
        originalSearchTerm: originalSearchTerm,  // This is what the user actually searched for
        currentSearchTerm: searchTerm,  // Current value in search box
        pageNumber: result.pageNumber,
        contextPreview: result.context.substring(0, 100),
        fullContext: result.context
      });
      
      // Extra debugging
      if (originalSearchTerm !== searchTerm) {
        console.warn('⚠️ MISMATCH: originalSearchTerm differs from searchTerm!', {
          original: originalSearchTerm,
          current: searchTerm
        });
      }
      
      // IMPORTANT: Pass the ORIGINAL search term that the user typed,
      // not the variant that was found. This ensures proper highlighting.
      // For example, if user searched "Bob Dylan", pass "Bob Dylan" not "bob dy"
      // ALWAYS use the current search term in the search box when clicking
      // This ensures we use the full term the user typed, not a truncated version from an earlier search
      const searchTermToUse = searchTerm; // Use current value in search box
      console.log('🎯 NAVIGATING WITH SEARCH TERM:', searchTermToUse);
      console.log('📝 Result was from search for:', result.originalSearchTerm);
      onNavigate(pageIndex, searchTermToUse, result.context);
      
      // Close the modal after navigation but keep search term for highlighting
      setTimeout(() => {
        onClose();
        // Don't clear search term here - let the destination page handle it
        setResults([]);
      }, 500);
    }
  };

  const highlightMatch = (text: string, matchStart: number, matchEnd: number) => {
    const before = text.substring(0, matchStart);
    const match = text.substring(matchStart, matchEnd);
    const after = text.substring(matchEnd);
    
    return (
      <span className="text-indigo-900 leading-relaxed text-[18px]">
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
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Modal - Beautiful styling matching text selection modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[860px] max-w-[90vw] max-h-[80vh] flex flex-col animate-slideDown border border-indigo-200 overflow-hidden">
        {/* Gradient Header - Match text selection modal */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-8 pt-8 pb-6 rounded-t-3xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Title with Icon */}
          <div className="flex items-center gap-4 text-white">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg">
              <Search size={28} className="text-white drop-shadow-lg" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight drop-shadow-lg">
              Search & Discover
            </h3>
          </div>

          {/* Subtitle */}
          <p className="text-white text-[20px] mt-3 leading-relaxed font-semibold pl-16">
            Search for any word, phrase, or cultural reference in <i>Just Kids</i>
          </p>
        </div>
        
        {/* Search Input Section */}
        <div className="px-8 pt-6 pb-4 border-b border-indigo-200">
          
          {/* Search Input with better styling */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                // When user types, update both search term and original
                if (value) {
                  setOriginalSearchTerm(value);
                }
              }}
              placeholder="Search for any word, phrase, or name..."
              className="w-full px-5 py-3 pr-20 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-[30px] font-semibold shadow-sm hover:shadow-md bg-blue-50/30 placeholder-indigo-500"
              autoFocus
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            {/* Clear button - only show when there's text */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setOriginalSearchTerm('');
                  // Keep focus on input
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) {
                    input.focus();
                  }
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                aria-label="Clear search"
              >
                <X className="text-indigo-400 hover:text-indigo-600" size={20} />
              </button>
            )}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-300 border-t-blue-600" />
              ) : (
                <Search className="text-indigo-500" size={24} />
              )}
            </div>
          </div>
          
          {/* Discovery Button - Opens Cultural Discovery modal */}
          {searchTerm.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowDiscoveryCard(true)}
                className="group flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-[16px] rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Discover "{getDiscoveryTerm(searchTerm)}"</span>
              </button>
            </div>
          )}
          
          {/* Quick Discovery Pills - Beautiful styling */}
          <div className="mt-5">
            <p className="text-base font-bold text-indigo-700 uppercase tracking-wider mb-3">Quick Discovery</p>
            <div className="flex flex-wrap gap-3 justify-center">
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
                  className="group relative px-5 py-2.5 text-[17px] font-semibold text-indigo-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200/50 hover:border-blue-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">{entity.emoji}</span>
                    {entity.name}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Results Count */}
          {results.length > 0 && (
            <div className="mt-3 text-lg text-indigo-700">
              Found <span className="font-bold text-blue-600 text-xl">{results.length}</span> matches
            </div>
          )}
        </div>
        
        {/* Results with beautiful styling */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
          {results.length === 0 && searchTerm.length >= 2 && !isSearching && (
            <div className="text-center py-12">
              <p className="text-indigo-600 text-[19px]">No matches found for</p>
              <p className="text-indigo-900 font-semibold text-xl mt-1">"{searchTerm}"</p>
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
                  : 'border-indigo-200 hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                }
              `}
            >
              {/* Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base font-bold rounded-full shadow-md">
                    Page {result.pageNumber}
                  </div>
                  <span className="text-base font-medium text-indigo-600">
                    {result.chapterTitle}
                  </span>
                </div>
                <div className="p-1.5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <ChevronRight className="text-blue-600" size={20} />
                </div>
              </div>
              
              {/* Context with Highlighted Match */}
              <div className="pl-1">
                <div className="text-[18px] leading-relaxed">
                  {highlightMatch(result.context, result.matchStart, result.matchEnd)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
      </div>

      {/* Discovery Card Modal */}
      {showDiscoveryCard && (
        <DiscoveryCard
          selectedText={getDiscoveryTerm(searchTerm)}
          userContext=""
          onClose={() => setShowDiscoveryCard(false)}
        />
      )}
    </>
  );
};

export default BookSearch;