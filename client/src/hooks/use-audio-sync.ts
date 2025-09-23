import { useState, useEffect, useCallback, useRef } from 'react';
import type { BookChapter } from '../../../shared/schema';

interface AudioSyncHook {
  currentTime: number;
  isPlaying: boolean;
  currentChapter: number;
  currentParagraph: number | null;
  syncToChapter: (chapterIndex: number) => void;
  syncToParagraph: (chapterIndex: number, paragraphIndex: number) => void;
  togglePlayback: () => Promise<void>;
  seekTo: (time: number) => void;
}

export function useAudioSync(
  audioRef: React.RefObject<HTMLAudioElement>,
  chapters: BookChapter[],
  initialChapter: number = 0
): AudioSyncHook {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [currentParagraph, setCurrentParagraph] = useState<number | null>(null);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate current chapter based on audio time
  const calculateChapterFromTime = useCallback((time: number): number => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      const chapter = chapters[i];
      if (chapter.audioTimestamp !== null && time >= chapter.audioTimestamp) {
        return i;
      }
    }
    return 0;
  }, [chapters]);

  // Calculate current paragraph within chapter
  const calculateParagraphFromTime = useCallback((time: number, chapterIndex: number): number | null => {
    const chapter = chapters[chapterIndex];
    if (!chapter || chapter.audioTimestamp === null || !chapter.audioDuration) {
      return null;
    }

    const relativeTime = time - chapter.audioTimestamp;
    if (relativeTime < 0 || relativeTime > chapter.audioDuration) {
      return null;
    }

    const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
    const timePerParagraph = chapter.audioDuration / paragraphs.length;
    const paragraphIndex = Math.floor(relativeTime / timePerParagraph);
    
    return Math.max(0, Math.min(paragraphIndex, paragraphs.length - 1));
  }, [chapters]);

  // Handle audio time updates
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    // Update chapter if needed
    const newChapter = calculateChapterFromTime(time);
    if (newChapter !== currentChapter) {
      setCurrentChapter(newChapter);
    }

    // Update paragraph highlighting
    const newParagraph = calculateParagraphFromTime(time, newChapter);
    setCurrentParagraph(newParagraph);
  }, [audioRef, calculateChapterFromTime, calculateParagraphFromTime, currentChapter]);

  // Sync to specific chapter
  const syncToChapter = useCallback((chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (chapter?.audioTimestamp !== null && audioRef.current) {
      audioRef.current.currentTime = chapter.audioTimestamp || 0;
      setCurrentChapter(chapterIndex);
      setCurrentParagraph(0);
    }
  }, [chapters, audioRef]);

  // Sync to specific paragraph within chapter
  const syncToParagraph = useCallback((chapterIndex: number, paragraphIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (!chapter || chapter.audioTimestamp === null || !chapter.audioDuration) {
      return;
    }

    const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
    const timePerParagraph = chapter.audioDuration / paragraphs.length;
    const targetTime = chapter.audioTimestamp + (paragraphIndex * timePerParagraph);

    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentChapter(chapterIndex);
      setCurrentParagraph(paragraphIndex);
    }
  }, [chapters, audioRef]);

  // Toggle playback
  const togglePlayback = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, audioRef]);

  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      
      // Update chapter and paragraph
      const newChapter = calculateChapterFromTime(time);
      const newParagraph = calculateParagraphFromTime(time, newChapter);
      setCurrentChapter(newChapter);
      setCurrentParagraph(newParagraph);
    }
  }, [audioRef, calculateChapterFromTime, calculateParagraphFromTime]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, handleTimeUpdate]);

  // Cleanup sync timeout
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    isPlaying,
    currentChapter,
    currentParagraph,
    syncToChapter,
    syncToParagraph,
    togglePlayback,
    seekTo,
  };
}