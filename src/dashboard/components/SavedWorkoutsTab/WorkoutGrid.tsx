/**
 * Enhanced Workout Grid Component
 * 
 * Displays saved workouts in a responsive grid layout with enhanced filtering,
 * search, bulk selection capabilities, and improved visual design.
 * 
 * Updated for Week 1 Foundation Sprint - now uses extracted services.
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Grid, 
  List, 
  MoreHorizontal,
  CheckSquare,
  Square,
  Trash2,
  Copy,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import AdvancedWorkoutFilters from './AdvancedWorkoutFilters';
import EnhancedWorkoutCard from './EnhancedWorkoutCard';
import './SavedWorkoutsTab.scss';
import './AdvancedFilters.scss';
import './EnhancedWorkoutCard.scss';

// Import all services from centralized index
import { 
  WorkoutTransformer, 
  FilterEngine, 
  WorkoutFormatters,
  UI_CONSTANTS,
  type DisplayWorkout,
  type WorkoutFilters 
} from './services';

// UNIFIED DATA LAYER: Use the same service as modal components
import { getWorkouts } from '../../../features/workout-generator/services/workoutService';
import { GeneratedWorkout } from '../../../features/workout-generator/types/workout';

// 🚀 CONTEXT INTEGRATION: Connect to WorkoutContext for automatic refresh
import { useWorkoutContext } from '../../../features/workout-generator/context/WorkoutContext';

// Import version-aware functionality
import { useVersionAwareWorkouts, useWorkoutDataQuality } from '../../hooks/useVersionAwareWorkouts';

interface EnhancedWorkoutGridProps {
  // DEPRECATED: workouts prop - now using unified service internally
  workouts?: any[]; // Accept any workout format from API (for backward compatibility)
  isLoading?: boolean;
  onWorkoutSelect: (workout: DisplayWorkout) => void;
  onWorkoutEdit: (workout: DisplayWorkout) => void;
  onWorkoutDelete: (workoutId: string) => void;
  onWorkoutDuplicate: (workout: DisplayWorkout) => void;
  onCreateSimilar: (workout: DisplayWorkout) => void;
  onMarkComplete: (workoutId: string) => void;
  onBulkDelete?: (workoutIds: string[]) => void;
  onToggleFavorite?: (workoutId: string) => void;
  onRateWorkout?: (workoutId: string, rating: number) => void;
  
  // NEW: Unified data service options
  enableUnifiedDataService?: boolean;
  enableVersionTracking?: boolean;
  showDataQuality?: boolean;
}

/**
 * Enhanced WorkoutGrid displays saved workouts with advanced filtering and search
 */
