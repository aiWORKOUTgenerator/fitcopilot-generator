/**
 * Profile Context
 * 
 * Provides global state management for user profiles
 */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  PartialUserProfile, 
  INITIAL_PROFILE 
} from '../types';
import { getProfile, updateProfile } from '../api';

/**
 * Profile Context State
 */
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  isProfileComplete: boolean;
}

/**
 * Profile Context Actions
 */
type ProfileAction = 
  | { type: 'FETCH_PROFILE_START' }
  | { type: 'FETCH_PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'FETCH_PROFILE_ERROR'; payload: string }
  | { type: 'UPDATE_PROFILE_START' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE_ERROR'; payload: string }
  | { type: 'RESET_ERROR' };

/**
 * Profile Context Value
 */
interface ProfileContextValue extends ProfileState {
  fetchProfile: () => Promise<void>;
  updateUserProfile: (data: PartialUserProfile) => Promise<void>;
  resetError: () => void;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  isProfileComplete: false
};

// Create context
const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// Profile reducer
const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'FETCH_PROFILE_START':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_PROFILE_SUCCESS':
      return { 
        ...state, 
        profile: action.payload, 
        isLoading: false,
        isProfileComplete: Boolean(action.payload?.profileComplete)
      };
    
    case 'FETCH_PROFILE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'UPDATE_PROFILE_START':
      return { ...state, isUpdating: true, error: null };
    
    case 'UPDATE_PROFILE_SUCCESS':
      return { 
        ...state, 
        profile: action.payload, 
        isUpdating: false,
        isProfileComplete: Boolean(action.payload?.profileComplete)
      };
    
    case 'UPDATE_PROFILE_ERROR':
      return { ...state, isUpdating: false, error: action.payload };
    
    case 'RESET_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

/**
 * Profile Provider Component
 */
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  
  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);
  
  // Fetch profile function
  const fetchProfile = async (): Promise<void> => {
    dispatch({ type: 'FETCH_PROFILE_START' });
    
    try {
      const profileData = await getProfile();
      dispatch({ type: 'FETCH_PROFILE_SUCCESS', payload: profileData });
    } catch (error) {
      let errorMessage = 'Failed to fetch profile';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'FETCH_PROFILE_ERROR', payload: errorMessage });
    }
  };
  
  // Update profile function
  const updateUserProfile = async (data: PartialUserProfile): Promise<void> => {
    dispatch({ type: 'UPDATE_PROFILE_START' });
    
    try {
      const updatedProfile = await updateProfile(data);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedProfile });
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'UPDATE_PROFILE_ERROR', payload: errorMessage });
    }
  };
  
  // Reset error function
  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };
  
  // Context value
  const value: ProfileContextValue = {
    ...state,
    fetchProfile,
    updateUserProfile,
    resetError
  };
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

/**
 * Custom hook to use the profile context
 */
export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  return context;
};

export default ProfileContext; 