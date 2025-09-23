import type { BookAnalysis, Book, BookChapter, CrossMediaMention } from '../../../shared/schema';
import { generateAuthenticBookAnalysis, generateEntityMapping, generateCrossMediaMentions } from '../components/authentic-audiobook-analysis';

// Get the complete authentic book analysis
export const authenticBookAnalysis = generateAuthenticBookAnalysis();
export const authenticEntitiesMap = generateEntityMapping();
export const authenticCrossMediaMentions = generateCrossMediaMentions();

// Legacy export for backward compatibility
export const merleHaggardBook: Book = authenticBookAnalysis.book;
export const merleHaggardBookChapters: BookChapter[] = authenticBookAnalysis.chapters;
export const bookPodcastConnections: CrossMediaMention[] = authenticCrossMediaMentions;

// Complete book analysis for enhanced reader
export const merleHaggardBookAnalysis: BookAnalysis = authenticBookAnalysis;