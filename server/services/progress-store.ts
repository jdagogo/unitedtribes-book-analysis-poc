// Simple in-memory progress store for reliable progress tracking
export interface ProgressStatus {
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  message: string;
  progress: number; // 0-100
  complete: boolean;
  error?: string;
  result?: any;
  timestamp: string;
  details?: {
    wordCount?: number;
    entityCount?: number;
    processingTime?: number;
  };
}

class ProgressStore {
  private store: Map<string, ProgressStatus> = new Map();
  
  // Update progress for a session
  updateProgress(sessionId: string, update: Partial<ProgressStatus>) {
    const current = this.store.get(sessionId) || {
      sessionId,
      currentStep: 0,
      totalSteps: 5,
      stepName: 'initializing',
      message: 'Initializing...',
      progress: 0,
      complete: false,
      timestamp: new Date().toISOString()
    };
    
    const updated = {
      ...current,
      ...update,
      timestamp: new Date().toISOString()
    };
    
    this.store.set(sessionId, updated);
    console.log(`📊 Progress updated for ${sessionId}:`, {
      step: `${updated.currentStep}/${updated.totalSteps}`,
      progress: `${updated.progress}%`,
      message: updated.message
    });
    
    return updated;
  }
  
  // Get progress for a session
  getProgress(sessionId: string): ProgressStatus | null {
    return this.store.get(sessionId) || null;
  }
  
  // Clean up old sessions (older than 1 hour)
  cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [sessionId, status] of this.store.entries()) {
      if (new Date(status.timestamp).getTime() < oneHourAgo) {
        this.store.delete(sessionId);
      }
    }
  }
  
  // Mark session as complete
  complete(sessionId: string, result: any) {
    this.updateProgress(sessionId, {
      currentStep: 5,
      totalSteps: 5,
      stepName: 'complete',
      message: 'Processing complete!',
      progress: 100,
      complete: true,
      result
    });
  }
  
  // Mark session as failed
  fail(sessionId: string, error: string) {
    this.updateProgress(sessionId, {
      stepName: 'error',
      message: `Error: ${error}`,
      complete: true,
      error
    });
  }
}

// Singleton instance
export const progressStore = new ProgressStore();

// Clean up old sessions every 10 minutes
setInterval(() => {
  progressStore.cleanup();
}, 10 * 60 * 1000);