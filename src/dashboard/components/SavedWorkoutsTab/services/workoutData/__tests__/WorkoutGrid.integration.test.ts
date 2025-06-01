/**
 * WorkoutGrid Integration Tests
 * 
 * Tests the complete integration of WorkoutGrid with extracted services.
 * Part of Week 1 Foundation Sprint - Day 3 validation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedWorkoutGrid } from '../../WorkoutGrid';
import { WorkoutTransformer } from '../WorkoutTransformer';
import { FilterEngine } from '../../filtering/FilterEngine';

// Mock the extracted services
jest.mock('../WorkoutTransformer');
jest.mock('../../filtering/FilterEngine');

const mockWorkoutTransformer = WorkoutTransformer as jest.Mocked<typeof WorkoutTransformer>;
const mockFilterEngine = FilterEngine as jest.Mocked<typeof FilterEngine>;

describe('WorkoutGrid Integration Tests', () => {
  const mockWorkouts = [
    {
      id: 1,
      title: 'Test Workout 1',
      workout_data: JSON.stringify({
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 },
          { name: 'Squats', sets: 3, reps: 15 }
        ]
      }),
      created_at: '2023-01-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Workout 2',
      workout_data: JSON.stringify({
        exercises: [
          { name: 'Burpees', sets: 3, reps: 8 }
        ]
      }),
      created_at: '2023-01-02T10:00:00Z'
    }
  ];

  const mockTransformedWorkouts = [
    {
      id: 1,
      title: 'Test Workout 1',
      description: '',
      duration: 30,
      difficulty: 'intermediate' as const,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 10 },
        { name: 'Squats', sets: 3, reps: 15 }
      ],
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z',
      workoutType: 'Strength',
      equipment: [],
      isCompleted: false,
      tags: [],
      createdAt: '2023-01-01T10:00:00Z',
      lastModified: '2023-01-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Test Workout 2',
      description: '',
      duration: 20,
      difficulty: 'advanced' as const,
      exercises: [
        { name: 'Burpees', sets: 3, reps: 8 }
      ],
      created_at: '2023-01-02T10:00:00Z',
      updated_at: '2023-01-02T10:00:00Z',
      workoutType: 'HIIT',
      equipment: [],
      isCompleted: false,
      tags: [],
      createdAt: '2023-01-02T10:00:00Z',
      lastModified: '2023-01-02T10:00:00Z'
    }
  ];

  const defaultProps = {
    workouts: mockWorkouts,
    onWorkoutSelect: jest.fn(),
    onWorkoutEdit: jest.fn(),
    onWorkoutDelete: jest.fn(),
    onWorkoutDuplicate: jest.fn(),
    onCreateSimilar: jest.fn(),
    onMarkComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup service mocks
    mockWorkoutTransformer.transformMultipleForDisplay.mockReturnValue(mockTransformedWorkouts);
    mockFilterEngine.getDefaultFilters.mockReturnValue({
      difficulty: [],
      workoutType: [],
      equipment: [],
      duration: { min: 0, max: 120 },
      completed: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      tags: [],
      createdDate: { start: null, end: null },
      searchQuery: ''
    });
    mockFilterEngine.applyFilters.mockImplementation((workouts) => workouts);
    mockFilterEngine.clearFilters.mockReturnValue({
      difficulty: [],
      workoutType: [],
      equipment: [],
      duration: { min: 0, max: 120 },
      completed: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      tags: [],
      createdDate: { start: null, end: null },
      searchQuery: ''
    });
  });

  describe('Service Integration', () => {
    it('should use WorkoutTransformer service for data transformation', () => {
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(mockWorkoutTransformer.transformMultipleForDisplay).toHaveBeenCalledWith(mockWorkouts);
    });

    it('should use FilterEngine service for default filters', () => {
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(mockFilterEngine.getDefaultFilters).toHaveBeenCalled();
    });

    it('should use FilterEngine service for filtering workouts', () => {
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(mockFilterEngine.applyFilters).toHaveBeenCalledWith(
        mockTransformedWorkouts,
        expect.objectContaining({
          difficulty: [],
          workoutType: [],
          equipment: []
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle transformation errors gracefully', () => {
      mockWorkoutTransformer.transformMultipleForDisplay.mockImplementation(() => {
        throw new Error('Transformation failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔄 WorkoutGrid: Error filtering workouts:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should track workouts with missing exercises', () => {
      const workoutsWithMissingExercises = [
        ...mockTransformedWorkouts,
        {
          id: 3,
          title: 'Empty Workout',
          description: '',
          duration: 30,
          difficulty: 'intermediate' as const,
          exercises: [], // Empty exercises array
          created_at: '2023-01-03T10:00:00Z',
          updated_at: '2023-01-03T10:00:00Z',
          workoutType: 'Unknown',
          equipment: [],
          isCompleted: false,
          tags: [],
          createdAt: '2023-01-03T10:00:00Z',
          lastModified: '2023-01-03T10:00:00Z'
        }
      ];

      mockWorkoutTransformer.transformMultipleForDisplay.mockReturnValue(workoutsWithMissingExercises);
      
      // Set NODE_ENV to development to show debug info
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(screen.getByText(/1 workout with transformation issues/)).toBeInTheDocument();
      expect(screen.getByText(/Workout 3: No exercises found/)).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(<EnhancedWorkoutGrid {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('generic', { name: /loading/i })).toBeInTheDocument();
      expect(screen.getAllByClassName('workout-card-skeleton')).toHaveLength(6);
    });

    it('should show empty state when no workouts provided', () => {
      render(<EnhancedWorkoutGrid {...defaultProps} workouts={[]} />);
      
      expect(screen.getByText('No Saved Workouts')).toBeInTheDocument();
      expect(screen.getByText('Start by generating your first workout to see it here.')).toBeInTheDocument();
    });
  });

  describe('Empty State Navigation', () => {
    it('should attempt to scroll to generator when create button clicked', () => {
      const mockScrollIntoView = jest.fn();
      const mockQuerySelector = jest.spyOn(document, 'querySelector').mockReturnValue({
        scrollIntoView: mockScrollIntoView
      } as any);

      render(<EnhancedWorkoutGrid {...defaultProps} workouts={[]} />);
      
      const createButton = screen.getByText('Create Your First Workout');
      fireEvent.click(createButton);
      
      expect(mockQuerySelector).toHaveBeenCalledWith('.workout-generator-feature, [data-tab="generator"], .workout-generator');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      
      mockQuerySelector.mockRestore();
    });

    it('should dispatch custom event when generator element not found', () => {
      const mockQuerySelector = jest.spyOn(document, 'querySelector').mockReturnValue(null);
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');

      render(<EnhancedWorkoutGrid {...defaultProps} workouts={[]} />);
      
      const createButton = screen.getByText('Create Your First Workout');
      fireEvent.click(createButton);
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        new CustomEvent('fitcopilot:navigate-to-generator')
      );
      
      mockQuerySelector.mockRestore();
      mockDispatchEvent.mockRestore();
    });
  });

  describe('Filter Management', () => {
    it('should use FilterEngine.clearFilters when clearing filters', async () => {
      mockFilterEngine.applyFilters.mockReturnValue([]); // Return empty to show no results
      
      render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      // Should show "no results" UI
      await waitFor(() => {
        expect(screen.getByText('No workouts match your filters')).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText('Clear All Filters');
      fireEvent.click(clearButton);
      
      expect(mockFilterEngine.clearFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: [],
          workoutType: [],
          equipment: []
        })
      );
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility exports', () => {
      // Import the legacy exports
      const { WorkoutGrid, default: DefaultWorkoutGrid } = require('../../WorkoutGrid');
      
      expect(WorkoutGrid).toBe(EnhancedWorkoutGrid);
      expect(DefaultWorkoutGrid).toBe(EnhancedWorkoutGrid);
    });
  });

  describe('Performance', () => {
    it('should not re-transform workouts unnecessarily', () => {
      const { rerender } = render(<EnhancedWorkoutGrid {...defaultProps} />);
      
      expect(mockWorkoutTransformer.transformMultipleForDisplay).toHaveBeenCalledTimes(1);
      
      // Re-render with same workouts
      rerender(<EnhancedWorkoutGrid {...defaultProps} />);
      
      // Should not call transform again due to useMemo
      expect(mockWorkoutTransformer.transformMultipleForDisplay).toHaveBeenCalledTimes(1);
      
      // Re-render with different workouts
      rerender(<EnhancedWorkoutGrid {...defaultProps} workouts={[...mockWorkouts, { id: 3, title: 'New' }]} />);
      
      // Now it should call transform again
      expect(mockWorkoutTransformer.transformMultipleForDisplay).toHaveBeenCalledTimes(2);
    });
  });
}); 