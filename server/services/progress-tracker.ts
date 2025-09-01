import { EventEmitter } from 'events';

// Progress event types
export enum ProgressEventType {
  UPLOAD_COMPLETE = 'upload_complete',
  TEXT_EXTRACTION_START = 'text_extraction_start',
  TEXT_EXTRACTION_PROGRESS = 'text_extraction_progress',
  TEXT_EXTRACTION_COMPLETE = 'text_extraction_complete',
  ENTITY_ANALYSIS_START = 'entity_analysis_start',
  ENTITY_ANALYSIS_PROGRESS = 'entity_analysis_progress',
  ENTITY_ANALYSIS_COMPLETE = 'entity_analysis_complete',
  FILE_GENERATION_START = 'file_generation_start',
  FILE_GENERATION_PROGRESS = 'file_generation_progress',
  FILE_GENERATION_COMPLETE = 'file_generation_complete',
  PROCESS_COMPLETE = 'process_complete',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

// Base progress event interface
export interface BaseProgressEvent {
  type: ProgressEventType;
  sessionId: string;
  timestamp: number;
  message: string;
}

// Upload completion event
export interface UploadCompleteEvent extends BaseProgressEvent {
  type: ProgressEventType.UPLOAD_COMPLETE;
  data: {
    fileName: string;
    fileSize: number;
    totalPages?: number;
  };
}

// Text extraction events
export interface TextExtractionStartEvent extends BaseProgressEvent {
  type: ProgressEventType.TEXT_EXTRACTION_START;
  data: {
    totalPages: number;
  };
}

export interface TextExtractionProgressEvent extends BaseProgressEvent {
  type: ProgressEventType.TEXT_EXTRACTION_PROGRESS;
  data: {
    currentPage: number;
    totalPages: number;
    percentage: number;
    extractedText: number; // characters extracted so far
  };
}

export interface TextExtractionCompleteEvent extends BaseProgressEvent {
  type: ProgressEventType.TEXT_EXTRACTION_COMPLETE;
  data: {
    totalPages: number;
    totalText: number;
    duration: number; // milliseconds
  };
}

// Entity analysis events
export interface EntityAnalysisStartEvent extends BaseProgressEvent {
  type: ProgressEventType.ENTITY_ANALYSIS_START;
  data: {
    totalTextLength: number;
  };
}

export interface EntityAnalysisProgressEvent extends BaseProgressEvent {
  type: ProgressEventType.ENTITY_ANALYSIS_PROGRESS;
  data: {
    entitiesFound: number;
    textProcessed: number;
    totalTextLength: number;
    percentage: number;
    currentEntities: {
      people: number;
      organizations: number;
      locations: number;
      dates: number;
      other: number;
    };
  };
}

export interface EntityAnalysisCompleteEvent extends BaseProgressEvent {
  type: ProgressEventType.ENTITY_ANALYSIS_COMPLETE;
  data: {
    totalEntities: number;
    entityBreakdown: {
      people: number;
      organizations: number;
      locations: number;
      dates: number;
      other: number;
    };
    duration: number; // milliseconds
  };
}

// File generation events
export interface FileGenerationStartEvent extends BaseProgressEvent {
  type: ProgressEventType.FILE_GENERATION_START;
  data: {
    fileType: string;
    totalEntities: number;
  };
}

export interface FileGenerationProgressEvent extends BaseProgressEvent {
  type: ProgressEventType.FILE_GENERATION_PROGRESS;
  data: {
    percentage: number;
    currentStep: string;
  };
}

export interface FileGenerationCompleteEvent extends BaseProgressEvent {
  type: ProgressEventType.FILE_GENERATION_COMPLETE;
  data: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    duration: number;
  };
}

// Process completion event
export interface ProcessCompleteEvent extends BaseProgressEvent {
  type: ProgressEventType.PROCESS_COMPLETE;
  data: {
    totalDuration: number;
    totalEntities: number;
    outputFiles: Array<{
      name: string;
      size: number;
      downloadUrl: string;
    }>;
  };
}

// Error event
export interface ErrorEvent extends BaseProgressEvent {
  type: ProgressEventType.ERROR;
  data: {
    error: string;
    code?: string;
    stage: string;
  };
}

// Cancelled event
export interface CancelledEvent extends BaseProgressEvent {
  type: ProgressEventType.CANCELLED;
  data: {
    stage: string;
    reason: string;
  };
}

// Union type for all progress events
export type ProgressEvent = 
  | UploadCompleteEvent
  | TextExtractionStartEvent
  | TextExtractionProgressEvent
  | TextExtractionCompleteEvent
  | EntityAnalysisStartEvent
  | EntityAnalysisProgressEvent
  | EntityAnalysisCompleteEvent
  | FileGenerationStartEvent
  | FileGenerationProgressEvent
  | FileGenerationCompleteEvent
  | ProcessCompleteEvent
  | ErrorEvent
  | CancelledEvent;

