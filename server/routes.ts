import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processMerleHaggardBookSimple } from "./simple-book-processor";
import { processCompleteMerleHaggardBook } from "./comprehensive-book-processor";
import { processFixedMerleHaggardBook } from "./fixed-book-processor";
import { extractFromFreshAirRSS } from "./services/podcast";
import { processPDFFile, processUploadedPDF } from "./services/pdf-processor";
import { ProgressTracker } from "./services/progress-tracker";
import { progressStore } from "./services/progress-store";
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import multer from 'multer';
import discoveryRouter from './routes/discovery';
import hybridDiscoveryRouter from './routes/hybrid-discovery';
import simpleHybridRouter from './routes/simple-hybrid';
import workingHybridRouter from './routes/working-hybrid';
import smartAnalysisRouter from './routes/smart-analysis';

// In-memory book storage for immediate access
const bookStore = new Map<string, any>();

// Store a persistent copy that survives server restarts
let latestProcessedBook: any = null;

// File-based persistence for better reliability
import fs_sync from 'fs';
const BOOK_CACHE_FILE = './audiobook-cache.json';

// Load cached book on startup
const loadCachedBook = () => {
  try {
    if (fs_sync.existsSync(BOOK_CACHE_FILE)) {
      const cached = JSON.parse(fs_sync.readFileSync(BOOK_CACHE_FILE, 'utf8'));
      latestProcessedBook = cached;
      bookStore.set('merle-haggard', cached);
      bookStore.set(cached.id, cached);
      console.log('📚 Loaded cached audiobook from disk');
      return cached;
    }
  } catch (error) {
    console.error('Failed to load cached book:', error);
  }
  return null;
};

// Save book to disk cache
const saveCachedBook = (book: any) => {
  try {
    fs_sync.writeFileSync(BOOK_CACHE_FILE, JSON.stringify(book, null, 2));
    console.log('💾 Saved audiobook to disk cache');
  } catch (error) {
    console.error('Failed to save cached book:', error);
  }
};

// Initialize cache on startup
loadCachedBook();

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 52428800 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Initialize progress tracker
const progressTracker = new ProgressTracker();

