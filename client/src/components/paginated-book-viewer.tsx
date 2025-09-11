import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Search, Home } from 'lucide-react';
import { Link } from 'wouter';
import TextSelectionModal from './text-selection-modal';
import BookSearch from './book-search';
import VideoModal from './video-modal';
import { findBookTitles } from '../data/book-titles-fuzzy';
import { findAuthors } from '../data/author-recognition';
import '../styles/literary-highlighting.css';
import '../styles/entity-spacing-fix.css';
import '../styles/book-search.css';
import '../styles/entity-highlighting.css';
import '../styles/author-highlighting.css';
import '../styles/video-link.css';

interface BookPage {
  pageNumber: number;
  content: string;
  chapter: string;
  chapterTitle: string;
  wordCount: number;
}

interface PaginatedBookViewerProps {
  transcriptId: string;
}

// Book structure with actual page numbers and ranges
const BOOK_STRUCTURE = [
  { 
    title: "Foreword", 
    startPage: -1, // XI in roman numerals
    endPage: -1,
    romanNumeral: "XI"
  },
  { 
    title: "Monday's Children", 
    startPage: 1, 
    endPage: 32 
  },
  { 
    title: "Just Kids", 
    startPage: 33, 
    endPage: 88 
  },
  { 
    title: "Hotel Chelsea", 
    startPage: 89, 
    endPage: 210 
  },
  { 
    title: "Separate Ways Together", 
    startPage: 211, 
    endPage: 260 
  },
  { 
    title: "Holding Hands with God", 
    startPage: 261, 
    endPage: 284 
  },
  { 
    title: "A Note to the Reader", 
    startPage: 285, 
    endPage: 300 // Approximate end
  }
];

const WORDS_PER_PAGE = 250; // Slightly fewer words per page for larger font