// Progress statistics interface
export interface ProgressStatistics {
  sessionId: string;
  startTime: number;
  currentStage: string;
  totalStages: number;
  completedStages: number;
  overallPercentage: number;
  estimatedTimeRemaining?: number;
  stageTimings: Record<string, {
    startTime: number;
    endTime?: number;
    duration?: number;
  }>;
}

// SSE message format
export interface SSEMessage {
  id: string;
  event: string;
  data: string;
  retry?: number;
}

// Progress tracker class
export class ProgressTracker extends EventEmitter {
  private sessions: Map<string, ProgressStatistics> = new Map();
  private cancelled: Set<string> = new Set();
  private sseClients: Map<string, Set<any>> = new Map();

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many SSE connections
  }

  // Initialize a new progress session
  public initializeSession(sessionId: string): void {
    const statistics: ProgressStatistics = {
      sessionId,
      startTime: Date.now(),
      currentStage: 'initialized',
      totalStages: 5, // upload, extraction, analysis, generation, complete
      completedStages: 0,
      overallPercentage: 0,
      stageTimings: {}
    };

    this.sessions.set(sessionId, statistics);
    this.cancelled.delete(sessionId); // Reset cancellation status
  }

  // Add SSE client for a session
  public addSSEClient(sessionId: string, response: any): void {
    if (!this.sseClients.has(sessionId)) {
      this.sseClients.set(sessionId, new Set());
    }
    this.sseClients.get(sessionId)!.add(response);

    // Send initial connection message
    this.sendSSEMessage(sessionId, {
      id: Date.now().toString(),
      event: 'connected',
      data: JSON.stringify({ sessionId, timestamp: Date.now() })
    });
  }

  // Remove SSE client
  public removeSSEClient(sessionId: string, response: any): void {
    const clients = this.sseClients.get(sessionId);
    if (clients) {
      clients.delete(response);
      if (clients.size === 0) {
        this.sseClients.delete(sessionId);
      }
    }
  }

  // Send SSE message to all clients for a session
  private sendSSEMessage(sessionId: string, message: SSEMessage): void {
    const clients = this.sseClients.get(sessionId);
    if (!clients) return;

    const formattedMessage = this.formatSSEMessage(message);
    
    clients.forEach(response => {
      try {
        // Express response object - use write() directly
        if (response && response.write) {
          response.write(formattedMessage);
        }
      } catch (error) {
        console.error('Error sending SSE message:', error);
        this.removeSSEClient(sessionId, response);
      }
    });
  }

  // Format SSE message according to specification
  private formatSSEMessage(message: SSEMessage): string {
    let formatted = '';
    if (message.id) formatted += `id: ${message.id}\n`;
    if (message.event) formatted += `event: ${message.event}\n`;
    if (message.retry) formatted += `retry: ${message.retry}\n`;
    formatted += `data: ${message.data}\n\n`;
    return formatted;
  }

  // Emit and send progress event
  public emitProgress(event: ProgressEvent): void {
    if (this.isCancelled(event.sessionId)) {
      return; // Don't emit events for cancelled sessions
    }

    // Update session statistics
    this.updateSessionStatistics(event);

    // Emit event locally
    this.emit('progress', event);

    // Send via SSE
    this.sendSSEMessage(event.sessionId, {
      id: Date.now().toString(),
      event: event.type,
      data: JSON.stringify(event)
    });
  }

  // Update session statistics based on event
  private updateSessionStatistics(event: ProgressEvent): void {
    const stats = this.sessions.get(event.sessionId);
    if (!stats) return;

    const now = Date.now();

    // Update current stage and timings
    switch (event.type) {
      case ProgressEventType.UPLOAD_COMPLETE:
        stats.currentStage = 'text_extraction';
        stats.completedStages = 1;
        stats.stageTimings['upload'] = { startTime: stats.startTime, endTime: now, duration: now - stats.startTime };
        stats.stageTimings['text_extraction'] = { startTime: now };
        break;

      case ProgressEventType.TEXT_EXTRACTION_COMPLETE:
        stats.currentStage = 'entity_analysis';
        stats.completedStages = 2;
        if (stats.stageTimings['text_extraction']) {
          stats.stageTimings['text_extraction'].endTime = now;
          stats.stageTimings['text_extraction'].duration = now - stats.stageTimings['text_extraction'].startTime;
        }
        stats.stageTimings['entity_analysis'] = { startTime: now };
        break;

      case ProgressEventType.ENTITY_ANALYSIS_COMPLETE:
        stats.currentStage = 'file_generation';
        stats.completedStages = 3;
        if (stats.stageTimings['entity_analysis']) {
          stats.stageTimings['entity_analysis'].endTime = now;
          stats.stageTimings['entity_analysis'].duration = now - stats.stageTimings['entity_analysis'].startTime;
        }
        stats.stageTimings['file_generation'] = { startTime: now };
        break;

      case ProgressEventType.FILE_GENERATION_COMPLETE:
        stats.currentStage = 'completing';
        stats.completedStages = 4;
        if (stats.stageTimings['file_generation']) {
          stats.stageTimings['file_generation'].endTime = now;
          stats.stageTimings['file_generation'].duration = now - stats.stageTimings['file_generation'].startTime;
        }
        break;

      case ProgressEventType.PROCESS_COMPLETE:
        stats.currentStage = 'completed';
        stats.completedStages = 5;
        stats.stageTimings['total'] = { startTime: stats.startTime, endTime: now, duration: now - stats.startTime };
        break;
    }

    // Calculate overall percentage
    stats.overallPercentage = (stats.completedStages / stats.totalStages) * 100;

    // Estimate time remaining based on average stage duration
    if (stats.completedStages > 0 && stats.completedStages < stats.totalStages) {
      const completedDurations = Object.values(stats.stageTimings)
        .filter(timing => timing.duration !== undefined)
        .map(timing => timing.duration!);
      
      if (completedDurations.length > 0) {
        const avgStageTime = completedDurations.reduce((sum, duration) => sum + duration, 0) / completedDurations.length;
        const remainingStages = stats.totalStages - stats.completedStages;
        stats.estimatedTimeRemaining = avgStageTime * remainingStages;
      }
    }
  }

  // Cancel a session
  public cancelSession(sessionId: string, reason: string = 'User requested cancellation'): void {
    this.cancelled.add(sessionId);
    
    const stats = this.sessions.get(sessionId);
    const currentStage = stats?.currentStage || 'unknown';

    const cancelEvent: CancelledEvent = {
      type: ProgressEventType.CANCELLED,
      sessionId,
      timestamp: Date.now(),
      message: `Processing cancelled: ${reason}`,
      data: {
        stage: currentStage,
        reason
      }
    };

    this.emitProgress(cancelEvent);
    
    // Close SSE connections
    const clients = this.sseClients.get(sessionId);
    if (clients) {
      clients.forEach(response => {
        try {
          if (response && response.end) {
            response.end();
          }
        } catch (error) {
          console.error('Error closing SSE connection:', error);
        }
      });
      this.sseClients.delete(sessionId);
    }
  }

  // Check if session is cancelled
  public isCancelled(sessionId: string): boolean {
    return this.cancelled.has(sessionId);
  }

  // Get session statistics
  public getSessionStatistics(sessionId: string): ProgressStatistics | undefined {
    return this.sessions.get(sessionId);
  }

  // Clean up completed or cancelled sessions
  public cleanupSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.cancelled.delete(sessionId);
    
    // Close any remaining SSE connections
    const clients = this.sseClients.get(sessionId);
    if (clients) {
      clients.forEach(response => {
        try {
          if (response && response.end) {
            response.end();
          }
        } catch (error) {
          console.error('Error closing SSE connection during cleanup:', error);
        }
      });
      this.sseClients.delete(sessionId);
    }
  }

  // Get all active sessions
  public getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Utility methods for creating specific events
  public createUploadCompleteEvent(sessionId: string, fileName: string, fileSize: number, totalPages?: number): UploadCompleteEvent {
    return {
      type: ProgressEventType.UPLOAD_COMPLETE,
      sessionId,
      timestamp: Date.now(),
      message: `File "${fileName}" uploaded successfully`,
      data: { fileName, fileSize, totalPages }
    };
  }

  public createTextExtractionProgressEvent(sessionId: string, currentPage: number, totalPages: number, extractedText: number): TextExtractionProgressEvent {
    const percentage = Math.round((currentPage / totalPages) * 100);
    return {
      type: ProgressEventType.TEXT_EXTRACTION_PROGRESS,
      sessionId,
      timestamp: Date.now(),
      message: `Extracting text from page ${currentPage} of ${totalPages} (${percentage}%)`,
      data: { currentPage, totalPages, percentage, extractedText }
    };
  }

  public createEntityAnalysisProgressEvent(
    sessionId: string, 
    entitiesFound: number, 
    textProcessed: number, 
    totalTextLength: number,
    currentEntities: { people: number; organizations: number; locations: number; dates: number; other: number }
  ): EntityAnalysisProgressEvent {
    const percentage = Math.round((textProcessed / totalTextLength) * 100);
    return {
      type: ProgressEventType.ENTITY_ANALYSIS_PROGRESS,
      sessionId,
      timestamp: Date.now(),
      message: `Found ${entitiesFound} entities (${percentage}% complete)`,
      data: { entitiesFound, textProcessed, totalTextLength, percentage, currentEntities }
    };
  }

  public createErrorEvent(sessionId: string, error: string, stage: string, code?: string): ErrorEvent {
    return {
      type: ProgressEventType.ERROR,
      sessionId,
      timestamp: Date.now(),
      message: `Error in ${stage}: ${error}`,
      data: { error, stage, code }
    };
  }
}

// Singleton instance
export const progressTracker = new ProgressTracker();

// Export types for external use
export type {
  ProgressEvent,
  ProgressStatistics,
  SSEMessage
};