/**
 * Tests for useFormPersistence hook
 */
import { renderHook } from '@testing-library/react';
import { useFormPersistence } from '../../../../src/features/workout-generator/hooks/useFormPersistence';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(() => '')
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

describe('useFormPersistence hook', () => {
  const TEST_KEY = 'test_storage_key';
  const TEST_DATA = { name: 'Test', value: 123 };
  
  beforeEach(() => {
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should save data to sessionStorage', () => {
    const { result } = renderHook(() => useFormPersistence(TEST_KEY));
    
    result.current.saveData(TEST_DATA);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      TEST_KEY,
      JSON.stringify(TEST_DATA)
    );
  });
  
  it('should load data from sessionStorage', () => {
    // Preset storage with data
    mockSessionStorage.setItem(TEST_KEY, JSON.stringify(TEST_DATA));
    
    const { result } = renderHook(() => useFormPersistence(TEST_KEY));
    
    const loadedData = result.current.loadData();
    
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(TEST_KEY);
    expect(loadedData).toEqual(TEST_DATA);
  });
  
  it('should return initialData when storage is empty', () => {
    const initialData = { default: true };
    
    const { result } = renderHook(() => useFormPersistence(TEST_KEY, initialData));
    
    const loadedData = result.current.loadData();
    
    expect(loadedData).toEqual(initialData);
  });
  
  it('should clear data from sessionStorage', () => {
    // Preset storage with data
    mockSessionStorage.setItem(TEST_KEY, JSON.stringify(TEST_DATA));
    
    const { result } = renderHook(() => useFormPersistence(TEST_KEY));
    
    result.current.clearData();
    
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(TEST_KEY);
  });
  
  it('should detect if data exists in sessionStorage', () => {
    const { result } = renderHook(() => useFormPersistence(TEST_KEY));
    
    // Initially should be false
    expect(result.current.hasStoredData()).toBe(false);
    
    // Add data
    mockSessionStorage.setItem(TEST_KEY, JSON.stringify(TEST_DATA));
    
    // Now should be true
    expect(result.current.hasStoredData()).toBe(true);
  });
  
  it('should handle JSON parse errors gracefully', () => {
    // Set invalid JSON
    mockSessionStorage.setItem(TEST_KEY, 'invalid-json');
    
    // Mock console.warn to suppress output
    const originalWarn = console.warn;
    console.warn = jest.fn();
    
    const initialData = { default: true };
    const { result } = renderHook(() => useFormPersistence(TEST_KEY, initialData));
    
    // Should return initialData on error
    const loadedData = result.current.loadData();
    expect(loadedData).toEqual(initialData);
    
    // Warning should have been logged
    expect(console.warn).toHaveBeenCalled();
    
    // Restore console.warn
    console.warn = originalWarn;
  });
}); 