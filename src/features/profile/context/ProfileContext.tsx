/**
 * Profile Context
 * 
 * Provides global state management for user profiles
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { profileApi, Profile, UpdateProfileRequest } from '../api/profileApi';

/**
 * Profile Context State
 */
interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Profile Context Actions
 */
type ProfileAction =
  | { type: 'LOADING' }
  | { type: 'PROFILE_LOADED'; payload: Profile }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

/**
 * Profile Context Value
 */
interface ProfileContextType {
  state: ProfileState;
  getProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  clearError: () => void;
}

// Simple reducer
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'PROFILE_LOADED':
      return { profile: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  const getProfile = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await profileApi.getProfile();
      
      if (response.success && response.data) {
        dispatch({ type: 'PROFILE_LOADED', payload: response.data });
      } else {
        dispatch({ type: 'ERROR', payload: response.message || 'Failed to load profile' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'ERROR', payload: message });
    }
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await profileApi.updateProfile(updates);
      
      if (response.success && response.data) {
        dispatch({ type: 'PROFILE_LOADED', payload: response.data });
      } else {
        dispatch({ type: 'ERROR', payload: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'ERROR', payload: message });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Load profile on mount
  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const contextValue: ProfileContextType = {
    state,
    getProfile,
    updateProfile,
    clearError,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext; 