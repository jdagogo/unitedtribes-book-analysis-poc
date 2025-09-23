import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  index: number;
}

interface SynchronizedTranscriptProps {
  text: string;
  wordTimestamps?: WordTimestamp[];
  currentWordIndex?: number;
  onWordClick?: (wordIndex: number, timestamp: number) => void;
  className?: string;
  highlightColor?: string;
  scrollToHighlight?: boolean;
  enableVisualFeedback?: boolean;
}

export function SynchronizedTranscript({
  text,
  wordTimestamps = [],
  currentWordIndex = -1,
  onWordClick,
  className = '',
  highlightColor = 'bg-yellow-300',
  scrollToHighlight = true,
  enableVisualFeedback = true
}: SynchronizedTranscriptProps) {
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [clickedWordIndex, setClickedWordIndex] = useState<number | null>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledWord = useRef<number>(-1);

  // Generate word timestamps if not provided
  const words = useMemo(() => {
    if (wordTimestamps.length > 0) {
      return wordTimestamps;
    }

    // Fallback: split text into words and estimate timestamps
    const textWords = text.split(/\s+/);
    const estimatedDuration = textWords.length * 0.3; // Estimate 0.3 seconds per word
    
    return textWords.map((word, index) => ({
      word,
      start: index * 0.3,
      end: (index + 1) * 0.3,
      index
    }));
  }, [text, wordTimestamps]);

  // Scroll to highlighted word
  useEffect(() => {
    if (!scrollToHighlight || currentWordIndex < 0) return;
    if (currentWordIndex === lastScrolledWord.current) return;

    const wordElement = wordRefs.current.get(currentWordIndex);
    if (wordElement && containerRef.current) {
      const container = containerRef.current;
      const wordRect = wordElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if word is visible
      const isVisible = 
        wordRect.top >= containerRect.top &&
        wordRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        // Smooth scroll to center the word in view
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        lastScrolledWord.current = currentWordIndex;
      }
    }
  }, [currentWordIndex, scrollToHighlight]);

  // Handle word click with enhanced visual feedback
  const handleWordClick = (wordIndex: number) => {
    const word = words[wordIndex];
    if (word && onWordClick) {
      console.log(`📝 [TRANSCRIPT] Word "${word.word}" clicked at ${word.start}s`);
      
      // Show click feedback with animation
      if (enableVisualFeedback) {
        setClickedWordIndex(wordIndex);
        // Haptic-like visual feedback duration
        setTimeout(() => setClickedWordIndex(null), 400);
      }
      
      onWordClick(wordIndex, word.start);
    }
  };

  // Set word ref
  const setWordRef = (index: number, element: HTMLSpanElement | null) => {
    if (element) {
      wordRefs.current.set(index, element);
    } else {
      wordRefs.current.delete(index);
    }
  };

  // Render word with appropriate styling and feedback
  const renderWord = (word: WordTimestamp, index: number) => {
    const isHighlighted = index === currentWordIndex;
    const isHovered = index === hoveredWordIndex;
    const isClicked = index === clickedWordIndex;
    const isClickable = !!onWordClick;

    return (
      <span
        key={`word-${index}`}
        ref={(el) => setWordRef(index, el)}
        className={cn(
          'inline-block relative',
          // Base transitions
          'transition-all duration-200 ease-out',
          // Clickable state
          isClickable && 'cursor-pointer',
          // Hover effects (when not highlighted)
          isClickable && !isHighlighted && !isClicked && [
            'hover:bg-blue-50 dark:hover:bg-blue-900/30',
            'hover:scale-105',
            'hover:underline',
            'hover:shadow-sm'
          ],
          // Current word highlighting
          isHighlighted && [
            highlightColor,
            'font-bold',
            'scale-110',
            'ring-2 ring-yellow-400',
            'shadow-md',
            'z-10'
          ],
          // Hover state (when already highlighted)
          isHovered && !isHighlighted && !isClicked && [
            'bg-gray-100 dark:bg-gray-800',
            'underline decoration-2',
            'shadow-sm'
          ],
          // Click feedback animation
          isClicked && enableVisualFeedback && [
            'animate-pulse',
            'bg-green-400 dark:bg-green-600',
            'scale-125',
            'ring-2 ring-green-500',
            'shadow-lg',
            'z-20',
            'font-bold'
          ]
        )}
        onClick={() => handleWordClick(index)}
        onMouseEnter={() => enableVisualFeedback && setHoveredWordIndex(index)}
        onMouseLeave={() => setHoveredWordIndex(null)}
        data-start-time={word.start}
        data-end-time={word.end}
        data-word-index={index}
        style={{
          padding: '2px 4px',
          borderRadius: '4px',
          marginRight: '0.25em',
          display: 'inline-block',
          // Smooth transform origin for scaling
          transformOrigin: 'center center'
        }}
      >
        {word.word}
        {/* Click ripple effect */}
        {isClicked && enableVisualFeedback && (
          <span 
            className="absolute inset-0 rounded animate-ping bg-green-400 opacity-30"
            style={{ animationDuration: '400ms' }}
          />
        )}
      </span>
    );
  };

  // Group words into paragraphs for better display
  const paragraphs = useMemo(() => {
    const result: WordTimestamp[][] = [];
    let currentParagraph: WordTimestamp[] = [];
    
    words.forEach((word, index) => {
      currentParagraph.push(word);
      
      // Start new paragraph after periods, or every 50 words
      if (word.word.endsWith('.') || currentParagraph.length >= 50) {
        result.push([...currentParagraph]);
        currentParagraph = [];
      }
    });
    
    if (currentParagraph.length > 0) {
      result.push(currentParagraph);
    }
    
    return result;
  }, [words]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'synchronized-transcript',
        'overflow-y-auto',
        'max-h-[600px]',
        'p-4',
        'bg-white dark:bg-gray-900',
        'rounded-lg',
        'shadow-inner',
        className
      )}
    >
      {paragraphs.map((paragraph, pIndex) => (
        <p key={`paragraph-${pIndex}`} className="mb-4 leading-relaxed">
          {paragraph.map((word) => renderWord(word, word.index))}
        </p>
      ))}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div>Current Word: {currentWordIndex >= 0 ? words[currentWordIndex]?.word : 'None'}</div>
          <div>Total Words: {words.length}</div>
          <div>Hovered Word: {hoveredWordIndex !== null ? words[hoveredWordIndex]?.word : 'None'}</div>
        </div>
      )}
    </div>
  );
}

