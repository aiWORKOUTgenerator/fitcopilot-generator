import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

interface DashboardContextValue {
  state: DashboardState;
  refreshDashboard: () => Promise<void>;
  setError: (error: string | null) => void;
}

const defaultState: DashboardState = {
  isLoading: false,
  error: null,
  lastRefresh: null,
};

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

/**
 * Provider component for dashboard state management
 * 
 * @param {DashboardProviderProps} props - Component props
 * @returns {JSX.Element} Dashboard context provider
 */
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(defaultState);

  // Function to refresh all dashboard data
  const refreshDashboard = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Here we would fetch the latest data for all dashboard components
      // For example: await Promise.all([fetchProfile(), fetchWorkouts(), fetchAPIUsage()])
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastRefresh: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };

  // Set error message in dashboard state
  const setError = (error: string | null): void => {
    setState(prev => ({ ...prev, error }));
  };

  // Initial data load
  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <DashboardContext.Provider 
      value={{ 
        state, 
        refreshDashboard, 
        setError
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * Hook to access the Dashboard context
 * 
 * @returns {DashboardContextValue} Dashboard context value
 * @throws {Error} If used outside DashboardProvider
 */
export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}; 