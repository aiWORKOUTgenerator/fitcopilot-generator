/**
 * Tests for useFormValidation hook
 */
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../../../src/features/workout-generator/hooks/useFormValidation';
import { validateWorkoutForm } from '../../../../src/features/workout-generator/domain/validators';

// Mock the validators
jest.mock('../../../../src/features/workout-generator/domain/validators', () => ({
  validateWorkoutForm: jest.fn(),
  isWorkoutFormValid: jest.fn().mockImplementation((values) => Boolean(values.goals && values.difficulty && values.duration))
}));

describe('useFormValidation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateWorkoutForm as jest.Mock).mockReturnValue(null);
  });

  it('should initialize with no errors and no touched fields', () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.errors).toBeNull();
    expect(result.current.touched).toEqual({});
  });

  it('should validate form and update errors state', () => {
    const mockErrors = { goals: 'Required field' };
    (validateWorkoutForm as jest.Mock).mockReturnValue(mockErrors);

    const { result } = renderHook(() => useFormValidation());

    act(() => {
      const isValid = result.current.validateForm({});
      expect(isValid).toBe(false);
    });

    expect(result.current.errors).toEqual(mockErrors);
  });

  it('should mark fields as touched', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.touchField('goals');
    });

    expect(result.current.touched).toEqual({ goals: true });

    act(() => {
      result.current.touchField('difficulty');
    });

    expect(result.current.touched).toEqual({ goals: true, difficulty: true });
  });

  it('should reset touched fields', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.touchField('goals');
      result.current.touchField('difficulty');
    });

    expect(result.current.touched).toEqual({ goals: true, difficulty: true });

    act(() => {
      result.current.resetTouched();
    });

    expect(result.current.touched).toEqual({});
  });

  it('should check if field has error and has been touched', () => {
    const mockErrors = { goals: 'Required field' };
    (validateWorkoutForm as jest.Mock).mockReturnValue(mockErrors);

    const { result } = renderHook(() => useFormValidation());

    // Validate form to populate errors
    act(() => {
      result.current.validateForm({});
    });

    // Check field that has error but hasn't been touched
    expect(result.current.hasFieldError('goals')).toBe(false);

    // Touch the field
    act(() => {
      result.current.touchField('goals');
    });

    // Now it should return true
    expect(result.current.hasFieldError('goals')).toBe(true);
  });

  it('should get field error message', () => {
    const mockErrors = { goals: 'Required field' };
    (validateWorkoutForm as jest.Mock).mockReturnValue(mockErrors);

    const { result } = renderHook(() => useFormValidation());

    // Validate form to populate errors
    act(() => {
      result.current.validateForm({});
    });

    expect(result.current.getFieldError('goals')).toBe('Required field');
    expect(result.current.getFieldError('difficulty')).toBeUndefined();
  });

  it('should reset errors', () => {
    const mockErrors = { goals: 'Required field' };
    (validateWorkoutForm as jest.Mock).mockReturnValue(mockErrors);

    const { result } = renderHook(() => useFormValidation());

    // Validate form to populate errors
    act(() => {
      result.current.validateForm({});
    });

    expect(result.current.errors).toEqual(mockErrors);

    act(() => {
      result.current.resetErrors();
    });

    expect(result.current.errors).toBeNull();
  });

  it('should check if form is valid', () => {
    (validateWorkoutForm as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useFormValidation());

    // Test with valid values
    const validValues = { goals: 'weight-loss', difficulty: 'beginner', duration: 30 };
    expect(result.current.isFormValid(validValues)).toBe(true);

    // Test with invalid values
    const invalidValues = { goals: '', difficulty: 'beginner', duration: 30 };
    expect(result.current.isFormValid(invalidValues)).toBe(false);
  });
}); 