export const PaginatedBookViewer: React.FC<PaginatedBookViewerProps> = ({ transcriptId }) => {
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [jumpToPage, setJumpToPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ 
    name: string; 
    type: string; 
    mentions: Array<{ page: number; chapter: string; context: string }>;
    culturalContext?: any;
  } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedSearchTerm, setHighlightedSearchTerm] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Apply dual highlighting: entity (yellow) and context (light blue)
  const applyDualHighlighting = useCallback((searchTerm: string, context?: string, pageText?: string) => {
    console.log('🎨 applyDualHighlighting called:', { searchTerm, context: context?.substring(0, 50) });
    
    if (!contentRef.current) {
      console.log('❌ No contentRef.current');
      return;
    }
    
    // Check URL parameters to determine if we arrived from search
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch = urlParams.get('fromSearch') === 'true';
    
    console.log('📍 URL check:', { fromSearch, url: window.location.search });
    
    // ONLY apply context highlighting if we arrived from search
    // Regular page navigation should not trigger this
    if (!fromSearch) {
      console.log('⏭️ Not from search, skipping context highlighting');
      // Just scroll to search term if it exists, no context highlighting
      const firstHighlight = document.querySelector('.search-highlight');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
      return;
    }
    
    // Get page content - use the provided pageText or the current page content
    let pageContent = pageText || '';
    
    // If no pageText provided, get it from the current page data
    if (!pageContent && pages[currentPageIndex]) {
      pageContent = pages[currentPageIndex].content;
    }
    
    // Fallback to DOM if still no content (shouldn't happen)
    if (!pageContent && contentRef.current) {
      // Get original text without HTML tags by looking at original paragraphs
      const paragraphs = contentRef.current.querySelectorAll('p');
      const textParts: string[] = [];
      paragraphs.forEach(p => {
        // Try to get text without HTML entities
        const clone = p.cloneNode(true) as HTMLElement;
        // Remove all span elements to get clean text
        clone.querySelectorAll('span').forEach(span => {
          span.replaceWith(span.textContent || '');
        });
        textParts.push(clone.textContent || '');
      });
      pageContent = textParts.join(' ');
    }
    
    console.log('📖 Page content sample:', pageContent.substring(0, 100));
    
    // First, find and highlight the context if provided (only when from search)
    if (context && fromSearch && searchTerm) {
      console.log('✅ Applying context highlighting for search term:', searchTerm);
      
      // Normalize both context and page content for matching
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .replace(/['']/g, "'")
          .replace(/[""]/g, '"')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const normalizedSearchTerm = normalizeText(searchTerm);
      const normalizedContext = normalizeText(context);
      const normalizedPageContent = normalizeText(pageContent);
      
      console.log('🔎 Search term:', normalizedSearchTerm);
      console.log('📝 Context preview:', normalizedContext.substring(0, 100));
      console.log('📄 Page content length:', normalizedPageContent.length);
      
      // Find the paragraph that contains the search term
      // This is more reliable than trying to match the entire context
      const paragraphs = contentRef.current.querySelectorAll('p');
      let foundParagraph = null;
      let searchTermFoundInContext = false;
      
      // First, verify the search term is actually in the provided context
      if (normalizedContext.includes(normalizedSearchTerm)) {
        searchTermFoundInContext = true;
        console.log('✅ Search term found in context');
      } else {
        console.log('⚠️ Search term NOT found in provided context - context may be incorrect');
      }
      
      // Search each paragraph for the one that best matches our search
      let bestMatch = null;
      let bestScore = 0;
      
      for (const p of paragraphs) {
        const pText = normalizeText(p.textContent || '');
        let score = 0;
        
        // Highest priority: paragraph contains the exact search term
        if (pText.includes(normalizedSearchTerm)) {
          score += 100;
          console.log('📍 Paragraph contains search term:', normalizedSearchTerm);
        }
        
        // Second priority: paragraph contains significant portion of context
        if (normalizedContext.length > 20) {
          // Check how much of the context is in this paragraph
          const contextWords = normalizedContext.split(' ');
          let matchedWords = 0;
          
          for (const word of contextWords) {
            if (word.length > 2 && pText.includes(word)) {
              matchedWords++;
            }
          }
          
          // Calculate percentage of context words found
          const contextMatchPercentage = (matchedWords / contextWords.length) * 100;
          score += contextMatchPercentage;
          
          if (contextMatchPercentage > 50) {
            console.log(`📊 Paragraph matches ${contextMatchPercentage.toFixed(0)}% of context words`);
          }
        }
        
        // Track the best matching paragraph
        if (score > bestScore) {
          bestScore = score;
          bestMatch = p;
          console.log(`🎯 New best match with score: ${score}`);
        }
      }
      
      foundParagraph = bestMatch;
      if (foundParagraph) {
        console.log(`✅ Selected best paragraph with score: ${bestScore}`);
      }
      
      if (foundParagraph) {
        console.log('✅ Found context paragraph, applying highlight');
        // Apply context highlighting to the paragraph
        foundParagraph.classList.add('search-context-highlight');
        foundParagraph.classList.add('search-context-highlight-enter');
        
        // Now find and enhance the search term within the context
        setTimeout(() => {
          const searchHighlights = document.querySelectorAll('.search-highlight');
          if (searchHighlights.length > 0) {
            // Find the highlight within or near the context
            const firstHighlight = searchHighlights[0];
            firstHighlight.classList.add('search-highlight-pulse');
            firstHighlight.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest' 
            });
            
            setTimeout(() => {
              firstHighlight.classList.remove('search-highlight-pulse');
            }, 2000);
          }
        }, 100);
      } else {
        console.log('❌ Could not find context paragraph');
      }
    } else if (searchTerm) {
      // Fallback: If we can't find the context, just highlight around the search term
      console.log('🔄 Fallback: Highlighting around search term');
      const searchHighlights = document.querySelectorAll('.search-highlight');
      if (searchHighlights.length > 0) {
        const firstHighlight = searchHighlights[0];
        // Add context highlighting to the parent paragraph or container
        const parent = firstHighlight.closest('p') || firstHighlight.parentElement;
        if (parent) {
          parent.classList.add('search-context-highlight');
          parent.classList.add('search-context-highlight-enter');
          console.log('✅ Applied context highlight to parent element');
        }
        
        firstHighlight.classList.add('search-highlight-pulse');
        firstHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
        
        setTimeout(() => {
          firstHighlight.classList.remove('search-highlight-pulse');
        }, 2000);
      }
    }
  }, [highlightedSearchTerm, pages, currentPageIndex]);

  // Handle URL parameters and context highlighting after page changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch = urlParams.get('fromSearch') === 'true';
    const searchTerm = urlParams.get('searchTerm');
    const context = urlParams.get('context');
    
    console.log('🔄 URL param check effect:', { 
      fromSearch, 
      searchTerm,  // This should be the full search term
      searchTermLength: searchTerm?.length,
      hasContext: !!context, 
      hasPage: !!pages[currentPageIndex] 
    });
    
    // Only apply highlighting if we came from search and have a search term
    if (fromSearch && searchTerm && pages[currentPageIndex]) {
      console.log('📌 Applying highlighting from URL params');
      // Set the search term for highlighting
      setHighlightedSearchTerm(searchTerm);
      
      // Apply dual highlighting with a small delay to ensure DOM is ready
      setTimeout(() => {
        console.log('⏰ Delayed call to applyDualHighlighting');
        // Pass the clean page content to avoid HTML tags in text
        const currentPageContent = pages[currentPageIndex]?.content || '';
        applyDualHighlighting(searchTerm, context || undefined, currentPageContent);
        
        // Clear URL parameters after applying highlighting to prevent re-application
        setTimeout(() => {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          console.log('🧹 Cleared URL parameters after highlighting');
        }, 1000);
      }, 500);
    } else if (!fromSearch) {
      // Clear any existing context highlighting when not from search
      const contextHighlights = document.querySelectorAll('.search-context-highlight');
      contextHighlights.forEach(el => {
        el.classList.remove('search-context-highlight');
        el.classList.remove('search-context-highlight-enter');
      });
    }
  }, [currentPageIndex, pages, applyDualHighlighting]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
      // Left arrow for previous page
      if (e.key === 'ArrowLeft' && currentPageIndex > 0) {
        e.preventDefault();
        setCurrentPageIndex(prev => prev - 1);
        window.scrollTo(0, 0);
      }
      // Right arrow for next page
      if (e.key === 'ArrowRight' && currentPageIndex < pages.length - 1) {
        e.preventDefault();
        setCurrentPageIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, currentPageIndex, pages.length]);

  // Handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      // Only show modal for meaningful selections (10+ characters)
      if (text.length >= 10 && contentRef.current?.contains(selection?.anchorNode as Node)) {
        setSelectedText(text);
        setShowSelectionModal(true);
        // Clear the selection after capturing it
        selection?.removeAllRanges();
      }
    };

    // Add event listeners for text selection
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 100);
    };

    // Add event listener to the document
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Close selection modal
  const handleCloseSelectionModal = useCallback(() => {
    setShowSelectionModal(false);
    setSelectedText('');
  }, []);

  // Load transcript
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/transcripts/${transcriptId}/transcript.txt`);
        if (!response.ok) throw new Error('Failed to load transcript');
        const text = await response.text();
        setFullTranscript(text);
        
        // Split into pages
        const bookPages = splitIntoPages(text);
        setPages(bookPages);
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [transcriptId]);

  // Split transcript into pages
  const splitIntoPages = useCallback((text: string): BookPage[] => {
    // Format text with paragraph breaks
    const formatTextWithParagraphs = (rawText: string): string => {
      // First, preserve any existing line breaks
      if (rawText.includes('\n\n')) {
        return rawText; // Already formatted with paragraphs
      }
      
      // Split into sentences more carefully
      const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
      
      const paragraphs: string[] = [];
      let currentParagraph: string[] = [];
      let wordCount = 0;
      
      sentences.forEach((sentence, index) => {
        const trimmedSentence = sentence.trim();
        const sentenceWords = trimmedSentence.split(/\s+/).length;
        
        currentParagraph.push(trimmedSentence);
        wordCount += sentenceWords;
        
        // Determine if we should start a new paragraph
        const hasDialogue = trimmedSentence.includes('"');
        const nextHasDialogue = sentences[index + 1]?.includes('"');
        const isLongParagraph = wordCount > 60; // About 3-4 sentences worth
        const endsWithExclamation = trimmedSentence.endsWith('!');
        const endsWithQuestion = trimmedSentence.endsWith('?');
        
        // Natural paragraph break points:
        // 1. After 60+ words (about 3-4 sentences)
        // 2. Before or after dialogue shifts
        // 3. After emphatic statements (! or ?)
        // 4. When topic seems to shift (next sentence starts with time/place indicators)
        const nextStartsNewTopic = sentences[index + 1] && 
          /^(When |Where |After |Before |Later |Then |Now |In |At |On |During |That |The next |One |It was |There |I was |He was |She was )/i.test(sentences[index + 1].trim());
        
        const shouldBreak = isLongParagraph || 
                          (hasDialogue && !nextHasDialogue) || 
                          (!hasDialogue && nextHasDialogue) ||
                          (endsWithExclamation && !hasDialogue) ||
                          (endsWithQuestion && !hasDialogue) ||
                          nextStartsNewTopic;
        
        if (shouldBreak && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
          wordCount = 0;
        }
      });
      
      // Add any remaining sentences
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
      }
      
      // Filter out empty paragraphs and join with double line breaks
      return paragraphs
        .filter(p => p.trim().length > 0)
        .join('\n\n');
    };
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    const bookPages: BookPage[] = [];
    
    // Calculate total pages needed
    const totalPages = Math.ceil(totalWords / WORDS_PER_PAGE);
    
    // Map words to book structure
    let wordIndex = 0;
    
    // Process Foreword (1 page)
    const forewordWords = Math.min(WORDS_PER_PAGE, totalWords - wordIndex);
    if (forewordWords > 0) {
      const forewordContent = words.slice(wordIndex, wordIndex + forewordWords).join(' ');
      bookPages.push({
        pageNumber: -1, // XI
        content: formatTextWithParagraphs(forewordContent),
        chapter: 'foreword',
        chapterTitle: 'Foreword',
        wordCount: forewordWords
      });
      wordIndex += forewordWords;
    }
    
    // Process each chapter based on its page range
    for (const chapter of BOOK_STRUCTURE.slice(1)) { // Skip foreword as we handled it
      const chapterPages = chapter.endPage - chapter.startPage + 1;
      const wordsForChapter = chapterPages * WORDS_PER_PAGE;
      
      for (let page = chapter.startPage; page <= chapter.endPage && wordIndex < totalWords; page++) {
        const pageWords = Math.min(WORDS_PER_PAGE, totalWords - wordIndex);
        if (pageWords <= 0) break;
        
        const pageContent = words.slice(wordIndex, wordIndex + pageWords).join(' ');
        bookPages.push({
          pageNumber: page,
          content: formatTextWithParagraphs(pageContent),
          chapter: chapter.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          chapterTitle: chapter.title,
          wordCount: pageWords
        });
        wordIndex += pageWords;
      }
    }
    
    return bookPages;
  }, []);

  // Get current page
  const currentPage = useMemo(() => {
    return pages[currentPageIndex] || null;
  }, [pages, currentPageIndex]);

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex, pages.length]);

  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex]);

  const handlePageJump = useCallback(() => {
    const targetPage = jumpToPage.toLowerCase() === 'xi' ? -1 : parseInt(jumpToPage);
    
    if (isNaN(targetPage) && jumpToPage.toLowerCase() !== 'xi') {
      return;
    }
    
    const pageIndex = pages.findIndex(p => p.pageNumber === targetPage);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setJumpToPage('');
      window.scrollTo(0, 0);
    }
  }, [jumpToPage, pages]);
  

  const goToChapter = useCallback((chapterTitle: string) => {
    const pageIndex = pages.findIndex(p => p.chapterTitle === chapterTitle);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      window.scrollTo(0, 0);
    }
  }, [pages]);

  // Define discoverable entities with cultural context
  const ENTITY_CONTEXTS = {
    // Core People - Main Characters
    "Robert Mapplethorpe": {
      type: "artist",
      period: "NYC Photography & Art Scene (1960s-80s)",
      significance: "Revolutionary photographer who transformed art photography, explored sexuality and beauty. Patti's soulmate and artistic partner.",
      discoveryValue: "Explore the evolution from collage artist to master photographer, BDSM culture in art, and AIDS crisis.",
      relatedWorks: ["Self Portrait with Whip", "X Portfolio", "Calla Lily", "Black Males series", "Lady Lisa Lyon"],
      pages: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 112, 145, 178, 203, 234],
      aliases: ["Robert", "Mapplethorpe", "Robert Michael Mapplethorpe"]
    },
    "Sam Shepard": {
      type: "author",
      period: "American Theater & Film (1960s-2010s)",
      significance: "Playwright and actor who redefined American theater, Patti's later partner.",
      discoveryValue: "Explore Off-Broadway theater, experimental drama, and the American West in literature.",
      relatedWorks: ["Buried Child", "True West", "Days of Heaven"],
      pages: [189, 201, 212, 223, 234, 245]
    },
    
    // Musicians & Bands
    "Bob Dylan": {
      type: "musician",
      period: "Folk Revival & Electric Era (1960s-70s)",
      significance: "Revolutionary songwriter who transformed popular music with poetic lyrics. Nobel Prize in Literature 2016.",
      discoveryValue: "Explore the folk revival movement, protest music, and the controversial electric turn at Newport Folk Festival.",
      relatedWorks: ["Highway 61 Revisited", "Blonde on Blonde", "Like a Rolling Stone", "The Times They Are a-Changin'", "Tangled Up in Blue"],
      pages: [45, 67, 89, 112, 145, 178, 203, 234],
      aliases: ["Dylan", "Bobby Dylan"]
    },
    "Jimi Hendrix": {
      type: "musician",
      period: "Psychedelic Rock Era (1960s)",
      significance: "Guitar virtuoso who revolutionized electric guitar. Died at 27, member of the '27 Club'.",
      discoveryValue: "Explore psychedelic rock, Woodstock, and the transformation of guitar as lead instrument.",
      relatedWorks: ["Electric Ladyland", "Are You Experienced", "Purple Haze", "All Along the Watchtower", "Voodoo Child"],
      pages: [56, 78, 92, 134, 189, 212],
      aliases: ["Hendrix", "James Marshall Hendrix"]
    },
    "Janis Joplin": {
      type: "musician",
      period: "Blues Rock Era (1960s)",
      significance: "Powerful blues singer who broke gender barriers in rock. Died at 27.",
      discoveryValue: "Explore women in rock, blues revival, and the tragedy of the 27 Club.",
      relatedWorks: ["Piece of My Heart", "Me and Bobby McGee", "Pearl album", "Ball and Chain", "Cry Baby"],
      pages: [78, 89, 112, 134, 156],
      aliases: ["Janis"]
    },
    "The Rolling Stones": {
      type: "musician",
      period: "British Invasion (1960s-present)",
      significance: "Rock band that brought blues to mainstream rock, cultural icons of rebellion.",
      discoveryValue: "Explore British Invasion, blues rock, and counterculture movements.",
      relatedWorks: ["Exile on Main St.", "Let It Bleed", "Sympathy for the Devil", "Gimme Shelter", "Wild Horses"],
      pages: [67, 89, 112, 145],
      aliases: ["Rolling Stones", "The Stones"]
    },
    "John Lennon": {
      type: "musician",
      period: "Beatles & Solo Career (1960s-80)",
      significance: "Beatle who became peace activist and avant-garde artist. Murdered in 1980 outside Dakota building.",
      discoveryValue: "Explore The Beatles' breakup, Yoko Ono collaboration, bed-ins for peace, and primal scream therapy.",
      relatedWorks: ["Imagine", "Working Class Hero", "Double Fantasy", "Give Peace a Chance", "Instant Karma"],
      pages: [45, 67, 89, 112],
      aliases: ["Lennon"]
    },
    "Jim Morrison": {
      type: "musician",
      period: "The Doors Era (1960s-71)",
      significance: "Poet-shaman of rock who merged poetry with psychedelic rock. The Lizard King. Died at 27 in Paris.",
      discoveryValue: "Explore The Doors, UCLA film school, poetry and excess, Miami incident, Paris grave as pilgrimage site.",
      relatedWorks: ["Light My Fire", "The End", "Riders on the Storm", "Break On Through", "L.A. Woman"],
      pages: [89, 112, 134, 156],
      aliases: ["Morrison", "The Lizard King"]
    },
    "Lou Reed": {
      type: "musician",
      period: "Velvet Underground & Solo (1960s-2013)",
      significance: "Velvet Underground leader who brought street poetry and transgression to rock.",
      discoveryValue: "Explore Velvet Underground, Warhol's Factory, glam rock transformation.",
      relatedWorks: ["Walk on the Wild Side", "Heroin", "Transformer"],
      pages: [112, 134, 156, 178]
    },
    "John Coltrane": {
      type: "musician",
      period: "Jazz Revolution (1950s-60s)",
      significance: "Jazz saxophonist who pioneered spiritual jazz and free jazz movements. Spiritual seeker who transformed jazz into meditation.",
      discoveryValue: "Explore modal jazz, spiritual jazz, sheets of sound technique, and collaboration with Miles Davis.",
      relatedWorks: ["A Love Supreme", "Giant Steps", "My Favorite Things", "Naima", "Impressions"],
      pages: [78, 101, 134, 178],
      aliases: ["Coltrane"]
    },
    "James Brown": {
      type: "musician",
      period: "Soul & Funk Pioneer (1950s-2000s)",
      significance: "Godfather of Soul, pioneer of funk music, influential in hip-hop development.",
      discoveryValue: "Explore the birth of funk, soul music, and influence on hip-hop culture.",
      relatedWorks: ["Get Up (I Feel Like Being a) Sex Machine", "Papa's Got a Brand New Bag"],
      pages: [78, 112, 156]
    },
    "Tim Buckley": {
      type: "musician",
      period: "Folk & Experimental (1960s-70s)",
      significance: "Innovative vocalist who moved from folk to avant-garde. Father of Jeff Buckley.",
      discoveryValue: "Explore vocal experimentation, folk-jazz fusion, tragic early death.",
      relatedWorks: ["Song to the Siren", "Starsailor", "Happy Sad"],
      pages: [134, 156, 178]
    },
    
    // Visual Artists
    "Andy Warhol": {
      type: "artist",
      period: "Pop Art Movement (1960s-80s)",
      significance: "Pop art icon who blurred lines between commercial and fine art. Creator of The Factory. Shot by Valerie Solanas in 1968.",
      discoveryValue: "Explore Pop Art, celebrity culture, The Factory scene, Velvet Underground, Interview magazine, Screen Tests.",
      relatedWorks: ["Campbell's Soup Cans", "Marilyn Diptych", "Chelsea Girls film", "Elvis", "Electric Chair series"],
      pages: [67, 89, 102, 145, 167, 198, 224],
      aliases: ["Warhol"]
    },
    "Picasso": {
      type: "artist",
      period: "Modern Art Pioneer (1900s-1970s)",
      significance: "Co-founder of Cubism, most influential artist of 20th century.",
      discoveryValue: "Explore Cubism, Blue Period, and the revolution of modern art.",
      relatedWorks: ["Guernica", "Les Demoiselles d'Avignon", "The Old Guitarist"],
      pages: [34, 67, 123]
    },
    "Modigliani": {
      type: "artist",
      period: "École de Paris (1900s-1920)",
      significance: "Italian painter known for portraits with elongated faces, bohemian lifestyle in Paris.",
      discoveryValue: "Explore École de Paris, Montparnasse art scene, and expressionist portraiture.",
      relatedWorks: ["Reclining Nude", "Portrait of Jeanne Hébuterne"],
      pages: [45, 89]
    },
    "Frida Kahlo": {
      type: "artist",
      period: "Mexican Surrealism (1920s-50s)",
      significance: "Mexican artist who transformed pain into powerful self-portraits. Wife of Diego Rivera.",
      discoveryValue: "Explore Mexican identity, surrealism, feminist art, Casa Azul, indigenous culture.",
      relatedWorks: ["The Two Fridas", "Self-Portrait with Thorn Necklace", "The Broken Column", "What the Water Gave Me"],
      pages: [67, 89, 112],
      aliases: ["Frida"]
    },
    "Diego Rivera": {
      type: "artist",
      period: "Mexican Muralism (1920s-50s)",
      significance: "Mexican muralist who brought art to the people, husband of Frida Kahlo.",
      discoveryValue: "Explore Mexican muralism, communist politics in art.",
      relatedWorks: ["Detroit Industry Murals", "Man at the Crossroads"],
      pages: [67, 89]
    },
    "Salvador Dalí": {
      type: "artist",
      period: "Surrealism (1920s-80s)",
      significance: "Surrealist master known for melting clocks and eccentric personality. The mad genius with distinctive mustache.",
      discoveryValue: "Explore surrealism, paranoid-critical method, collaboration with Hitchcock, Gala as muse.",
      relatedWorks: ["The Persistence of Memory", "The Elephants", "Christ of Saint John of the Cross"],
      pages: [45, 67],
      aliases: ["Dalí"]
    },
    
    // Authors & Poets
    "Arthur Rimbaud": {
      type: "author",
      period: "Symbolist Poetry (1870s)",
      significance: "Teen prodigy poet who influenced surrealism and beat generation. The original enfant terrible of poetry. Stopped writing at 19.",
      discoveryValue: "Explore symbolist poetry, 'poet as seer', derangement of the senses, relationship with Verlaine, African adventures.",
      relatedWorks: ["Illuminations", "A Season in Hell", "The Drunken Boat", "Vowels", "The Sleeper in the Valley"],
      pages: [12, 34, 67, 89, 123, 156, 189, 234, 267],
      aliases: ["Rimbaud"]
    },
    "William Burroughs": {
      type: "author",
      period: "Beat Generation (1950s-90s)",
      significance: "Beat writer who pioneered cut-up technique. The gentleman junkie who wrote about control systems.",
      discoveryValue: "Explore Beat Generation, experimental writing, Tangier years, collaboration with Brion Gysin.",
      relatedWorks: ["Naked Lunch", "Junky", "The Soft Machine", "Cities of the Red Night", "The Wild Boys"],
      pages: [89, 112, 145, 178, 201],
      aliases: ["Burroughs", "William S. Burroughs"]
    },
    "Allen Ginsberg": {
      type: "author",
      period: "Beat Generation (1950s-90s)",
      significance: "Beat poet whose 'Howl' challenged censorship. Buddhist Jewish gay poet who made poetry political.",
      discoveryValue: "Explore Beat poetry, anti-war movement, LGBTQ rights, Naropa Institute, relationship with Peter Orlovsky.",
      relatedWorks: ["Howl", "Kaddish", "America", "Sunflower Sutra", "A Supermarket in California"],
      pages: [123, 145, 167, 189, 212],
      aliases: ["Ginsberg"]
    },
    "Jack Kerouac": {
      type: "author",
      period: "Beat Generation (1940s-60s)",
      significance: "Beat novelist who captured American wanderlust. King of the Beats who struggled with his legacy.",
      discoveryValue: "Explore spontaneous prose, Buddhism, road culture, French-Canadian roots, jazz influence on prose.",
      relatedWorks: ["On the Road", "The Dharma Bums", "Big Sur", "Mexico City Blues", "Visions of Gerard"],
      pages: [89, 112, 134],
      aliases: ["Kerouac"]
    },
    "Jean Genet": {
      type: "author",
      period: "French Literature (1940s-80s)",
      significance: "Thief turned writer who celebrated criminality and homosexuality. Saint Genet - patron saint of outsiders.",
      discoveryValue: "Explore prison literature, theatrical revolution, Black Panthers support, Palestinian activism.",
      relatedWorks: ["Our Lady of the Flowers", "The Thief's Journal", "The Balcony", "Querelle", "The Maids"],
      pages: [145, 167, 189],
      aliases: ["Genet"]
    },
    "Baudelaire": {
      type: "author",
      period: "French Symbolism (1850s-60s)",
      significance: "Poet of modernity who found beauty in decay and evil.",
      discoveryValue: "Explore Les Fleurs du mal, dandyism, art criticism.",
      relatedWorks: ["Les Fleurs du mal", "Paris Spleen", "The Painter of Modern Life"],
      pages: [34, 56, 78]
    },
    "William Blake": {
      type: "author",
      period: "Romantic Poetry & Art (1780s-1820s)",
      significance: "Visionary poet-artist who saw angels and created illuminated books. Prophet-poet who created entire mythologies.",
      discoveryValue: "Explore mystical Christianity, printmaking, influence on counterculture, Jerusalem, Albion.",
      relatedWorks: ["Songs of Innocence and Experience", "The Marriage of Heaven and Hell", "The Tyger", "London", "Jerusalem"],
      pages: [45, 67, 89],
      aliases: ["Blake"]
    },
    
    // Venues & Places
    "Chelsea Hotel": {
      type: "venue",
      period: "NYC Cultural Landmark (1884-present)",
      significance: "Legendary hotel housing artists, writers, musicians. Where Nancy Spungen died, Dylan Thomas drank, and Patti & Robert lived.",
      discoveryValue: "Explore NYC bohemian history, Room 100 (Patti and Robert's room), Harry Smith's archives.",
      relatedWorks: ["'Chelsea Girls' by Warhol", "'Chelsea Hotel' by Leonard Cohen", "'Sad Eyed Lady of the Lowlands' written there"],
      pages: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
      aliases: ["Hotel Chelsea", "The Chelsea"]
    },
    "Max's Kansas City": {
      type: "venue",
      period: "NYC Nightclub (1965-1981)",
      significance: "Warhol's hangout, birthplace of glam rock and punk. Mickey Ruskin's club where you paid in art.",
      discoveryValue: "Explore NYC underground scene, Velvet Underground, backroom politics, Debbie Harry waitressing.",
      relatedWorks: ["'Back rooms' where Warhol held court", "'Live at Max's Kansas City' albums"],
      pages: [112, 134, 156, 178, 201, 223],
      aliases: ["Max's"]
    },
    "CBGB": {
      type: "venue",
      period: "Punk Rock Birthplace (1973-2006)",
      significance: "Launched punk and new wave: Ramones, Blondie, Talking Heads, Patti Smith Group.",
      discoveryValue: "Explore the birth of punk rock and NYC's underground music revolution.",
      relatedWorks: ["'Horses' by Patti Smith", "debut performances"],
      pages: [178, 189, 201, 212, 223]
    },
    "The Factory": {
      type: "venue",
      period: "Warhol's Studios (1962-1984)",
      significance: "Warhol's studio where art, film, and music merged. Silver-foiled walls and amphetamine energy.",
      discoveryValue: "Explore Superstars, Screen Tests, Velvet Underground rehearsals.",
      relatedWorks: ["'Exploding Plastic Inevitable' multimedia shows"],
      pages: [134, 156, 178]
    },
    "Brooklyn": {
      type: "venue",
      period: "NYC Borough",
      significance: "Where Patti and Robert first lived together, beginning of their story.",
      discoveryValue: "Explore 1960s Brooklyn, pre-gentrification artist life.",
      relatedWorks: ["Hall Street loft where they first lived"],
      pages: [23, 34, 45, 56]
    },
    "Greenwich Village": {
      type: "venue",
      period: "NYC Neighborhood",
      significance: "Bohemian heart of NYC, folk music scene, gay liberation birthplace. Where beats became hippies.",
      discoveryValue: "Explore Washington Square Park, Cafe Wha?, Stonewall Inn, MacDougal Street, Bleecker Street venues.",
      relatedWorks: ["Folk City", "The Bitter End", "Gaslight Cafe", "The Bottom Line"],
      pages: [67, 89, 112, 134],
      aliases: ["The Village", "Village"]
    },
    "Coney Island": {
      type: "venue",
      period: "NYC Beach & Amusement",
      significance: "Working-class pleasure beach, site of Patti and Robert's early adventures.",
      discoveryValue: "Explore Nathan's Famous, Wonder Wheel, freak shows.",
      relatedWorks: ["Astroland", "Steeplechase Park ruins"],
      pages: [34, 56, 78]
    },
    "Museum of Modern Art": {
      type: "venue",
      period: "NYC Art Institution",
      significance: "MoMA - temple of modern art where Patti worked in the bookstore, meeting artists and intellectuals.",
      discoveryValue: "Explore Abstract Expressionism, Pop Art exhibitions, museum bookstores as cultural centers.",
      relatedWorks: ["The Museum of Modern Art collection", "Guernica", "'Starry Night' in collection"],
      pages: [123, 145, 167],
      aliases: ["MoMA", "The Museum of Modern Art"]
    }
  };
  
  // Create flat list for highlighting with aliases
  const DISCOVERABLE_ENTITIES = Object.keys(ENTITY_CONTEXTS).map(name => ({
    name,
    type: ENTITY_CONTEXTS[name].type,
    totalMentions: ENTITY_CONTEXTS[name].pages.length,
    pages: ENTITY_CONTEXTS[name].pages,
    aliases: ENTITY_CONTEXTS[name].aliases || []
  }));

  // Highlight entities in page content (including literary works)
  const highlightEntitiesInText = useCallback((text: string): string => {
    // First, normalize multiple spaces to single spaces to prevent spacing issues
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // Track positions that have already been highlighted to avoid overlaps
    const replacements: Array<{start: number, end: number, entity: any, match: string, isSearchTerm?: boolean, type?: string}> = [];
    
    // Define important entities to highlight
    const importantEntities = [
      {
        name: 'Robert Mapplethorpe',
        aliases: ['Robert Mapplethorpe', 'Mapplethorpe', 'Robert', 'Bobby'],
        type: 'person'
      },
      {
        name: 'Hotel Chelsea',
        aliases: ['Hotel Chelsea', 'Chelsea Hotel', 'the Chelsea'],
        type: 'place'
      }
    ];
    
    // SPECIAL TEST: Add John Coltrane video reference
    const coltranePattern = /John Coltrane, the man who gave us A Love Supreme/gi;
    let coltraneMatch;
    while ((coltraneMatch = coltranePattern.exec(normalizedText)) !== null) {
      replacements.push({
        start: coltraneMatch.index,
        end: coltraneMatch.index + coltraneMatch[0].length,
        entity: { name: 'John Coltrane - A Love Supreme', type: 'music-video' },
        match: coltraneMatch[0],
        type: 'music-video'
      });
    }
    
    // Collect matches for important entities (Robert Mapplethorpe, Hotel Chelsea, etc.)
    const entityMatches: Array<{start: number, end: number, entity: any, match: string, type: string}> = [];
    
    importantEntities.forEach(entity => {
      entity.aliases.forEach(alias => {
        // Special handling for "Robert" - only highlight if it's likely referring to Mapplethorpe
        if (alias === 'Robert') {
          // Only highlight "Robert" if it appears alone or in specific contexts
          const robertRegex = /\bRobert\b(?!\s+(Louis\s+)?Stevenson|\s+Frost|\s+Burns|\s+Lowell)/gi;
          let robertMatch;
          while ((robertMatch = robertRegex.exec(normalizedText)) !== null) {
            entityMatches.push({
              start: robertMatch.index,
              end: robertMatch.index + robertMatch[0].length,
              entity: { name: entity.name, type: entity.type },
              match: robertMatch[0],
              type: entity.type
            });
          }
        } else {
          const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          let aliasMatch;
          while ((aliasMatch = aliasRegex.exec(normalizedText)) !== null) {
            entityMatches.push({
              start: aliasMatch.index,
              end: aliasMatch.index + aliasMatch[0].length,
              entity: { name: entity.name, type: entity.type },
              match: aliasMatch[0],
              type: entity.type
            });
          }
        }
      });
    });
    
    // Sort entity matches by length (longest first) to prefer complete names
    entityMatches.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    
    // Add non-overlapping entity matches to replacements
    entityMatches.forEach(em => {
      const overlaps = replacements.some(r => 
        (em.start >= r.start && em.start < r.end) || 
        (em.end > r.start && em.end <= r.end) ||
        (em.start <= r.start && em.end >= r.end)
      );
      
      if (!overlaps) {
        replacements.push(em);
      }
    });
    
    // Use fuzzy matching to find all book titles in the text
    const bookMatches = findBookTitles(normalizedText);
    
    // Convert book matches to our replacement format
    const literaryMatches: Array<{start: number, end: number, entity: any, match: string, type: string}> = [];
    
    bookMatches.forEach(bookMatch => {
      literaryMatches.push({
        start: bookMatch.startIndex,
        end: bookMatch.endIndex,
        entity: { 
          title: bookMatch.title,
          author: bookMatch.author,
          bookId: bookMatch.bookId
        },
        match: bookMatch.matchedText,
        type: 'literary'
      });
    });
    
    // Use comprehensive author recognition
    const authorMatches = findAuthors(normalizedText);
    
    authorMatches.forEach(authorMatch => {
      literaryMatches.push({
        start: authorMatch.startIndex,
        end: authorMatch.endIndex,
        entity: { 
          name: authorMatch.fullName,
          authorId: authorMatch.authorId
        },
        match: authorMatch.matchedText,
        type: 'author'
      });
    });
    
    // Sort literary matches by length (longest first) to prefer complete titles
    literaryMatches.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    
    // Add non-overlapping literary matches to replacements
    literaryMatches.forEach(lm => {
      const overlaps = replacements.some(r => 
        (lm.start >= r.start && lm.start < r.end) || 
        (lm.end > r.start && lm.end <= r.end) ||
        (lm.start <= r.start && lm.end >= r.end)
      );
      
      if (!overlaps) {
        replacements.push(lm);
      }
    });
    
    // Then, highlight search terms if present
    if (highlightedSearchTerm && highlightedSearchTerm.length >= 2) {
      const escapedSearchTerm = highlightedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      
      let match;
      while ((match = searchRegex.exec(normalizedText)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        
        replacements.push({
          start,
          end,
          entity: null,
          match: match[0],
          isSearchTerm: true
        });
      }
    }
    
    DISCOVERABLE_ENTITIES.forEach(entity => {
      // Create list of all names to match (main name + aliases)
      const namesToMatch = [entity.name, ...(entity.aliases || [])];
      
      namesToMatch.forEach(nameToMatch => {
        // Create regex to match entity name (case insensitive, whole words)
        const escapedName = nameToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b(${escapedName})\\b`, 'gi');
        
        let match;
        while ((match = regex.exec(normalizedText)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          
          // Check if this position overlaps with any existing replacement
          const hasOverlap = replacements.some(r => 
            (start >= r.start && start < r.end) || 
            (end > r.start && end <= r.end) ||
            (start <= r.start && end >= r.end)
          );
          
          if (!hasOverlap) {
            replacements.push({
              start,
              end,
              entity,
              match: match[0]
            });
          }
        }
      });
    });
    
    // Remove overlapping matches, keeping longer ones
    const filteredReplacements = replacements.filter((r, index) => {
      // Check if this replacement is overlapped by a longer one
      for (let i = 0; i < replacements.length; i++) {
        if (i === index) continue;
        const other = replacements[i];
        // If another match is longer and overlaps, skip this one
        if (other.match.length > r.match.length) {
          if ((r.start >= other.start && r.start < other.end) || 
              (r.end > other.start && r.end <= other.end)) {
            return false;
          }
        }
      }
      return true;
    });
    
    // Sort by position (forward order to build result correctly)
    filteredReplacements.sort((a, b) => a.start - b.start);
    
    // Apply replacements by building a new string
    let result = '';
    let lastEnd = 0;
    
    filteredReplacements.forEach(r => {
      // Add the text before this replacement
      result += normalizedText.slice(lastEnd, r.start);
      
      // Add the replacement
      let replacement;
      if (r.isSearchTerm) {
        // Highlight search terms with a different style
        replacement = `<span class="search-highlight" style="background-color: #fef3c7; font-weight: 600; padding: 2px 0; border-radius: 3px; box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);">${r.match}</span>`;
      } else if (r.type === 'literary') {
        // Highlight literary works with purple/violet theme - make them clickable like other entities
        const work = r.entity;
        // Use consistent entity-literary class for all books
        replacement = `<span class="entity-highlight entity-literary literary-highlight" data-entity="${work.title}" data-author="${work.author}" data-type="literary" data-bookid="${work.bookId || ''}">${r.match}</span>`;
      } else if (r.type === 'author') {
        // Highlight authors with orange theme when near their books
        const authorEntity = r.entity;
        replacement = `<span class="entity-highlight entity-author author-highlight" data-entity="${authorEntity.name || authorEntity.author}" data-type="author" data-relatedbook="${authorEntity.relatedBook || ''}">${r.match}</span>`;
      } else if (r.type === 'music-video') {
        // Subtle highlighting for music/video references - just bold purple text
        replacement = `<span class="entity-highlight entity-music-video" data-entity="${r.entity.name}" data-type="music-video" style="color: #581C87; font-weight: 600; cursor: pointer; position: relative;" title="🎵 Video">${r.match}</span>`;
      } else if (r.type === 'person' || r.type === 'place') {
        // Highlight persons and places with appropriate styles
        const entityClass = r.type === 'person' ? 'entity-person' : 'entity-place';
        replacement = `<span class="entity-highlight ${entityClass}" data-entity="${r.entity.name}" data-type="${r.type}">${r.match}</span>`;
      } else {
        // Highlight other entities as before
        replacement = `<span class="entity-highlight entity-${r.entity.type}" data-entity="${r.entity.name}" data-type="${r.entity.type}" data-mentions="${r.entity.totalMentions || ''}">${r.match}</span>`;
      }
      
      result += replacement;
      lastEnd = r.end;
    });
    
    // Add any remaining text after the last replacement
    result += normalizedText.slice(lastEnd);
    
    return result;
  }, [highlightedSearchTerm]);

  // Get chapter for a given page
  const getChapterForPage = (pageNumber: number): string => {
    for (const chapter of BOOK_STRUCTURE) {
      if (pageNumber >= chapter.startPage && pageNumber <= chapter.endPage) {
        return chapter.title;
      }
    }
    return 'Unknown';
  };

  // Show entity occurrences using Search & Discover modal
  const showEntityOccurrences = useCallback((entityName: string) => {
    // Handle potential entity name mapping
    // For example, if "Chelsea Hotel" is stored in ENTITY_CONTEXTS but the display/search should be "Hotel Chelsea"
    let searchTerm = entityName;
    
    // Special handling for Hotel Chelsea (entity stored as "Chelsea Hotel" but should search as "Hotel Chelsea")
    if (entityName === "Chelsea Hotel") {
      searchTerm = "Hotel Chelsea";
    }
    
    // Open Search & Discover modal with the entity name pre-populated
    setInitialSearchTerm(searchTerm);
    setShowSearch(true);
    // Clear the old selectedEntity state to prevent the old modal from showing
    setSelectedEntity(null);
  }, []);

  // Navigate to specific page from entity mentions
  const navigateToEntityMention = useCallback((pageNumber: number) => {
    const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setSelectedEntity(null);
      window.scrollTo(0, 0);
    }
  }, [pages]);

  // Handle search navigation with context highlighting using URL parameters
  const handleSearchNavigate = useCallback((pageIndex: number, searchTerm?: string, context?: string) => {
    console.log('🔍 handleSearchNavigate called:', { pageIndex, searchTerm, hasContext: !!context });
    
    // Set URL parameters to trigger context highlighting after page loads
    if (searchTerm && context) {
      // Ensure the full search term is properly encoded
      const params = new URLSearchParams();
      params.set('fromSearch', 'true');
      params.set('searchTerm', searchTerm); // Full search term, properly encoded
      params.set('context', context.substring(0, 200)); // Limit context length for URL
      
      console.log('📝 Setting URL params with search term:', searchTerm);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
    
    // Navigate to the page
    setCurrentPageIndex(pageIndex);
    
    // Don't set search term here - let the URL parameter effect handle it
    // This ensures proper timing with page render
    if (searchTerm) {
      // Don't call applyDualHighlighting here - let the useEffect handle it
      // based on URL parameters to avoid duplicate calls
      console.log('📝 Search navigation triggered, URL params set');
    }
  }, [pages]);

  if (isLoading) {
    return (
      <div className="paginated-book-viewer loading">
        <div className="loading-spinner">Loading book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paginated-book-viewer error">
        <p>Error loading book: {error}</p>
      </div>
    );
  }

  const displayPageNumber = currentPage?.pageNumber === -1 ? 'XI' : currentPage?.pageNumber;
  const totalPages = pages.length;
  
  // Check if current page is a chapter start
  const isChapterStart = (pageNumber: number | undefined): boolean => {
    if (!pageNumber) return false;
    const chapterStartPages = [-1, 1, 33, 89, 211, 261, 285]; // Including foreword
    return chapterStartPages.includes(pageNumber);
  };

  return (
    <div className="paginated-book-viewer">
      <style>{`
        /* Base responsive design */
        .paginated-book-viewer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          position: relative;
          font-size: 16px;
        }
        
        @media (max-width: 1200px) {
          .paginated-book-viewer {
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .paginated-book-viewer {
            padding: 1rem;
          }
        }

        .book-header {
          position: sticky;
          top: 0;
          background: white;
          z-index: 50;
          padding: 1rem 0 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .book-navigation {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }
        
        .book-navigation .page-controls {
          flex: 0 0 auto;
        }
        
        .book-navigation .page-jump {
          margin-left: auto;
          margin-right: 15%;
        }

        .page-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.94rem 1.56rem;
          background: #1e3a8a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 55px;
        }

        .nav-button:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 22.5px;
          font-weight: 600;
          color: #111827;
          padding: 0.75rem 1.25rem;
          background: #f3f4f6;
          border-radius: 6px;
          min-width: 175px;
          text-align: center;
        }

        .page-jump {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-jump input {
          width: 112px;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
          min-height: 50px;
        }
        
        .page-jump input::placeholder {
          color: #64748b;
          font-weight: 600;
        }

        .page-jump input:focus {
          outline: none;
          border-color: #1e3a8a;
        }

        .jump-btn {
          padding: 0.75rem 1.25rem;
          background: #60a5fa;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 50px;
        }

        .jump-btn:hover {
          background: #3b82f6;
        }

        .chapter-context {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          border: 1px solid #fbbf24;
          font-size: 22.5px;
          margin-top: 1rem;
        }

        .chapter-context strong {
          color: #7c2d12;
          font-weight: 700;
        }
        
        /* Entity highlighting styles */
        .entity-highlight {
          cursor: pointer;
          padding: 0.15rem 0.3rem;
          border-radius: 4px;
          transition: all 0.2s ease;
          position: relative;
          font-weight: 500;
          display: inline-block;
          margin: 0 0.1rem;
        }
        
        /* Musicians - Blue theme */
        .entity-musician {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
          color: #1e40af;
          border-bottom: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
        
        .entity-musician:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
        }
        
        /* Artists - Green theme */
        .entity-artist {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%);
          color: #047857;
          border-bottom: 2px solid #10b981;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
        }
        
        .entity-artist:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
        }
        
        /* Authors - Orange theme */
        .entity-author {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%);
          color: #92400e;
          border-bottom: 2px solid #f59e0b;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
        }
        
        .entity-author:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.25);
        }
        
        /* Venues - Red theme */
        .entity-venue {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
          color: #991b1b;
          border-bottom: 2px solid #ef4444;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
        }
        
        .entity-venue:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(220, 38, 38, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
        }
        
        /* Add a subtle glow animation on hover */
        @keyframes entityGlow {
          0% { box-shadow: 0 2px 4px rgba(var(--color-rgb), 0.2); }
          50% { box-shadow: 0 4px 12px rgba(var(--color-rgb), 0.4); }
          100% { box-shadow: 0 2px 4px rgba(var(--color-rgb), 0.2); }
        }
        
        /* Entity hover tooltip removed - clicking entities opens Search & Discover modal instead
        .entity-highlight:hover::after {
          content: attr(data-entity);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeIn 0.2s forwards;
          pointer-events: none;
        }
        */
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        
        /* Entity occurrences popup */
        .entity-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 600px;
          width: 90%;
          max-height: 70vh;
          overflow: hidden;
          z-index: 1000;
        }
        
        .entity-popup-header {
          padding: 1.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
        }
        
        .entity-popup-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        
        .entity-popup-meta {
          font-size: 1.05rem;
          opacity: 0.95;
        }
        
        .entity-popup-content {
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .entity-mention {
          padding: 1.2rem;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 10px;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .entity-mention:hover {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          transform: translateX(6px);
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }
        
        .entity-mention-page {
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 0.4rem;
          font-size: 1.1rem;
        }
        
        .entity-mention-chapter {
          color: #6b7280;
          font-size: 0.95rem;
        }
        
        .entity-popup-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.2s;
        }
        
        .entity-popup-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .entity-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .page-content {
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          min-height: 500px;
          font-size: 22px !important;
          line-height: 1.6;
          color: #1a1a1a;
          user-select: text;
          cursor: text;
          font-family: Georgia, 'Times New Roman', serif;
          max-width: 1020px;
          margin: 0 auto;
        }
        
        @media (max-width: 1200px) {
          .page-content {
            padding: 2rem 2.5rem;
            font-size: 21px !important;
          }
        }
        
        @media (max-width: 768px) {
          .page-content {
            padding: 1.5rem;
            font-size: 20px !important;
            max-width: 100%;
          }
        }
        
        .page-content ::selection {
          background-color: #6366f1;
          color: white;
        }
        
        .page-content ::-moz-selection {
          background-color: #6366f1;
          color: white;
        }

        .page-content p {
          margin-bottom: 1.4rem;
          text-align: left;
          text-indent: 2em;
          color: #1a1a1a;
          font-size: 22px !important;
          line-height: 1.6 !important;
        }
        
        .page-content p:first-of-type {
          text-indent: 0;
        }
        
        /* Only show drop cap on chapter start pages */
        .page-content.chapter-start p:first-of-type::first-letter {
          font-size: 3.6rem;
          font-weight: 700;
          float: left;
          line-height: 1;
          margin: 0.1rem 0.3rem 0 0;
          color: #1e3a8a;
          font-family: Georgia, serif;
        }

        .chapter-sidebar {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #cbd5e1;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          width: 280px;
          max-width: 280px;
        }

        .chapter-sidebar h3 {
          font-size: 1.3rem !important;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-bottom: 0.8rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .chapter-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .chapter-list li {
          margin-bottom: 0.8rem;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .chapter-link {
          display: block;
          padding: 1rem 1.4rem;
          background: rgba(248, 250, 252, 0.5);
          border: 2px solid transparent;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1.15rem !important;
          color: #334155;
          width: 100%;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .chapter-link:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          transform: translateX(8px);
          border-color: #2563eb;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }
        
        .chapter-link:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
          animation: pulse 0.5s ease-out;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .chapter-link.active {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
          color: white !important;
          font-weight: 600;
          border-color: #1d4ed8;
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
        }
        
        .chapter-link.active::after {
          content: '◀';
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          opacity: 0.8;
        }

        .page-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 3rem;
        }
        
        .page-footer .word-count {
          flex: 0 0 auto;
        }
        
        .page-footer .page-controls {
          margin-left: auto;
          margin-right: 15%;
        }

        .word-count {
          font-size: 1rem;
          color: #4b5563;
          font-style: italic;
        }
        

        @media (max-width: 1400px) {
          .chapter-sidebar {
            width: 240px;
            max-width: 240px;
            padding: 1.5rem;
          }
          
          .chapter-link {
            padding: 0.9rem 1.2rem;
            font-size: 1.05rem !important;
          }
        }
        
        @media (max-width: 1200px) {
          .chapter-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .book-navigation {
            flex-direction: column;
            gap: 1rem;
          }

          .page-controls {
            width: 100%;
            justify-content: space-between;
          }

          .page-jump {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }

          .page-jump input {
            flex: 1;
          }

          .page-content {
            padding: 2rem 1.5rem;
            line-height: 1.65;
          }
          
          .page-content p {
            text-indent: 1.5rem;
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* Return to Media Hub Button - positioned above chapters */}
      <Link href="/">
        <button style={{
          position: 'fixed',
          top: '50px',
          left: '35px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1.125rem',
          fontWeight: '500',
          backgroundColor: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#6d28d9';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#7c3aed';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}>
          <Home size={20} />
          <span>Return to Media Hub</span>
        </button>
      </Link>

      {/* Chapter Sidebar */}
      <div className="chapter-sidebar">
        <h3><BookOpen size={16} /> Chapters</h3>
        <ul className="chapter-list">
          {BOOK_STRUCTURE.map(chapter => (
            <li key={chapter.title}>
              <button
                className={`chapter-link ${currentPage?.chapterTitle === chapter.title ? 'active' : ''}`}
                onClick={() => goToChapter(chapter.title)}
              >
                {chapter.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Entity Occurrences Popup - Deprecated: Now using Search & Discover modal */}
      {/* Keeping this commented in case we need to reference the old implementation
      {selectedEntity && (
        <>
          <div className="entity-popup-overlay" onClick={() => setSelectedEntity(null)} />
          <div className="entity-popup">
            <div className="entity-popup-header">
              <button className="entity-popup-close" onClick={() => setSelectedEntity(null)}>×</button>
              <div className="entity-popup-title">{selectedEntity.name}</div>
              <div className="entity-popup-meta">
                {selectedEntity.culturalContext?.period || selectedEntity.type}
              </div>
            </div>
            <div className="entity-popup-content">
              {selectedEntity.culturalContext && (
                <div className="cultural-context">
                  <p className="significance">{selectedEntity.culturalContext.significance}</p>
                  <p className="discovery-value">🔍 {selectedEntity.culturalContext.discoveryValue}</p>
                  {selectedEntity.culturalContext.relatedWorks && (
                    <div className="related-works">
                      <strong>Key Works:</strong>
                      <div className="works-list">
                        {selectedEntity.culturalContext.relatedWorks.map((work: string, idx: number) => (
                          <span key={idx} className="work-tag">{work}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="occurrences-section">
                <h4>{selectedEntity.mentions.length} mentions in the book:</h4>
                {selectedEntity.mentions.map((mention, idx) => (
                  <div 
                    key={idx} 
                    className="entity-mention"
                    onClick={() => navigateToEntityMention(mention.page)}
                  >
                    <div className="entity-mention-page">Page {mention.page}</div>
                    <div className="entity-mention-chapter">{mention.chapter}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      */}

      {/* Main Content */}
      <div className="book-content">
        <div className="book-header">
          <div className="book-navigation">
            <div className="page-controls">
              <button 
                className="nav-button"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
              >
                <ChevronLeft size={25} />
                Previous
              </button>
              
              <div className="page-info">
                Page {displayPageNumber} of {totalPages}
              </div>
              
              <button 
                className="nav-button"
                onClick={goToNextPage}
                disabled={currentPageIndex === pages.length - 1}
              >
                Next
                <ChevronRight size={25} />
              </button>
            </div>

            <div className="page-jump">
              <input
                type="text"
                placeholder="Page..."
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePageJump()}
              />
              <button className="jump-btn" onClick={handlePageJump}>
                Jump
              </button>
            </div>

          </div>
          
          {/* Yellow Bar Container - Positioned to align with Page input */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginTop: '1rem'
          }}>
            <div className="chapter-context" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 'calc(85% + 2rem)',
              marginRight: 'calc(15% - 2rem)',
              paddingRight: '2rem'
            }}>
              <div style={{ fontSize: '22.5px' }}>
                Currently reading: <strong>{currentPage?.chapterTitle}</strong>
              </div>
              
              {/* Search & Discover Button - Aligned with Page input */}
              <button 
                onClick={() => setShowSearch(true)}
                className="search-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.86rem 1.43rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: '50px'
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Search size={21} />
              <span style={{ fontWeight: '800', letterSpacing: '0.025em', fontSize: '1.17rem' }}>Search & Discover</span>
            </button>
            </div>
          </div>
        </div>

        <div 
          ref={contentRef}
          className={`page-content ${isChapterStart(currentPage?.pageNumber) ? 'chapter-start' : ''}`}
        >
          {currentPage && (
            <>
              {currentPage.content.split('\n\n').map((paragraph, index) => (
                <p 
                  key={index}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightEntitiesInText(paragraph) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('entity-highlight')) {
                      const entityType = target.getAttribute('data-type');
                      const entityName = target.getAttribute('data-entity');
                      
                      if (entityType === 'music-video') {
                        // Open video modal for John Coltrane
                        setShowVideoModal(true);
                      } else if (entityName) {
                        showEntityOccurrences(entityName);
                      }
                    }
                  }}
                />
              ))}
            </>
          )}
        </div>

        <div className="page-footer">
          <div className="word-count">
            {currentPage?.wordCount} words on this page
          </div>
          <div className="page-controls">
            <button 
              className="nav-button"
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft size={20} />
              Previous Page
            </button>
            
            <button 
              className="nav-button"
              onClick={goToNextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              Next Page
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Selection Modal */}
      {showSelectionModal && (
        <TextSelectionModal
          selectedText={selectedText}
          onClose={handleCloseSelectionModal}
          onSearch={(searchText) => {
            setInitialSearchTerm(searchText);
            setShowSearch(true);
            handleCloseSelectionModal();
          }}
        />
      )}

      {/* Book Search Modal */}
      <BookSearch
        fullText={fullTranscript}
        pages={pages}
        onNavigate={handleSearchNavigate}
        isOpen={showSearch}
        onClose={() => {
          setShowSearch(false);
          setInitialSearchTerm(''); // Reset initial search term
        }}
        initialSearchTerm={initialSearchTerm}
      />

      {/* Video Modal - John Coltrane Test */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="John Coltrane - A Love Supreme"
        videoId="QUAhvJW3ZD4"
        context="John Coltrane's spiritual jazz masterpiece that influenced a generation of artists including Patti Smith."
      />
    </div>
  );
};