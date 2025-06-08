/**
 * Tests for useMuscleSelection hook
 */

import { renderHook, act } from '@testing-library/react';
import { useMuscleSelection } from '../useMuscleSelection';
import { MuscleGroup } from '../../types/muscle-types';
import { MUSCLE_SELECTION_LIMITS } from '../../constants/muscle-data';

// Mock the persistence hook
jest.mock('../useFormPersistence', () => ({
  useFormPersistence: jest.fn(() => ({
    loadData: jest.fn(() => null),
    saveData: jest.fn(),
    clearData: jest.fn(),
    hasStoredData: false
  }))
}));

describe('useMuscleSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    expect(result.current.selectionData.selectedGroups).toEqual([]);
    expect(result.current.selectionData.selectedMuscles).toEqual({});
    expect(result.current.canAddMore).toBe(true);
  });

  it('should add muscle groups correctly', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
    });
    
    expect(result.current.selectionData.selectedGroups).toContain(MuscleGroup.Chest);
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).toEqual([]);
    expect(result.current.isGroupSelected(MuscleGroup.Chest)).toBe(true);
  });

  it('should remove muscle groups correctly', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
    });
    
    act(() => {
      result.current.removeMuscleGroup(MuscleGroup.Chest);
    });
    
    expect(result.current.selectionData.selectedGroups).not.toContain(MuscleGroup.Chest);
    expect(result.current.selectionData.selectedGroups).toContain(MuscleGroup.Back);
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).toBeUndefined();
    expect(result.current.isGroupSelected(MuscleGroup.Chest)).toBe(false);
  });

  it('should respect maximum group limit', () => {
    const { result } = renderHook(() => useMuscleSelection(2));
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
      result.current.addMuscleGroup(MuscleGroup.Legs); // Should be ignored
    });
    
    expect(result.current.selectionData.selectedGroups).toHaveLength(2);
    expect(result.current.selectionData.selectedGroups).not.toContain(MuscleGroup.Legs);
    expect(result.current.canAddMore).toBe(false);
  });

  it('should not add duplicate muscle groups', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Chest); // Duplicate
    });
    
    expect(result.current.selectionData.selectedGroups).toHaveLength(1);
    expect(result.current.selectionData.selectedGroups).toContain(MuscleGroup.Chest);
  });

  it('should toggle individual muscles correctly', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
    });
    
    act(() => {
      result.current.toggleMuscle(MuscleGroup.Chest, 'Upper Chest');
    });
    
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).toContain('Upper Chest');
    expect(result.current.isMuscleSelected(MuscleGroup.Chest, 'Upper Chest')).toBe(true);
    
    act(() => {
      result.current.toggleMuscle(MuscleGroup.Chest, 'Upper Chest');
    });
    
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).not.toContain('Upper Chest');
    expect(result.current.isMuscleSelected(MuscleGroup.Chest, 'Upper Chest')).toBe(false);
  });

  it('should not toggle muscles for unselected groups', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.toggleMuscle(MuscleGroup.Chest, 'Upper Chest');
    });
    
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).toBeUndefined();
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
      result.current.toggleMuscle(MuscleGroup.Chest, 'Upper Chest');
    });
    
    act(() => {
      result.current.clearSelection();
    });
    
    expect(result.current.selectionData.selectedGroups).toEqual([]);
    expect(result.current.selectionData.selectedMuscles).toEqual({});
    expect(result.current.canAddMore).toBe(true);
  });

  it('should provide available groups correctly', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
    });
    
    const availableGroups = result.current.getAvailableGroups();
    expect(availableGroups).not.toContain(MuscleGroup.Chest);
    expect(availableGroups).toContain(MuscleGroup.Back);
    expect(availableGroups).toContain(MuscleGroup.Legs);
  });

  it('should generate selection summary correctly', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
      result.current.toggleMuscle(MuscleGroup.Chest, 'Upper Chest');
      result.current.toggleMuscle(MuscleGroup.Back, 'Lats');
    });
    
    const summary = result.current.getSelectionSummary();
    expect(summary.totalGroups).toBe(2);
    expect(summary.totalMuscles).toBe(2);
    expect(summary.groupSummary).toHaveLength(2);
  });

  it('should validate selection correctly', () => {
    const { result } = renderHook(() => useMuscleSelection(2));
    
    // Empty selection
    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.validation.canAddMore).toBe(true);
    
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
    });
    
    // At max limit
    expect(result.current.validation.canAddMore).toBe(false);
    expect(result.current.validation.maxGroupsReached).toBe(true);
  });

  it('should handle default muscle selection limits', () => {
    const { result } = renderHook(() => useMuscleSelection());
    
    // Test with default limits
    const maxGroups = MUSCLE_SELECTION_LIMITS.MAX_GROUPS;
    
    // Add maximum number of groups
    act(() => {
      result.current.addMuscleGroup(MuscleGroup.Chest);
      result.current.addMuscleGroup(MuscleGroup.Back);
      result.current.addMuscleGroup(MuscleGroup.Legs);
    });
    
    if (maxGroups === 3) {
      expect(result.current.canAddMore).toBe(false);
    } else {
      expect(result.current.canAddMore).toBe(true);
    }
  });

  it('should handle persistence correctly when enabled', () => {
    const mockPersistence = {
      loadData: jest.fn(() => ({
        selectedGroups: [MuscleGroup.Chest],
        selectedMuscles: { [MuscleGroup.Chest]: ['Upper Chest'] }
      })),
      saveData: jest.fn(),
      clearData: jest.fn(),
      hasStoredData: true
    };

    const { useFormPersistence } = require('../useFormPersistence');
    useFormPersistence.mockReturnValue(mockPersistence);

    const { result } = renderHook(() => useMuscleSelection(3, true));
    
    // Should load persisted data
    expect(result.current.selectionData.selectedGroups).toContain(MuscleGroup.Chest);
    expect(result.current.selectionData.selectedMuscles[MuscleGroup.Chest]).toContain('Upper Chest');
  });

  it('should handle persistence correctly when disabled', () => {
    const { result } = renderHook(() => useMuscleSelection(3, false));
    
    expect(result.current.hasStoredData).toBe(false);
    
    act(() => {
      result.current.clearStoredData();
    });
    
    // Should not throw error
    expect(result.current.selectionData.selectedGroups).toEqual([]);
  });
}); 