// Utility function to generate word timestamps from text
export function generateWordTimestamps(
  text: string,
  startTime: number = 0,
  endTime: number = 0,
  wordsPerMinute: number = 150
): WordTimestamp[] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalDuration = endTime > startTime ? endTime - startTime : (words.length / wordsPerMinute) * 60;
  const timePerWord = totalDuration / words.length;
  
  return words.map((word, index) => ({
    word,
    start: startTime + (index * timePerWord),
    end: startTime + ((index + 1) * timePerWord),
    index
  }));
}

// Utility function to parse SRT/VTT format timestamps
export function parseTimestampedText(
  timestampedText: string,
  format: 'srt' | 'vtt' = 'srt'
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  const lines = timestampedText.split('\n');
  let wordIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and sequence numbers
    if (!line || /^\d+$/.test(line)) continue;
    
    // Parse timestamp line (00:00:00,000 --> 00:00:05,000)
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}[,.]?\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]?\d{3})/);
    if (timestampMatch) {
      const startTime = parseTimeToSeconds(timestampMatch[1]);
      const endTime = parseTimeToSeconds(timestampMatch[2]);
      
      // Get the text line (next non-empty line)
      i++;
      while (i < lines.length && !lines[i].trim()) i++;
      if (i < lines.length) {
        const textLine = lines[i].trim();
        const lineWords = textLine.split(/\s+/);
        const timePerWord = (endTime - startTime) / lineWords.length;
        
        lineWords.forEach((word, idx) => {
          words.push({
            word,
            start: startTime + (idx * timePerWord),
            end: startTime + ((idx + 1) * timePerWord),
            index: wordIndex++
          });
        });
      }
    }
  }
  
  return words;
}

// Helper function to convert timestamp to seconds
function parseTimeToSeconds(timestamp: string): number {
  const parts = timestamp.replace(',', '.').split(':');
  const hours = parseFloat(parts[0]) || 0;
  const minutes = parseFloat(parts[1]) || 0;
  const seconds = parseFloat(parts[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}