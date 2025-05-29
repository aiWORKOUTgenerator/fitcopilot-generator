/**
 * Unsaved Changes Hook
 * 
 * React hook that detects unsaved changes and provides user confirmation
 * workflows to prevent accidental data loss during navigation or form abandonment.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { debounce } from '../utils';

export interface UnsavedChangesOptions {
  enabled?: boolean;
  debounceMs?: number;
  deepCompare?: boolean;
  excludeFields?: string[];
  confirmOnNavigate?: boolean;
  confirmOnClose?: boolean;
  autoSaveEnabled?: boolean;
}

export interface UnsavedChangesState {
  hasUnsavedChanges: boolean;
  changedFields: string[];
  isComparing: boolean;
  lastSavedAt?: Date;
  lastChangedAt?: Date;
}

export interface UnsavedChangesActions {
  markAsSaved: (data?: any) => void;
  markAsChanged: () => void;
  confirmSave: () => Promise<boolean>;
  confirmDiscard: () => Promise<boolean>;
  resetChanges: () => void;
  getChangedData: () => any;
  getOriginalData: () => any;
}

export interface UseUnsavedChangesReturn extends UnsavedChangesState, UnsavedChangesActions {
  // Confirmation modal state
  showConfirmation: boolean;
  confirmationType: 'save' | 'discard' | 'navigate' | null;
  confirmationMessage: string;
  
  // Modal actions
  handleConfirmSave: () => void;
  handleConfirmDiscard: () => void;
  handleConfirmCancel: () => void;
  
  // Navigation blocking
  blockNavigation: boolean;
  navigationAttempted: boolean;
}

/**
 * Deep comparison utility for objects
 */
function deepEqual(obj1: any, obj2: any, excludeFields: string[] = []): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1).filter(key => !excludeFields.includes(key));
  const keys2 = Object.keys(obj2).filter(key => !excludeFields.includes(key));
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key], excludeFields)) return false;
  }
  
  return true;
}

/**
 * Get changed fields between two objects
 */
function getChangedFields(original: any, current: any, excludeFields: string[] = []): string[] {
  if (!original || !current) return [];
  
  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
  
  for (const key of allKeys) {
    if (excludeFields.includes(key)) continue;
    
    if (!deepEqual(original[key], current[key])) {
      changes.push(key);
    }
  }
  
  return changes;
}

/**
 * Hook for detecting and managing unsaved changes
 */