export async function registerRoutes(app: Express): Promise<Server> {
  // Register discovery routes
  app.use(discoveryRouter);
  app.use(hybridDiscoveryRouter);
  app.use(simpleHybridRouter);
  app.use(workingHybridRouter);
  app.use(smartAnalysisRouter);
  
  // Simple polling endpoint for progress
  app.get("/api/progress-status/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const status = progressStore.getProgress(sessionId);
    
    if (!status) {
      return res.status(404).json({ 
        error: 'Session not found',
        sessionId 
      });
    }
    
    res.json(status);
  });
  
  // Test endpoint to verify progress system
  app.get("/api/test-progress", (req, res) => {
    const testSessionId = `test_${Date.now()}`;
    
    // Simulate progress updates
    progressStore.updateProgress(testSessionId, {
      currentStep: 1,
      totalSteps: 5,
      stepName: 'uploading',
      message: 'Testing progress system...',
      progress: 20
    });
    
    setTimeout(() => {
      progressStore.updateProgress(testSessionId, {
        currentStep: 2,
        totalSteps: 5,
        stepName: 'extracting',
        message: 'Extracting text...',
        progress: 40
      });
    }, 1000);
    
    setTimeout(() => {
      progressStore.updateProgress(testSessionId, {
        currentStep: 3,
        totalSteps: 5,
        stepName: 'analyzing',
        message: 'Analyzing content...',
        progress: 60
      });
    }, 2000);
    
    setTimeout(() => {
      progressStore.complete(testSessionId, { test: 'success' });
    }, 3000);
    
    res.json({ 
      message: 'Test progress session started',
      sessionId: testSessionId,
      pollEndpoint: `/api/progress-status/${testSessionId}`
    });
  });
  
  // SSE endpoint for progress updates (kept for compatibility)
  app.get("/api/progress/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    console.log(`🔗 SSE connection requested for session: ${sessionId}`);
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    });
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`);
    
    // Add client to progress tracker
    progressTracker.addSSEClient(sessionId, res);
    
    // Send heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 30000);
    
    // Handle client disconnect
    req.on('close', () => {
      console.log(`🔗 SSE connection closed for session: ${sessionId}`);
      clearInterval(heartbeat);
      progressTracker.removeSSEClient(sessionId, res);
    });
  });
  
  // Cancel processing endpoint
  app.post("/api/cancel-processing/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    progressTracker.cancelSession(sessionId);
    res.json({ success: true, message: 'Processing cancelled' });
  });
  // Route to process complete Merle Haggard book with proper chapter division
  app.post("/api/process-complete-book", async (req, res) => {
    try {
      console.log(`📚 Processing complete Merle Haggard book with proper chapter division...`);
      
      const result = await processFixedMerleHaggardBook();
      
      // Store the result in multiple storage systems for the book reader
      await storage.storeBook(result);
      bookStore.set('merle-haggard', result);
      bookStore.set(result.id, result);
      latestProcessedBook = result; // Keep persistent copy
      saveCachedBook(result); // Save to disk cache
      
      res.json({
        success: true,
        message: "Complete book processed with systematic chapters and full searchability",
        data: result
      });
    } catch (error) {
      console.error('Error processing complete book:', error);
      res.status(500).json({ 
        error: "Failed to process complete book",
        details: error.message 
      });
    }
  });

  // Route to process Merle Haggard book from text file with YouTube alignment (legacy)
  app.post("/api/process-merle-book", async (req, res) => {
    try {
      console.log(`📚 Processing Merle Haggard book from text file...`);
      
      const { youtubeUrl } = req.body;
      const result = await processMerleHaggardBookSimple();
      
      // Store the result in storage for the book reader
      await storage.storeBook(result);
      
      res.json({
        success: true,
        message: "Book processed successfully from text with YouTube alignment",
        data: result
      });
    } catch (error) {
      console.error('Error processing book:', error);
      res.status(500).json({ 
        error: "Failed to process book",
        details: error.message 
      });
    }
  });

  // Route to get processed audiobook data
  app.get("/api/audiobook/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('Error getting book:', error);
      res.status(500).json({ 
        error: "Failed to get book",
        details: error.message 
      });
    }
  });

  // Route to get latest processed audiobook
  app.get("/api/audiobook", async (req, res) => {
    try {
      console.log('🔍 Attempting to retrieve audiobook...');
      
      // First try to get from in-memory store
      let latestBook = bookStore.get('merle-haggard');
      
      // Fallback to storage system
      if (!latestBook) {
        latestBook = await storage.getBook('merle-haggard');
      }
      
      if (!latestBook && (storage as any).getAllBooks) {
        // Fallback: get all books and find the latest Merle Haggard book
        const allBooks = await (storage as any).getAllBooks();
        console.log(`📚 Found ${allBooks.length} total books in storage`);
        
        latestBook = allBooks
          .filter(book => 
            book.title?.includes('Merle') || 
            book.title?.includes('My House of Memories') ||
            book.author?.includes('Merle Haggard')
          )
          .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())[0];
      }
      
      if (!latestBook) {
        console.log('📚 No processed book found, returning default Merle Haggard audiobook data');
        // Return hardcoded Merle Haggard audiobook data with YouTube URL
        latestBook = {
          id: 'merle-haggard-default',
          title: "My House of Memories: The Merle Haggard Story",
          author: "Merle Haggard with Tom Carter",
          youtubeUrl: "https://www.youtube.com/watch?v=PSN8N2v4oq0&t=946s",
          chapters: [
            {
              id: 'ch1',
              number: 1,
              title: 'Chapter 1: Early Years',
              content: 'The beginning of Merle Haggard\'s journey...',
              summary: 'Merle\'s childhood and early influences',
              wordCount: 5000,
              startTime: 0,
              endTime: 1800,
              keyEntities: ['Bakersfield', 'Oildale', 'Family'],
              keyTopics: ['Childhood', 'Family', 'California']
            },
            {
              id: 'ch2',
              number: 2,
              title: 'Chapter 2: Finding Music',
              content: 'How Merle discovered his passion for music...',
              summary: 'The musical awakening',
              wordCount: 6000,
              startTime: 1800,
              endTime: 3600,
              keyEntities: ['Guitar', 'Country Music', 'Influences'],
              keyTopics: ['Music', 'Learning', 'Inspiration']
            }
          ],
          totalWords: 43229,
          audioDuration: 7200, // 2 hours
          processedAt: new Date().toISOString()
        };
      }

      console.log(`✅ Found audiobook: ${latestBook.title}`);
      res.json({
        success: true,
        data: latestBook
      });
    } catch (error) {
      console.error('Error getting latest book:', error);
      res.status(500).json({ 
        error: "Failed to get audiobook",
        details: error.message 
      });
    }
  });

  // Route to search within the book
  app.get("/api/audiobook/search", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query required" });
      }

      // Get the latest book
      const allBooks = Array.from((storage as any).books?.values() || []);
      const latestBook = allBooks
        .filter(book => book.title?.includes('Merle'))
        .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())[0];
      
      if (!latestBook) {
        return res.status(404).json({ error: "No book available for search" });
      }

      // Search through chapters
      const searchResults = searchInBook(latestBook, query.toLowerCase());

      res.json({
        success: true,
        query,
        results: searchResults,
        totalResults: searchResults.length
      });
    } catch (error) {
      console.error('Error searching book:', error);
      res.status(500).json({ 
        error: "Failed to search book",
        details: error.message 
      });
    }
  });

  // Route to get Fresh Air audio URL - specifically the Merle Haggard episode
  app.get("/api/fresh-air-audio", async (req, res) => {
    try {
      console.log("🎙️ Returning Merle Haggard Fresh Air episode...");
      
      // Return the specific Merle Haggard episode from Fresh Air RSS feed
      res.json({
        success: true,
        title: "Merle Haggard On Hopping Trains And Doing Time",
        audioUrl: "https://chrt.fm/track/138C95/prfx.byspotify.com/e/play.podtrac.com/npr-381444908/traffic.megaphone.fm/NPR8464585045.mp3?d=2703&size=43252594&e=1247139365&t=podcast&p=381444908",
        duration: 2703,
        showName: "Fresh Air"
      });
    } catch (error) {
      console.error("Error fetching Fresh Air audio:", error);
      res.status(500).json({ 
        error: "Failed to fetch Fresh Air audio",
        details: error.message 
      });
    }
  });

  // Route to upload and process PDF transcript
  app.post("/api/upload-pdf-transcript", upload.single('pdf'), async (req, res) => {
    const startTime = Date.now();
    let currentStep = 'initialization';
    
    // Get sessionId from request body or generate one
    const sessionId = req.body?.sessionId || `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      if (!req.file) {
        console.error('❌ No PDF file uploaded');
        return res.status(400).json({ 
          error: "No PDF file uploaded",
          step: 'validation'
        });
      }
      
      // Initialize progress in both systems
      progressTracker.initializeSession(sessionId);
      progressStore.updateProgress(sessionId, {
        currentStep: 1,
        totalSteps: 5,
        stepName: 'uploading',
        message: `Uploading ${req.file.originalname}...`,
        progress: 10
      });

      console.log(`\n📄 === PDF PROCESSING STARTED ===`);
      console.log(`📄 File: ${req.file.originalname}`);
      console.log(`📏 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
      console.log(`🕐 Time: ${new Date().toISOString()}`);
      console.log(`🔗 Session ID: ${sessionId}`);
      
      // Update progress for upload complete
      progressStore.updateProgress(sessionId, {
        currentStep: 2,
        totalSteps: 5,
        stepName: 'extracting',
        message: 'Extracting text from PDF...',
        progress: 25
      });
      
      // Also emit for SSE (if connected)
      progressTracker.emitProgress(
        progressTracker.createUploadCompleteEvent(
          sessionId,
          req.file.originalname,
          req.file.size
        )
      );
      
      // Set a timeout for the entire operation (60 seconds for large PDFs)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 60 seconds')), 60000);
      });
      
      // Process with timeout protection
      currentStep = 'processing';
      console.log(`🔄 Starting PDF processing...`);
      
      const result = await Promise.race([
        processUploadedPDF(
          req.file.buffer,
          req.file.originalname,
          {
            extractEntities: true,
            generateAnalysis: true,
            saveToFolder: true,
            sessionId: sessionId // Pass sessionId for progress tracking
          }
        ),
        timeoutPromise
      ]);
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.log(`\n✅ === PDF PROCESSING COMPLETE ===`);
      console.log(`⏱️ Processing time: ${processingTime.toFixed(2)} seconds`);
      console.log(`📊 Word count: ${result.wordCount}`);
      console.log(`🏷️ Total entities: ${result.entityCount}`);
      console.log(`🎨 Creative entities: ${result.creativeEntityCount || 0}`);
      console.log(`📁 Saved to: /transcripts/${result.id}`);
      
      // Mark as complete in progress store
      progressStore.complete(sessionId, {
        id: result.id,
        wordCount: result.wordCount,
        entityCount: result.entityCount,
        processingTime: processingTime
      });
      
      // Emit process complete event
      progressTracker.emitProgress({
        type: progressTracker.constructor.prototype.ProgressEventType?.PROCESS_COMPLETE || 'process_complete',
        sessionId,
        timestamp: Date.now(),
        message: 'Processing complete',
        data: {
          totalDuration: processingTime * 1000,
          totalEntities: result.entityCount,
          outputFiles: [
            { name: 'metadata.json', size: 0, downloadUrl: `/transcripts/${result.id}/metadata.json` },
            { name: 'transcript.txt', size: 0, downloadUrl: `/transcripts/${result.id}/transcript.txt` },
            { name: 'analysis.md', size: 0, downloadUrl: `/transcripts/${result.id}/analysis.md` }
          ]
        }
      });
      
      // Clean up session after a delay
      setTimeout(() => {
        progressTracker.cleanupSession(sessionId);
      }, 5000);
      
      res.json({
        success: true,
        message: "PDF transcript processed successfully",
        data: {
          id: result.id,
          title: result.title,
          wordCount: result.wordCount,
          entityCount: result.entityCount,
          creativeEntityCount: result.creativeEntityCount,
          entityBreakdown: result.entityBreakdown,
          processingTime: processingTime,
          sessionId: sessionId,
          folderPath: `/transcripts/${result.id}`,
          files: {
            metadata: `/transcripts/${result.id}/metadata.json`,
            transcript: `/transcripts/${result.id}/transcript.txt`,
            analysis: `/transcripts/${result.id}/analysis.md`
          }
        }
      });
    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.error(`\n❌ === PDF PROCESSING FAILED ===`);
      console.error(`⏱️ Failed after: ${processingTime.toFixed(2)} seconds`);
      console.error(`📍 Failed at step: ${currentStep}`);
      console.error(`❗ Error type: ${error.constructor.name}`);
      console.error(`❗ Error message: ${error.message}`);
      console.error(`📚 Stack trace:`, error.stack);
      
      // Mark as failed in progress store
      progressStore.fail(sessionId, error.message);
      
      // Send detailed error response
      // Emit error event if session exists
      if (sessionId && progressTracker.getSessionStatistics(sessionId)) {
        progressTracker.emitProgress(
          progressTracker.createErrorEvent(
            sessionId,
            error.message,
            currentStep
          )
        );
        
        // Clean up session after error
        setTimeout(() => {
          progressTracker.cleanupSession(sessionId);
        }, 5000);
      }
      
      res.status(500).json({ 
        success: false,
        error: "Failed to process PDF transcript",
        details: error.message,
        step: currentStep,
        processingTime: processingTime,
        sessionId: sessionId
      });
    }
  });

  // Route to get list of processed transcripts
  app.get("/api/transcripts", async (req, res) => {
    try {
      const transcriptsDir = path.join(process.cwd(), 'client', 'public', 'transcripts');
      
      // Check if directory exists
      try {
        await fs.access(transcriptsDir);
      } catch {
        // Directory doesn't exist yet
        return res.json({
          success: true,
          transcripts: []
        });
      }
      
      // Read all folders in transcripts directory
      const folders = await fs.readdir(transcriptsDir);
      const transcripts = [];
      
      for (const folder of folders) {
        const metadataPath = path.join(transcriptsDir, folder, 'metadata.json');
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);
          transcripts.push({
            ...metadata,
            folderName: folder,
            files: {
              metadata: `/transcripts/${folder}/metadata.json`,
              transcript: `/transcripts/${folder}/transcript.txt`,
              analysis: `/transcripts/${folder}/analysis.md`
            }
          });
        } catch (error) {
          console.error(`Error reading metadata for ${folder}:`, error);
        }
      }
      
      // Sort by upload date (newest first)
      transcripts.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      
      res.json({
        success: true,
        transcripts
      });
    } catch (error) {
      console.error('Error getting transcripts:', error);
      res.status(500).json({ 
        error: "Failed to get transcripts",
        details: error.message 
      });
    }
  });

  // Route to get a specific transcript
  app.get("/api/transcripts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transcriptsDir = path.join(process.cwd(), 'client', 'public', 'transcripts');
      const transcriptDir = path.join(transcriptsDir, id);
      
      // Check if directory exists
      try {
        await fs.access(transcriptDir);
      } catch {
        return res.status(404).json({ error: "Transcript not found" });
      }
      
      // Read all files
      const metadata = JSON.parse(
        await fs.readFile(path.join(transcriptDir, 'metadata.json'), 'utf8')
      );
      
      const transcript = await fs.readFile(
        path.join(transcriptDir, 'transcript.txt'), 
        'utf8'
      );
      
      let analysis = null;
      try {
        analysis = await fs.readFile(
          path.join(transcriptDir, 'analysis.md'), 
          'utf8'
        );
      } catch {
        // Analysis file might not exist
      }
      
      res.json({
        success: true,
        data: {
          ...metadata,
          transcript,
          analysis,
          files: {
            metadata: `/transcripts/${id}/metadata.json`,
            transcript: `/transcripts/${id}/transcript.txt`,
            analysis: `/transcripts/${id}/analysis.md`
          }
        }
      });
    } catch (error) {
      console.error('Error getting transcript:', error);
      res.status(500).json({ 
        error: "Failed to get transcript",
        details: error.message 
      });
    }
  });

  // Simple transcript endpoint with highlighted entities
  app.get("/api/transcripts/:id/simple", async (req, res) => {
    try {
      const { id } = req.params;
      const transcriptsDir = path.join(process.cwd(), 'client', 'public', 'transcripts');
      const transcriptDir = path.join(transcriptsDir, id);
      
      // Check if transcript directory exists
      try {
        await fs.access(transcriptDir);
      } catch {
        return res.status(404).json({ error: 'Transcript not found' });
      }
      
      // Read the transcript and metadata files
      const transcriptFile = path.join(transcriptDir, 'transcript.txt');
      const metadataFile = path.join(transcriptDir, 'metadata.json');
      const analysisFile = path.join(transcriptDir, 'analysis.json');
      
      // Check if transcript file exists
      try {
        await fs.access(transcriptFile);
      } catch {
        return res.status(404).json({ error: 'Transcript file not found' });
      }
      
      // Read the raw transcript text
      let rawText = await fs.readFile(transcriptFile, 'utf8');
      
      // Read metadata
      let metadata: any = {};
      try {
        const metadataContent = await fs.readFile(metadataFile, 'utf8');
        metadata = JSON.parse(metadataContent);
      } catch {
        // Metadata file may not exist
      }
      
      // Read entities from metadata or analysis file
      let entities: any[] = [];
      
      // First try to get entities from metadata
      if (metadata.entities && Array.isArray(metadata.entities)) {
        entities = metadata.entities;
      } else {
        // Fallback to analysis.json if it exists
        try {
          const analysisContent = await fs.readFile(analysisFile, 'utf8');
          const analysis = JSON.parse(analysisContent);
          entities = analysis.entities || [];
        } catch {
          // Analysis file may not exist
        }
      }
      
      // Sort entities by length (longest first) to avoid partial matches
      entities.sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
      
      // Apply entity highlighting to the text
      let highlightedText = rawText;
      const processedEntities = new Set<string>();
      
      entities.forEach(entity => {
        if (!entity.name || processedEntities.has(entity.name.toLowerCase())) {
          return;
        }
        
        // Determine entity class based on type
        let entityClass = 'entity ';
        const type = (entity.creativeType || entity.type || '').toLowerCase();
        
        if (type.includes('person')) {
          entityClass += 'entity-creative-person';
        } else if (type.includes('place')) {
          entityClass += 'entity-place';
        } else if (type.includes('work')) {
          entityClass += 'entity-creative-work';
        } else if (type.includes('organization')) {
          entityClass += 'entity-creative-organization';
        } else if (type.includes('event')) {
          entityClass += 'entity-creative-event';
        } else {
          entityClass += 'entity-other';
        }
        
        // Create regex for whole word matching
        const escapedName = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b(${escapedName})\\b`, 'gi');
        
        // Replace with highlighted span
        highlightedText = highlightedText.replace(regex, 
          `<span class="${entityClass}">$1</span>`
        );
        
        processedEntities.add(entity.name.toLowerCase());
      });
      
      // Prepare response
      res.json({
        transcript: highlightedText,
        metadata: {
          title: metadata.title || 'Transcript',
          source: metadata.source || '',
          wordCount: metadata.wordCount || 0,
          entityCount: entities.length,
          uploadDate: metadata.uploadDate,
          processingTime: metadata.processingTime
        }
      });
      
    } catch (error) {
      console.error('Error serving simple transcript:', error);
      res.status(500).json({ error: 'Failed to load transcript' });
    }
  });

  // Route to download audio from YouTube URL
  app.post("/api/download-audio", async (req, res) => {
    try {
      const { youtubeUrl } = req.body;
      
      if (!youtubeUrl) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }
      
      console.log(`🎵 Downloading audio from: ${youtubeUrl}`);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const outputPath = path.join(tempDir, `audio_${timestamp}.%(ext)s`);
      
      // Download audio using yt-dlp
      const ytDlp = spawn('yt-dlp', [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '--output', outputPath,
        youtubeUrl
      ]);
      
      let stderr = '';
      ytDlp.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ytDlp.on('close', async (code) => {
        if (code !== 0) {
          console.error('yt-dlp error:', stderr);
          return res.status(500).json({ error: 'Failed to download audio' });
        }
        
        try {
          // Find the downloaded file
          const expectedFile = path.join(tempDir, `audio_${timestamp}.mp3`);
          
          // Check if file exists
          const stats = await fs.stat(expectedFile);
          if (!stats.isFile()) {
            throw new Error('Downloaded file not found');
          }
          
          console.log(`🎵 Audio downloaded successfully: ${expectedFile}`);
          
          // Set headers for audio streaming
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', stats.size);
          res.setHeader('Content-Disposition', 'inline');
          
          // Stream the file to response
          const fileStream = createReadStream(expectedFile);
          fileStream.pipe(res);
          
          // Clean up file after streaming
          fileStream.on('end', async () => {
            try {
              await fs.unlink(expectedFile);
              console.log(`🗑️ Cleaned up temporary file: ${expectedFile}`);
            } catch (err) {
              console.error('Error cleaning up file:', err);
            }
          });
          
        } catch (error) {
          console.error('Error handling downloaded file:', error);
          res.status(500).json({ error: 'Failed to process downloaded audio' });
        }
      });
      
    } catch (error) {
      console.error('Error downloading audio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Search function for book content
function searchInBook(book: any, query: string) {
  const results: any[] = [];
  const queryWords = query.toLowerCase().split(/\s+/);

  book.chapters?.forEach((chapter: any) => {
    const chapterText = chapter.content.toLowerCase();
    const matchCount = queryWords.reduce((count, word) => {
      return count + (chapterText.split(word).length - 1);
    }, 0);

    if (matchCount > 0) {
      // Find text snippets around matches
      const snippets = extractSnippets(chapter.content, queryWords);
      
      results.push({
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        matchCount,
        snippets,
        startTime: chapter.startTime,
        endTime: chapter.endTime,
        relevanceScore: matchCount * (queryWords.length / chapter.content.split(/\s+/).length)
      });
    }
  });

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function extractSnippets(text: string, queryWords: string[], contextLength: number = 100): string[] {
  const snippets: string[] = [];
  const lowerText = text.toLowerCase();
  
  queryWords.forEach(word => {
    let index = lowerText.indexOf(word);
    while (index !== -1) {
      const start = Math.max(0, index - contextLength);
      const end = Math.min(text.length, index + word.length + contextLength);
      const snippet = text.substring(start, end);
      
      if (!snippets.some(s => s.includes(snippet.substring(10, -10)))) {
        snippets.push(snippet);
      }
      
      index = lowerText.indexOf(word, index + 1);
    }
  });
  
  return snippets.slice(0, 5); // Limit to 5 snippets per chapter
}