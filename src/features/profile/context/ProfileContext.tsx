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
import { getProfile, updateProfile, saveDraftProfile } from '../api';

/**
 * Profile Context State
 */
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  isSavingDraft: boolean;
  error: string | null;
  isProfileComplete: boolean;
  completedSteps: number[];
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
  | { type: 'SAVE_DRAFT_START' }
  | { type: 'SAVE_DRAFT_SUCCESS'; payload: { profile: UserProfile; step: number } }
  | { type: 'SAVE_DRAFT_ERROR'; payload: string }
  | { type: 'RESET_ERROR' };

/**
 * Profile Context Value
 */
interface ProfileContextValue extends ProfileState {
  fetchProfile: () => Promise<void>;
  updateUserProfile: (data: PartialUserProfile) => Promise<void>;
  saveDraftUserProfile: (data: PartialUserProfile, step: number) => Promise<void>;
  resetError: () => void;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isSavingDraft: false,
  error: null,
  isProfileComplete: false,
  completedSteps: []
};

// Create context
const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// Profile reducer
const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'FETCH_PROFILE_START':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_PROFILE_SUCCESS':
      // If profile is complete, mark all steps as completed
      const completedStepsOnFetch = action.payload?.profileComplete ? [1, 2, 3, 4, 5] : [];
      
      return { 
        ...state, 
        profile: action.payload, 
        isLoading: false,
        isProfileComplete: Boolean(action.payload?.profileComplete),
        completedSteps: completedStepsOnFetch
      };
    
    case 'FETCH_PROFILE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'UPDATE_PROFILE_START':
      return { ...state, isUpdating: true, error: null };
    
    case 'UPDATE_PROFILE_SUCCESS':
      // If profile is now complete, mark all steps as completed
      const allStepsCompleted = action.payload?.profileComplete ? [1, 2, 3, 4, 5] : state.completedSteps;
      
      return { 
        ...state, 
        profile: action.payload, 
        isUpdating: false,
        isProfileComplete: Boolean(action.payload?.profileComplete),
        completedSteps: allStepsCompleted
      };
    
    case 'UPDATE_PROFILE_ERROR':
      return { ...state, isUpdating: false, error: action.payload };
    
    case 'SAVE_DRAFT_START':
      return { ...state, isSavingDraft: true, error: null };
    
    case 'SAVE_DRAFT_SUCCESS':
      return { 
        ...state, 
        profile: action.payload.profile, 
        isSavingDraft: false,
        completedSteps: [...new Set([...state.completedSteps, action.payload.step])].sort()
      };
    
    case 'SAVE_DRAFT_ERROR':
      return { ...state, isSavingDraft: false, error: action.payload };
    
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
  
  // Save draft profile function
  const saveDraftUserProfile = async (data: PartialUserProfile, step: number): Promise<void> => {
    dispatch({ type: 'SAVE_DRAFT_START' });
    
    try {
      const draftProfile = await saveDraftProfile(data);
      dispatch({ type: 'SAVE_DRAFT_SUCCESS', payload: { profile: draftProfile, step } });
    } catch (error) {
      let errorMessage = 'Failed to save draft profile';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'SAVE_DRAFT_ERROR', payload: errorMessage });
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
    saveDraftUserProfile,
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