/**
 * Workout Auto-Save Service
 * 
 * Handles automated saving of workout data with conflict resolution,
 * retry logic, and queue management for optimal user experience.
 */

import { debounceAsync } from '../utils/debounce';

// Types
export interface SaveQueueItem {
  id: string;
  workout: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
}

export interface SaveResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
  duration: number;
}

export interface AutoSaveOptions {
  debounceMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enabledWhenValid: boolean;
  conflictResolution: 'overwrite' | 'merge' | 'prompt';
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
  lastSaved?: Date;
  lastError?: string;
  hasUnsavedChanges: boolean;
  queueLength: number;
}

export type SaveFunction = (workout: any) => Promise<SaveResult>;
export type ConflictResolver = (local: any, remote: any) => Promise<any>;

/**
 * Auto-save service for workout data
 */
export class WorkoutAutoSaveService {
  private saveQueue: SaveQueueItem[] = [];
  private currentSave: Promise<SaveResult> | null = null;
  private debouncedSave: ReturnType<typeof debounceAsync>;
  private saveHistory: SaveResult[] = [];
  private listeners: Set<(status: SaveStatus) => void> = new Set();
  private status: SaveStatus = {
    status: 'idle',
    hasUnsavedChanges: false,
    queueLength: 0
  };

  constructor(
    private saveFunction: SaveFunction,
    private options: AutoSaveOptions = {
      debounceMs: 2000,
      maxRetries: 3,
      retryDelayMs: 1000,
      enabledWhenValid: true,
      conflictResolution: 'overwrite'
    },
    private conflictResolver?: ConflictResolver
  ) {
    this.debouncedSave = debounceAsync(
      this.performSave.bind(this), 
      this.options.debounceMs
    );
  }

  /**
   * Queue a workout for auto-save
   */
  public async queueSave(
    workout: any, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    const saveItem: SaveQueueItem = {
      id: workout.id || this.generateId(),
      workout: { ...workout },
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    // Remove any existing item with the same ID
    this.saveQueue = this.saveQueue.filter(item => item.id !== saveItem.id);
    
    // Add new item and sort by priority
    this.saveQueue.push(saveItem);
    this.sortQueue();

    this.updateStatus({
      hasUnsavedChanges: true,
      queueLength: this.saveQueue.length
    });

    // Trigger debounced save for normal priority, immediate for high priority
    if (priority === 'high') {
      this.debouncedSave.flush();
    } else {
      this.debouncedSave();
    }
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<void> {
    if (this.saveQueue.length === 0 || this.currentSave) {
      return;
    }

    const saveItem = this.saveQueue.shift();
    if (!saveItem) return;

    this.updateStatus({
      status: 'saving',
      queueLength: this.saveQueue.length
    });

    try {
      this.currentSave = this.executeSave(saveItem);
      const result = await this.currentSave;

      if (result.success) {
        this.handleSaveSuccess(result, saveItem);
      } else {
        await this.handleSaveError(result, saveItem);
      }
    } catch (error) {
      await this.handleSaveError(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          duration: 0
        },
        saveItem
      );
    } finally {
      this.currentSave = null;
      
      // Process next item in queue if any
      if (this.saveQueue.length > 0) {
        setTimeout(() => this.performSave(), 100);
      }
    }
  }

  /**
   * Execute the save function with timing
   */
  private async executeSave(saveItem: SaveQueueItem): Promise<SaveResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.saveFunction(saveItem.workout);
      return {
        ...result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Save failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Handle successful save
   */
  private handleSaveSuccess(result: SaveResult, saveItem: SaveQueueItem): void {
    this.saveHistory.push(result);
    this.keepHistorySize();

    this.updateStatus({
      status: 'saved',
      lastSaved: new Date(result.timestamp),
      lastError: undefined,
      hasUnsavedChanges: this.saveQueue.length > 0
    });
  }

  /**
   * Handle save error with retry logic
   */
  private async handleSaveError(result: SaveResult, saveItem: SaveQueueItem): Promise<void> {
    this.saveHistory.push(result);
    this.keepHistorySize();

    // Check if we should retry
    if (saveItem.retryCount < this.options.maxRetries) {
      saveItem.retryCount++;
      
      // Add back to queue with lower priority
      this.saveQueue.unshift(saveItem);
      this.sortQueue();

      // Wait before retry
      setTimeout(() => {
        this.performSave();
      }, this.options.retryDelayMs * saveItem.retryCount);

      this.updateStatus({
        status: 'error',
        lastError: `Retrying save (${saveItem.retryCount}/${this.options.maxRetries})`,
        queueLength: this.saveQueue.length
      });
    } else {
      // Max retries exceeded
      this.updateStatus({
        status: 'error',
        lastError: result.error || 'Save failed after maximum retries',
        hasUnsavedChanges: true
      });
    }
  }

  /**
   * Manual save trigger
   */
  public async forceSave(workout?: any): Promise<SaveResult> {
    if (workout) {
      await this.queueSave(workout, 'high');
    }

    // Flush debounced save and wait for completion
    this.debouncedSave.flush();
    
    if (this.currentSave) {
      return await this.currentSave;
    }

    return {
      success: true,
      timestamp: Date.now(),
      duration: 0
    };
  }

  /**
   * Clear the save queue
   */
  public clearQueue(): void {
    this.saveQueue = [];
    this.debouncedSave.cancel();
    
    this.updateStatus({
      status: 'idle',
      queueLength: 0,
      hasUnsavedChanges: false
    });
  }

  /**
   * Get current save status
   */
  public getStatus(): SaveStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status changes
   */
  public subscribe(listener: (status: SaveStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current status
    listener(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get save history
   */
  public getSaveHistory(): SaveResult[] {
    return [...this.saveHistory];
  }

  /**
   * Check if there are pending saves
   */
  public hasPendingSaves(): boolean {
    return this.saveQueue.length > 0 || this.currentSave !== null;
  }

  /**
   * Update auto-save options
   */
  public updateOptions(newOptions: Partial<AutoSaveOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // Recreate debounced function if delay changed
    if (newOptions.debounceMs) {
      this.debouncedSave.cancel();
      this.debouncedSave = debounceAsync(
        this.performSave.bind(this), 
        this.options.debounceMs
      );
    }
  }

  /**
   * Dispose of the service
   */
  public dispose(): void {
    this.debouncedSave.cancel();
    this.clearQueue();
    this.listeners.clear();
  }

  // Private helper methods

  private updateStatus(updates: Partial<SaveStatus>): void {
    this.status = { ...this.status, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in save status listener:', error);
      }
    });
  }

  private sortQueue(): void {
    this.saveQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  private keepHistorySize(maxSize = 20): void {
    if (this.saveHistory.length > maxSize) {
      this.saveHistory = this.saveHistory.slice(-maxSize);
    }
  }

  private generateId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 