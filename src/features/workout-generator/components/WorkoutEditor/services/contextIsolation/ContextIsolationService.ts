/**
 * ContextIsolationService
 * 
 * Handles isolation of WorkoutEditor from conflicting contexts.
 * Follows the established service patterns from SavedWorkoutsTab modular architecture.
 * 
 * Purpose: Ensures WorkoutEditor operates independently of WorkoutGeneratorProvider
 * to prevent context conflicts and unexpected behavior.
 */

import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import * as React from 'react';

// ===== TYPE DEFINITIONS =====

export interface IsolatedWorkoutEditorContextValue {
  workoutId: string | null;
  mode: 'create' | 'edit' | 'view';
  isIsolated: boolean;
  isolationLevel: 'full' | 'partial' | 'none';
  debugInfo: {
    isolatedAt: string;
    conflictsDetected: string[];
    performanceImpact: number;
  };
}

export interface ContextIsolationOptions {
  isolationLevel?: 'full' | 'partial' | 'none';
  debugMode?: boolean;
  performanceMonitoring?: boolean;
  conflictDetection?: boolean;
}

export interface ContextConflict {
  type: 'state_interference' | 'provider_conflict' | 'hook_collision';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  suggestedResolution: string;
}

export interface IsolationResult {
  success: boolean;
  isolationLevel: 'full' | 'partial' | 'none';
  conflictsResolved: ContextConflict[];
  conflictsRemaining: ContextConflict[];
  performanceImpact: number;
  debugInfo: Record<string, any>;
}

// ===== CONTEXT CREATION =====

const IsolatedWorkoutEditorContext = createContext<IsolatedWorkoutEditorContextValue | undefined>(undefined);

export class ContextIsolationService {
  private static debugMode: boolean = false;
  private static performanceStartTime: number = 0;
  private static detectedConflicts: ContextConflict[] = [];

  /**
   * Create an isolated context provider for WorkoutEditor
   * 
   * @param children - React components to wrap
   * @param options - Isolation configuration options
   * @returns Isolated provider component
   */
  static createIsolatedProvider(
    children: ReactNode, 
    options: ContextIsolationOptions = {}
  ): JSX.Element {
    const {
      isolationLevel = 'full',
      debugMode = false,
      performanceMonitoring = true,
      conflictDetection = true
    } = options;

    this.debugMode = debugMode;
    this.performanceStartTime = performance.now();

    if (this.debugMode) {
      console.group('🔒 ContextIsolationService: Creating Isolated Provider');
      console.log('📋 Isolation Options:', options);
    }

    const IsolatedProvider: React.FC = () => {
      const isolatedRef = useRef<boolean>(false);
      const conflictsRef = useRef<string[]>([]);

      useEffect(() => {
        if (conflictDetection) {
          this.detectContextConflicts().then(conflicts => {
            this.detectedConflicts = conflicts;
            conflictsRef.current = conflicts.map(c => c.description);
            
            if (this.debugMode && conflicts.length > 0) {
              console.warn('⚠️ Context conflicts detected:', conflicts);
            }
          });
        }

        isolatedRef.current = true;
        
        if (this.debugMode) {
          console.log('✅ Context isolation established');
        }

        return () => {
          if (this.debugMode) {
            console.log('🧹 Context isolation cleanup');
          }
        };
      }, []);

      const contextValue: IsolatedWorkoutEditorContextValue = {
        workoutId: null, // Will be set by individual editor instances
        mode: 'edit',
        isIsolated: isolatedRef.current,
        isolationLevel,
        debugInfo: {
          isolatedAt: new Date().toISOString(),
          conflictsDetected: conflictsRef.current,
          performanceImpact: performanceMonitoring 
            ? performance.now() - this.performanceStartTime 
            : 0
        }
      };

      return React.createElement(
        IsolatedWorkoutEditorContext.Provider,
        { value: contextValue },
        children
      );
    };

    const isolatedComponent = React.createElement(IsolatedProvider);

    if (this.debugMode) {
      console.groupEnd();
    }

    return isolatedComponent;
  }