export function useUnsavedChanges(
  currentData: any,
  savedData: any,
  options: UnsavedChangesOptions = {}
): UseUnsavedChangesReturn {
  const {
    enabled = true,
    debounceMs = 500,
    deepCompare = true,
    excludeFields = ['id', 'createdAt', 'updatedAt', 'lastModified'],
    confirmOnNavigate = true,
    confirmOnClose = true,
    autoSaveEnabled = false
  } = options;

  // State management
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date>();
  const [lastChangedAt, setLastChangedAt] = useState<Date>();
  
  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'save' | 'discard' | 'navigate' | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [blockNavigation, setBlockNavigation] = useState(false);
  const [navigationAttempted, setNavigationAttempted] = useState(false);

  // Refs for stable comparisons
  const savedDataRef = useRef(savedData);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const confirmationResolverRef = useRef<((result: boolean) => void) | null>(null);

  // Update saved data ref when savedData changes
  useEffect(() => {
    savedDataRef.current = savedData;
    if (savedData) {
      setLastSavedAt(new Date());
    }
  }, [savedData]);

  // Debounced comparison function
  const debouncedCompare = useMemo(
    () => debounce((current: any, saved: any) => {
      if (!enabled) return;

      setIsComparing(true);
      
      try {
        const hasChanges = deepCompare 
          ? !deepEqual(current, saved, excludeFields)
          : JSON.stringify(current) !== JSON.stringify(saved);
        
        const fields = deepCompare 
          ? getChangedFields(saved, current, excludeFields)
          : hasChanges ? ['unknown'] : [];

        setHasUnsavedChanges(hasChanges);
        setChangedFields(fields);
        
        if (hasChanges) {
          setLastChangedAt(new Date());
        }

        // Update navigation blocking
        setBlockNavigation(hasChanges && confirmOnNavigate && !autoSaveEnabled);
      } catch (error) {
        console.error('Error comparing data for unsaved changes:', error);
      } finally {
        setIsComparing(false);
      }
    }, debounceMs),
    [enabled, deepCompare, excludeFields, confirmOnNavigate, autoSaveEnabled, debounceMs]
  );

  // Compare data when currentData changes
  useEffect(() => {
    if (currentData && savedDataRef.current) {
      debouncedCompare(currentData, savedDataRef.current);
    }
  }, [currentData, debouncedCompare]);

  // Browser beforeunload handling
  useEffect(() => {
    if (!confirmOnClose || !hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [confirmOnClose, hasUnsavedChanges]);

  // Actions
  const markAsSaved = useCallback((data?: any) => {
    if (data) {
      savedDataRef.current = data;
    }
    setHasUnsavedChanges(false);
    setChangedFields([]);
    setLastSavedAt(new Date());
    setBlockNavigation(false);
  }, []);

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
    setLastChangedAt(new Date());
    if (confirmOnNavigate && !autoSaveEnabled) {
      setBlockNavigation(true);
    }
  }, [confirmOnNavigate, autoSaveEnabled]);

  const confirmSave = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationType('save');
      setConfirmationMessage('Do you want to save your changes before continuing?');
      setShowConfirmation(true);
      confirmationResolverRef.current = resolve;
    });
  }, []);

  const confirmDiscard = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationType('discard');
      setConfirmationMessage('Are you sure you want to discard your unsaved changes?');
      setShowConfirmation(true);
      confirmationResolverRef.current = resolve;
    });
  }, []);

  const resetChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    setChangedFields([]);
    setBlockNavigation(false);
    setNavigationAttempted(false);
  }, []);

  const getChangedData = useCallback(() => {
    if (!currentData || !savedDataRef.current) return null;
    
    const changed: any = {};
    for (const field of changedFields) {
      if (currentData[field] !== undefined) {
        changed[field] = currentData[field];
      }
    }
    return changed;
  }, [currentData, changedFields]);

  const getOriginalData = useCallback(() => {
    return savedDataRef.current;
  }, []);

  // Confirmation modal handlers
  const handleConfirmSave = useCallback(() => {
    setShowConfirmation(false);
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(true);
      confirmationResolverRef.current = null;
    }
    
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    setShowConfirmation(false);
    resetChanges();
    
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(false);
      confirmationResolverRef.current = null;
    }
    
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, [resetChanges]);

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmation(false);
    setNavigationAttempted(false);
    
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(false);
      confirmationResolverRef.current = null;
    }
    
    pendingNavigationRef.current = null;
  }, []);

  return {
    // State
    hasUnsavedChanges,
    changedFields,
    isComparing,
    lastSavedAt,
    lastChangedAt,
    
    // Actions
    markAsSaved,
    markAsChanged,
    confirmSave,
    confirmDiscard,
    resetChanges,
    getChangedData,
    getOriginalData,
    
    // Confirmation modal
    showConfirmation,
    confirmationType,
    confirmationMessage,
    handleConfirmSave,
    handleConfirmDiscard,
    handleConfirmCancel,
    
    // Navigation blocking
    blockNavigation,
    navigationAttempted
  };
}

/**
 * Hook for form-specific unsaved changes detection
 */
export function useFormUnsavedChanges(
  formData: any,
  initialData: any,
  options: UnsavedChangesOptions & {
    validateBeforeSave?: boolean;
    customComparator?: (current: any, initial: any) => boolean;
  } = {}
) {
  const {
    validateBeforeSave = true,
    customComparator,
    ...unsavedOptions
  } = options;

  const unsavedChanges = useUnsavedChanges(formData, initialData, unsavedOptions);

  // Custom comparator override
  useEffect(() => {
    if (customComparator && formData && initialData) {
      const hasChanges = customComparator(formData, initialData);
      if (hasChanges !== unsavedChanges.hasUnsavedChanges) {
        if (hasChanges) {
          unsavedChanges.markAsChanged();
        } else {
          unsavedChanges.markAsSaved();
        }
      }
    }
  }, [formData, initialData, customComparator, unsavedChanges]);

  return unsavedChanges;
}

/**
 * Hook for navigation blocking with unsaved changes
 */
export function useNavigationBlock(
  hasUnsavedChanges: boolean,
  options: {
    message?: string;
    enableBlock?: boolean;
  } = {}
) {
  const { 
    message = 'You have unsaved changes. Are you sure you want to leave?',
    enableBlock = true
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setIsBlocked(hasUnsavedChanges && enableBlock);
  }, [hasUnsavedChanges, enableBlock]);

  // This would integrate with router-specific navigation blocking
  // Implementation depends on routing library (React Router, Next.js Router, etc.)
  
  return {
    isBlocked,
    message,
    blockNavigation: isBlocked
  };
} 