export const EnhancedWorkoutGrid: React.FC<EnhancedWorkoutGridProps> = ({
  workouts: legacyWorkouts, // Renamed for clarity
  isLoading: legacyIsLoading = false,
  enableUnifiedDataService = true, // NEW: Enable unified service by default
  enableVersionTracking = true,
  showDataQuality = true,
  onWorkoutSelect,
  onWorkoutEdit,
  onWorkoutDelete,
  onWorkoutDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onBulkDelete,
  onToggleFavorite,
  onRateWorkout
}) => {
  // 🚀 CONTEXT INTEGRATION: Use WorkoutContext for unified data management
  const contextData = useWorkoutContext();

  // 🚀 LEGACY: Version-aware workout data (for comparison/fallback)
  const versionAwareData = useVersionAwareWorkouts();
  const dataQuality = useWorkoutDataQuality(versionAwareData.stats);

  // 🚀 UNIFIED DATA SELECTION: Choose data source based on configuration
  const { workouts, isLoading, error } = useMemo(() => {
    if (enableUnifiedDataService) {
      // 🚀 CONTEXT INTEGRATION: Use WorkoutContext data for automatic refresh
      console.log('[WorkoutGrid] 🔄 Using WorkoutContext data for automatic refresh:', {
        contextWorkoutCount: contextData.workouts.length,
        contextLoading: contextData.isLoading,
        contextError: contextData.error,
        timestamp: new Date().toISOString()
      });
      
      return {
        workouts: contextData.workouts,
        isLoading: contextData.isLoading,
        error: contextData.error
      };
    } else if (enableVersionTracking) {
      // Fallback to version-aware service
      return {
        workouts: versionAwareData.workouts,
        isLoading: versionAwareData.isLoading,
        error: versionAwareData.error
      };
    } else {
      // Legacy fallback
      return {
        workouts: legacyWorkouts || [],
        isLoading: legacyIsLoading,
        error: null
      };
    }
  }, [
    enableUnifiedDataService, 
    enableVersionTracking, 
    contextData.workouts,
    contextData.isLoading,
    contextData.error,
    versionAwareData.workouts,
    versionAwareData.isLoading,
    versionAwareData.error,
    legacyWorkouts, 
    legacyIsLoading
  ]);

  // 🚀 MANUAL REFRESH: Expose refresh function for user-triggered refreshes
  const handleManualRefresh = useCallback(() => {
    console.log('[WorkoutGrid] 🔄 Manual refresh triggered by user');
    if (enableUnifiedDataService) {
      // 🚀 CONTEXT INTEGRATION: Use context refresh method for consistency
      console.log('[WorkoutGrid] Using context refreshWorkouts method for manual refresh');
      contextData.refreshWorkouts();
    } else if (enableVersionTracking) {
      versionAwareData.refreshWorkoutVersions(undefined, true); // Force refresh
    }
  }, [enableUnifiedDataService, enableVersionTracking, contextData, versionAwareData]);

  const [filters, setFilters] = useState<WorkoutFilters>(
    // 🚀 WEEK 1 IMPROVEMENT: Use FilterEngine.getDefaultFilters
    FilterEngine.getDefaultFilters()
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());
  const [transformationErrors, setTransformationErrors] = useState<Map<string, string>>(new Map());

  // Filter and sort workouts based on current filters and search
  const filteredWorkouts = useMemo(() => {
    try {
      let processedWorkouts: DisplayWorkout[];
      
      if (enableUnifiedDataService) {
        // 🚀 NEW: Transform unified service workouts using the same pattern as modals
        console.log('[WorkoutGrid] Processing workouts from unified service:', {
          workoutCount: workouts.length,
          sampleIds: workouts.slice(0, 3).map(w => w.id)
        });
        
        processedWorkouts = workouts.map(workout => ({
          id: workout.id,
          title: workout.title || 'Untitled Workout',
          description: workout.description || '',
          duration: workout.duration || 30,
          difficulty: workout.difficulty || 'intermediate',
          exercises: workout.exercises || [],
          equipment: workout.equipment || [],
          created_at: workout.created_at || new Date().toISOString(),
          updated_at: workout.updated_at || new Date().toISOString(),
          workoutType: workout.workoutType || 'General',
          isCompleted: workout.isCompleted || false,
          completedAt: workout.completedAt,
          tags: workout.tags || [],
          createdAt: workout.created_at || new Date().toISOString(), // Backward compatibility
          lastModified: workout.lastModified || workout.updated_at || new Date().toISOString(), // Backward compatibility
          isFavorite: workout.isFavorite || false,
          rating: workout.rating
        })) as DisplayWorkout[];
        
        // Track any data issues
        const errors = new Map<string, string>();
        processedWorkouts.forEach(workout => {
          if (workout.exercises.length === 0 && workout.id) {
            errors.set(workout.id.toString(), 'No exercises found - may indicate data transformation issue');
          }
        });
        setTransformationErrors(errors);
        
      } else if (enableVersionTracking) {
        // 🚀 LEGACY: Use enhanced workouts directly (already processed)
        processedWorkouts = workouts as DisplayWorkout[];
        
        // Track any version-related issues
        const errors = new Map<string, string>();
        if (versionAwareData.versionErrors.size > 0) {
          versionAwareData.versionErrors.forEach((error, workoutId) => {
            errors.set(workoutId, `Version error: ${error}`);
          });
        }
        
        processedWorkouts.forEach(workout => {
          if (workout.exercises.length === 0 && workout.id) {
            errors.set(workout.id.toString(), 'No exercises found - may indicate data transformation issue');
          }
        });
        setTransformationErrors(errors);
      } else {
        // 🚀 LEGACY: Use old transformation logic for backward compatibility
        processedWorkouts = WorkoutTransformer.transformMultipleForDisplay(workouts);
        
        // Track any transformation errors for debugging
        const errors = new Map<string, string>();
        processedWorkouts.forEach(workout => {
          if (workout.exercises.length === 0 && workout.id) {
            errors.set(workout.id.toString(), 'No exercises found - may indicate data transformation issue');
          }
        });
        setTransformationErrors(errors);
      }
      
      // Apply all filters and sorting using the FilterEngine service
      return FilterEngine.applyFilters(processedWorkouts, filters);
    } catch (error) {
      console.error('🔄 WorkoutGrid: Error filtering workouts:', error);
      return [];
    }
  }, [workouts, filters, enableUnifiedDataService, enableVersionTracking, versionAwareData.versionErrors]);

  // 🚀 PERFORMANCE: Virtualization for large lists
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  // 🚀 PERFORMANCE: Calculate visible items for virtualization
  const visibleWorkouts = useMemo(() => {
    if (filteredWorkouts.length <= 50) {
      // For small lists, show all items
      return filteredWorkouts;
    }
    
    // For large lists, show only visible range
    return filteredWorkouts.slice(visibleRange.start, visibleRange.end);
  }, [filteredWorkouts, visibleRange]);

  // 🚀 PERFORMANCE: Scroll handler for virtualization
  const handleScroll = useCallback(() => {
    if (!containerRef.current || filteredWorkouts.length <= 50) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = viewMode === 'grid' ? 300 : 120; // Approximate heights
    const containerHeight = container.clientHeight;
    
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 5; // Buffer
    const end = Math.min(start + visibleCount, filteredWorkouts.length);
    
    setVisibleRange({ start, end });
  }, [filteredWorkouts.length, viewMode]);

  // 🚀 PERFORMANCE: Setup scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || filteredWorkouts.length <= 50) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, filteredWorkouts.length]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    // 🚀 WEEK 1 IMPROVEMENT: Use FilterEngine.clearFilters
    setFilters(FilterEngine.clearFilters(filters));
  }, [filters]);

  // Selection handlers
  const handleToggleSelection = useCallback((workoutId: string) => {
    setSelectedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedWorkouts.size === filteredWorkouts.length) {
      setSelectedWorkouts(new Set());
    } else {
      setSelectedWorkouts(new Set(filteredWorkouts.map(w => w.id.toString())));
    }
  }, [selectedWorkouts, filteredWorkouts]);

  const handleBulkDelete = useCallback(() => {
    if (selectedWorkouts.size > 0 && onBulkDelete) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedWorkouts.size} workout${selectedWorkouts.size !== 1 ? 's' : ''}?`
      );
      if (confirmDelete) {
        onBulkDelete(Array.from(selectedWorkouts));
        setSelectedWorkouts(new Set());
        setIsSelectionMode(false);
      }
    }
  }, [selectedWorkouts, onBulkDelete]);

  // 🚀 PERFORMANCE: Memoized workout card for better rendering performance
  const MemoizedEnhancedWorkoutCard = React.memo(EnhancedWorkoutCard);

  if (isLoading) {
    return (
      <div className="enhanced-workout-grid loading">
        <div className="loading-grid">
          {Array.from({ length: UI_CONSTANTS.SKELETON_CARDS_COUNT }).map((_, index) => (
            <div key={index} className="workout-card-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="enhanced-workout-grid empty">
        <div className="empty-state">
          <div className="empty-icon">🏋️‍♀️</div>
          <h3 className="empty-title">No Saved Workouts</h3>
          <p className="empty-description">
            Start by generating your first workout to see it here.
          </p>
          <Button 
            variant="primary" 
            onClick={() => {
              // 🚀 WEEK 1 IMPROVEMENT: More robust navigation to generator
              const generator = document.querySelector('.workout-generator-feature, [data-tab="generator"], .workout-generator');
              if (generator) {
                generator.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Fallback: dispatch custom event for parent component to handle
                window.dispatchEvent(new CustomEvent('fitcopilot:navigate-to-generator'));
              }
            }}
          >
            Create Your First Workout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-workout-grid">
      {/* Advanced Filters */}
      <AdvancedWorkoutFilters
        filters={filters}
        workouts={workouts}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onSearchChange={handleSearchChange}
      />

      {/* 🚀 UNIFIED: Data Quality Indicator with service selection */}
      {showDataQuality && (
        <div className="workout-data-quality-indicator" style={{
          background: enableUnifiedDataService ? '#10b98120' : dataQuality.color + '20',
          border: `1px solid ${enableUnifiedDataService ? '#10b98140' : dataQuality.color + '40'}`,
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: enableUnifiedDataService ? '#10b981' : dataQuality.color 
          }}></div>
          
          {enableUnifiedDataService ? (
            <>
              <span style={{ color: '#10b981', fontWeight: '500' }}>
                Unified Data Service (Same as Modals)
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {workouts.length} workouts loaded • Always fresh data
              </span>
              {isLoading ? (
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  🔄 Loading fresh data...
                </span>
              ) : (
                <button
                  onClick={handleManualRefresh}
                  style={{
                    background: 'none',
                    border: '1px solid #10b981',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                  title="Refresh workout data using unified service"
                >
                  🔄 Refresh
                </button>
              )}
            </>
          ) : enableVersionTracking ? (
            <>
              <span style={{ color: dataQuality.color, fontWeight: '500' }}>
                {dataQuality.message}
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {versionAwareData.stats.freshWorkouts} fresh, {versionAwareData.stats.staleWorkouts} stale, {versionAwareData.stats.expiredWorkouts} expired
              </span>
              {versionAwareData.isLoadingVersions ? (
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  🔄 Checking versions...
                </span>
              ) : (
                <button
                  onClick={handleManualRefresh}
                  style={{
                    background: 'none',
                    border: `1px solid ${dataQuality.color}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    color: dataQuality.color,
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                  title="Refresh workout data and versions"
                >
                  🔄 Refresh
                </button>
              )}
            </>
          ) : (
            <>
              <span style={{ color: '#6b7280', fontWeight: '500' }}>
                Legacy Data Service
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {workouts.length} workouts • Using legacy transformation
              </span>
            </>
          )}
        </div>
      )}

      {/* 🚀 UNIFIED: Show transformation errors and service debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="workout-grid-debug-info" style={{
          background: enableUnifiedDataService ? '#f0f9ff' : '#fff3cd',
          border: `1px solid ${enableUnifiedDataService ? '#0ea5e9' : '#ffeaa7'}`,
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <details open={transformationErrors.size > 0}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              🔧 Development Debug Info • 
              {enableUnifiedDataService ? 'Unified Service' : enableVersionTracking ? 'Version-Aware Service' : 'Legacy Service'}
              {transformationErrors.size > 0 && ` • ⚠️ ${transformationErrors.size} issue${transformationErrors.size !== 1 ? 's' : ''}`}
            </summary>
            
            <div style={{ marginTop: '8px' }}>
              <div><strong>Data Source:</strong> {enableUnifiedDataService ? 'Same service as WorkoutEditorModal (workoutService.ts)' : enableVersionTracking ? 'Version-aware service' : 'Legacy props'}</div>
              <div><strong>Workout Count:</strong> {workouts.length}</div>
              <div><strong>Service Status:</strong> {isLoading ? 'Loading...' : error ? `Error: ${error}` : 'Loaded successfully'}</div>
              {enableUnifiedDataService && (
                <div><strong>Context Data:</strong> Using WorkoutContext for real-time updates</div>
              )}
              
              {transformationErrors.size > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Data Issues:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {Array.from(transformationErrors.entries()).map(([id, error]) => (
                      <li key={id}>Workout {id}: {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {workouts.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Sample Workout Data:</strong>
                  <pre style={{ fontSize: '10px', marginTop: '4px', padding: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'auto' }}>
                    {JSON.stringify({
                      id: workouts[0].id,
                      title: workouts[0].title,
                      exerciseCount: workouts[0].exercises?.length || 0,
                      duration: workouts[0].duration,
                      version: workouts[0].version || 'N/A',
                      lastModified: workouts[0].lastModified || workouts[0].updated_at || 'N/A'
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Toolbar */}
      <div className="workout-grid-toolbar">
        <div className="toolbar-left">
          <div className="results-count">
            {WorkoutFormatters.formatExerciseCount(filteredWorkouts.length).replace('exercises', 'workouts')}
            {transformationErrors.size > 0 && (
              <span className="error-indicator" title={`${transformationErrors.size} workouts have data issues`}>
                ⚠️ {transformationErrors.size} with issues
              </span>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          {/* View mode toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          {/* Selection mode toggle */}
          <button
            className={`selection-toggle ${isSelectionMode ? 'active' : ''}`}
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) {
                setSelectedWorkouts(new Set());
              }
            }}
            title={isSelectionMode ? 'Exit selection mode' : 'Select multiple workouts'}
          >
            {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            {isSelectionMode ? 'Exit Select' : 'Select'}
          </button>

          {/* Bulk actions */}
          {isSelectionMode && selectedWorkouts.size > 0 && (
            <div className="bulk-actions">
              <button
                className="bulk-action-btn select-all"
                onClick={handleSelectAll}
                title={selectedWorkouts.size === filteredWorkouts.length ? 'Deselect all' : 'Select all'}
              >
                {selectedWorkouts.size === filteredWorkouts.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {onBulkDelete && (
                <button
                  className="bulk-action-btn delete"
                  onClick={handleBulkDelete}
                  title={`Delete ${selectedWorkouts.size} selected workouts`}
                >
                  <Trash2 size={14} />
                  Delete ({selectedWorkouts.size})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Workout Grid/List */}
      {filteredWorkouts.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3 className="no-results-title">No workouts match your filters</h3>
          <p className="no-results-description">
            Try adjusting your search terms or filters to find more workouts.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className={`enhanced-workouts-container ${viewMode}`}
          style={{
            maxHeight: filteredWorkouts.length > 50 ? '600px' : 'auto',
            overflowY: filteredWorkouts.length > 50 ? 'auto' : 'visible'
          }}
        >
          {/* 🚀 PERFORMANCE: Show performance indicator for large lists */}
          {filteredWorkouts.length > 50 && process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'sticky',
              top: 0,
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '4px',
              padding: '8px',
              marginBottom: '12px',
              fontSize: '12px',
              zIndex: 10
            }}>
              🚀 Virtualization Active: Showing {visibleWorkouts.length} of {filteredWorkouts.length} workouts
            </div>
          )}
          
          {visibleWorkouts.map(workout => (
            <MemoizedEnhancedWorkoutCard
              key={`workout-${workout.id}-${workout.lastModified || workout.updated_at}`}
              workout={workout as any}
              viewMode={viewMode}
              isSelected={selectedWorkouts.has(workout.id.toString())}
              isSelectionMode={isSelectionMode}
              enableVersionDisplay={enableVersionTracking && !enableUnifiedDataService}
              showVersionDebug={process.env.NODE_ENV === 'development'}
              onSelect={() => onWorkoutSelect(workout)}
              onEdit={() => onWorkoutEdit(workout)}
              onDelete={() => onWorkoutDelete(workout.id.toString())}
              onDuplicate={() => onWorkoutDuplicate(workout)}
              onCreateSimilar={() => onCreateSimilar(workout)}
              onMarkComplete={() => onMarkComplete(workout.id.toString())}
              onToggleSelection={handleToggleSelection}
              onToggleFavorite={onToggleFavorite}
              onRate={onRateWorkout}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Maintain backward compatibility
export const WorkoutGrid = EnhancedWorkoutGrid;
export default EnhancedWorkoutGrid; 