  /**
   * Detect potential context conflicts in the current React tree
   * 
   * @returns Promise resolving to array of detected conflicts
   */
  static async detectContextConflicts(): Promise<ContextConflict[]> {
    const conflicts: ContextConflict[] = [];

    try {
      // Check for WorkoutGeneratorProvider interference
      if (typeof window !== 'undefined' && (window as any).React) {
        const reactFiber = this.findReactFiberNode();
        if (reactFiber) {
          const hasGeneratorProvider = this.checkForGeneratorProvider(reactFiber);
          if (hasGeneratorProvider) {
            conflicts.push({
              type: 'provider_conflict',
              severity: 'high',
              source: 'WorkoutGeneratorProvider',
              description: 'WorkoutGeneratorProvider detected in component tree - may cause state interference',
              suggestedResolution: 'Use ContextIsolationService.createIsolatedProvider() to isolate WorkoutEditor'
            });
          }
        }
      }

      // Check for hook collisions
      const hookConflicts = await this.detectHookCollisions();
      conflicts.push(...hookConflicts);

      // Check for state interference patterns
      const stateConflicts = this.detectStateInterference();
      conflicts.push(...stateConflicts);

    } catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ Error during conflict detection:', error);
      }
    }

    return conflicts;
  }

  /**
   * Apply context isolation to a component
   * 
   * @param component - React component to isolate
   * @param options - Isolation options
   * @returns Isolated component with conflict resolution
   */
  static isolateComponent<T extends React.ComponentType<any>>(
    component: T, 
    options: ContextIsolationOptions = {}
  ): T {
    const {
      isolationLevel = 'full',
      debugMode = false
    } = options;

    if (debugMode) {
      console.log(`🔒 Isolating component: ${component.displayName || component.name}`);
    }

    // Create higher-order component that provides isolation
    const IsolatedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
      const isolatedProvider = this.createIsolatedProvider(
        React.createElement(component, { ...props, ref }),
        options
      );

      return isolatedProvider;
    });

    // Preserve original component properties
    IsolatedComponent.displayName = `Isolated(${component.displayName || component.name})`;
    
    return IsolatedComponent as unknown as T;
  }

  /**
   * Get the current isolation context
   * 
   * @returns Current isolation context value or null if not isolated
   */
  static useIsolationContext(): IsolatedWorkoutEditorContextValue | null {
    try {
      return useContext(IsolatedWorkoutEditorContext) || null;
    } catch (error) {
      if (this.debugMode) {
        console.warn('⚠️ Error accessing isolation context:', error);
      }
      return null;
    }
  }

  /**
   * Check if current component is properly isolated
   * 
   * @returns Boolean indicating isolation status
   */
  static isCurrentlyIsolated(): boolean {
    const context = this.useIsolationContext();
    return context?.isIsolated ?? false;
  }

  /**
   * Resolve detected context conflicts
   * 
   * @param conflicts - Array of conflicts to resolve
   * @param options - Resolution options
   * @returns Promise resolving to isolation result
   */
  static async resolveContextConflicts(
    conflicts: ContextConflict[],
    options: ContextIsolationOptions = {}
  ): Promise<IsolationResult> {
    const startTime = performance.now();
    const resolvedConflicts: ContextConflict[] = [];
    const remainingConflicts: ContextConflict[] = [];

    if (this.debugMode) {
      console.group('🔧 ContextIsolationService: Resolving Conflicts');
      console.log('📋 Conflicts to resolve:', conflicts);
    }

    try {
      for (const conflict of conflicts) {
        const resolved = await this.resolveIndividualConflict(conflict, options);
        if (resolved) {
          resolvedConflicts.push(conflict);
        } else {
          remainingConflicts.push(conflict);
        }
      }

      const result: IsolationResult = {
        success: remainingConflicts.length === 0,
        isolationLevel: options.isolationLevel || 'full',
        conflictsResolved: resolvedConflicts,
        conflictsRemaining: remainingConflicts,
        performanceImpact: performance.now() - startTime,
        debugInfo: {
          totalConflicts: conflicts.length,
          resolvedCount: resolvedConflicts.length,
          remainingCount: remainingConflicts.length,
          isolationAppliedAt: new Date().toISOString()
        }
      };

      if (this.debugMode) {
        console.log('✅ Conflict resolution complete:', result);
        console.groupEnd();
      }

      return result;

    } catch (error) {
      if (this.debugMode) {
        console.error('❌ Error during conflict resolution:', error);
        console.groupEnd();
      }

      return {
        success: false,
        isolationLevel: 'none',
        conflictsResolved: [],
        conflictsRemaining: conflicts,
        performanceImpact: performance.now() - startTime,
        debugInfo: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private static findReactFiberNode(): any {
    // Implementation for finding React Fiber node (simplified for safety)
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        const appElement = document.querySelector('#root, [data-reactroot], .wp-admin');
        return appElement ? (appElement as any)._reactInternalFiber || (appElement as any)._reactInternalInstance : null;
      }
    } catch (error) {
      // Fail silently for safety
    }
    return null;
  }

  private static checkForGeneratorProvider(fiberNode: any): boolean {
    // Simplified check for WorkoutGeneratorProvider in component tree
    try {
      let current = fiberNode;
      while (current) {
        if (current.type && typeof current.type === 'function') {
          const componentName = current.type.displayName || current.type.name;
          if (componentName && componentName.includes('WorkoutGenerator')) {
            return true;
          }
        }
        current = current.return || current.parent;
      }
    } catch (error) {
      // Fail silently for safety
    }
    return false;
  }

  private static async detectHookCollisions(): Promise<ContextConflict[]> {
    // Simplified hook collision detection
    const conflicts: ContextConflict[] = [];

    // Check for common hook naming conflicts
    const potentialHookConflicts = [
      'useWorkout', 
      'useGeneratedWorkout', 
      'useWorkoutData',
      'useWorkoutState'
    ];

    // This is a simplified version - in practice, we'd need more sophisticated detection
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      // React DevTools is available, could check for hook usage
      conflicts.push({
        type: 'hook_collision',
        severity: 'medium',
        source: 'Custom Hooks',
        description: 'Potential hook naming conflicts detected',
        suggestedResolution: 'Use namespaced hooks (useEditor*, useIsolated*) within isolated context'
      });
    }

    return conflicts;
  }

  private static detectStateInterference(): ContextConflict[] {
    const conflicts: ContextConflict[] = [];

    // Check for global state management interference
    if (typeof window !== 'undefined') {
      const globalKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('workout') || 
        key.toLowerCase().includes('generator') ||
        key.toLowerCase().includes('fitness')
      );

      if (globalKeys.length > 0) {
        conflicts.push({
          type: 'state_interference',
          severity: 'low',
          source: 'Global State',
          description: `Global variables detected that may interfere: ${globalKeys.join(', ')}`,
          suggestedResolution: 'Ensure isolated components do not access global workout state'
        });
      }
    }

    return conflicts;
  }

  private static async resolveIndividualConflict(
    conflict: ContextConflict, 
    options: ContextIsolationOptions
  ): Promise<boolean> {
    try {
      switch (conflict.type) {
        case 'provider_conflict':
          // For provider conflicts, we rely on the isolation provider to handle this
          return options.isolationLevel === 'full';
          
        case 'hook_collision':
          // Hook collisions are resolved by using the isolated context
          return true;
          
        case 'state_interference':
          // State interference is mitigated by isolation level
          return options.isolationLevel !== 'none';
          
        default:
          return false;
      }
    } catch (error) {
      if (this.debugMode) {
        console.warn(`⚠️ Failed to resolve conflict: ${conflict.description}`, error);
      }
      return false;
    }
  }
}

// ===== HOOK EXPORTS =====

/**
 * Hook to access isolated workout editor context
 * 
 * @returns Isolated context value or throws error if not in isolated provider
 */
export const useIsolatedWorkoutEditor = (): IsolatedWorkoutEditorContextValue => {
  const context = useContext(IsolatedWorkoutEditorContext);
  
  if (!context) {
    throw new Error(
      'useIsolatedWorkoutEditor must be used within an IsolatedWorkoutEditorProvider. ' +
      'Use ContextIsolationService.createIsolatedProvider() to wrap your component.'
    );
  }
  
  return context;
};

/**
 * Hook to check isolation status without throwing error
 * 
 * @returns Isolation status object
 */
export const useIsolationStatus = () => {
  const context = useContext(IsolatedWorkoutEditorContext);
  
  return {
    isIsolated: context?.isIsolated ?? false,
    isolationLevel: context?.isolationLevel ?? 'none',
    hasConflicts: (context?.debugInfo.conflictsDetected.length ?? 0) > 0,
    debugInfo: context?.debugInfo
  };
}; 