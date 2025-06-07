import React, { useState, useEffect, Component, useCallback } from 'react';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';
import './styles/Dashboard.scss';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { WorkoutGeneratorFeature } from '../features/workout-generator/WorkoutGeneratorFeature';

// Import profile context and components
import { ProfileProvider, useProfile } from '../features/profile/context';
import { ProfileFeature } from '../features/profile';
import type { UserProfile } from '../features/profile/types';
import type { Profile } from '../features/profile/api/profileApi';

// Import workout context
import { WorkoutProvider, useWorkoutContext } from '../features/workout-generator/context/WorkoutContext';
import { WorkoutGeneratorProvider } from '../features/workout-generator/context/WorkoutGeneratorContext';

// Import new tab system components
import { 
  TabContainer, 
  TabHeader, 
  TabContent, 
  TabPanel,
  useTabNavigation
} from './components/TabSystem';
import type { TabType } from './components/TabSystem';

// Import enhanced components
import { EnhancedDashboardHeader, type QuickActionType } from './components/EnhancedHeader';
import { EnhancedTabHeader } from './components/TabSystem/EnhancedTabHeader';

// Import enhanced tab content components
import { ProfileSummary } from './components/ProfileTab/ProfileSummary';
import { EnhancedWorkoutGrid } from './components/SavedWorkoutsTab/WorkoutGrid';
import ApiUsage from './components/ApiUsage';
import { RegistrationSteps } from './components';

// Import new unified modal system
import { UnifiedWorkoutModal, type ModalMode } from './components/UnifiedModal';

// Import dual modal system
import { NavigationProvider, useNavigation } from '../features/workout-generator/navigation/NavigationContext';
import { EnhancedWorkoutModal as DualEnhancedWorkoutModal } from '../features/workout-generator/components/WorkoutEditor/EnhancedWorkoutModal';
import WorkoutEditorModal from '../features/workout-generator/components/WorkoutEditor/WorkoutEditorModal';



/**
 * Transform real Profile data to ProfileSummary format
 */
const transformProfileData = (profile: Profile | null) => {
  if (!profile) {
    return {
      name: 'User',
      email: 'user@example.com',
      fitnessLevel: 'beginner' as const,
      fitnessGoals: ['General Fitness'],
      preferredWorkoutTypes: ['Bodyweight'],
      availableEquipment: ['None'],
      completedWorkouts: 0,
      currentStreak: 0,
      totalMinutesExercised: 0,
      profileCompleteness: 0
    };
  }

  // Transform goals from enum to readable strings
  const goalMap: Record<string, string> = {
    'weight_loss': 'Weight Loss',
    'muscle_building': 'Build Muscle',
    'endurance': 'Improve Endurance',
    'flexibility': 'Improve Flexibility',
    'general_fitness': 'General Fitness',
    'strength': 'Build Strength',
    'rehabilitation': 'Rehabilitation',
    'sport_specific': 'Sport Specific',
    'custom': 'Custom Goal'
  };

  // Transform equipment from enum to readable strings
  const equipmentMap: Record<string, string> = {
    'none': 'None',
    'dumbbells': 'Dumbbells',
    'resistance_bands': 'Resistance Bands',
    'barbell': 'Barbell',
    'kettlebell': 'Kettlebell',
    'pull_up_bar': 'Pull-up Bar',
    'bench': 'Bench',
    'stability_ball': 'Stability Ball',
    'treadmill': 'Treadmill',
    'bicycle': 'Bicycle',
    'rowing_machine': 'Rowing Machine',
    'elliptical': 'Elliptical',
    'other': 'Other'
  };

  // Calculate profile completeness
  const calculateCompleteness = (profile: UserProfile): number => {
    const fields = [
      profile.fitnessLevel,
      profile.goals?.length > 0,
      profile.availableEquipment?.length > 0,
      profile.workoutFrequency,
      profile.preferredLocation
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Get user info (we'll need to get this from WordPress user data)
  const userName = profile.username || 'User';
  const userEmail = 'user@example.com'; // TODO: Get from WordPress user data

  return {
    name: userName,
    email: userEmail,
    fitnessLevel: profile.fitnessLevel as any, // Type compatibility fix
    fitnessGoals: profile.goals?.map((goal: string) => goalMap[goal] || goal) || ['General Fitness'],
    preferredWorkoutTypes: [], // TODO: Derive from goals or add to profile
    availableEquipment: profile.availableEquipment?.map((eq: string) => equipmentMap[eq] || eq) || ['None'],
    completedWorkouts: profile.completedWorkouts || 0,
    currentStreak: 0, // TODO: Calculate from workout history
    totalMinutesExercised: 0, // TODO: Calculate from workout history
    profileCompleteness: calculateCompleteness(profile as any) // Type compatibility fix
  };
};

/**
 * Enhanced Dashboard with tabbed interface
 */
const Dashboard: React.FC = () => {
  return (
    <ProfileProvider>
      <DashboardProvider>
        <WorkoutProvider>
          <WorkoutGeneratorProvider>
            <NavigationProvider>
              <DashboardInner />
            </NavigationProvider>
          </WorkoutGeneratorProvider>
        </WorkoutProvider>
      </DashboardProvider>
    </ProfileProvider>
  );
};

/**
 * Inner Dashboard component that consumes dashboard context
 */
const DashboardInner: React.FC = () => {
  const { state, refreshDashboard } = useDashboard();



  return (
    <div className="fitcopilot-dashboard enhanced">
      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Tabbed Interface */}
          <section className="dashboard-tabs-section">
            <TabContainer>
              <TabContentWrapper />
            </TabContainer>
          </section>

          {/* Always-Visible Workout Generator */}
          <section className="dashboard-generator-section">
            <Card className="generator-card">
              <div className="generator-header">
                <h2 className="generator-title">Workout Generator</h2>
                <p className="generator-subtitle">
                  Create personalized workouts based on your profile and preferences
                </p>
              </div>
              
              <div className="generator-content">
                <WorkoutGeneratorFeature />
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* Error Display */}
      {state.error && (
        <div className="dashboard-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{state.error}</span>
            <Button 
              variant="text" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="dashboard-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab Content Wrapper Component that uses the tab navigation hook
 */
const TabContentWrapper: React.FC = () => {
  const { activeTab, switchTab, isTabActive } = useTabNavigation();
  const { state: profileState, getProfile, updateProfile, clearError } = useProfile();
  const { profile, loading: isLoading, error } = profileState;
  const { refreshDashboard } = useDashboard();
  
  // Load workout list with real data
  const { 
    workouts, 
    isLoading: workoutsLoading, 
    error: workoutsError, 
    refreshWorkouts,
    saveWorkoutAndRefresh,
    deleteWorkoutAndRefresh,
    updateWorkoutAndRefresh,
    addWorkoutOptimistic,
    removeWorkoutOptimistic,
    updateWorkoutOptimistic
  } = useWorkoutContext();

  // Enhanced modal state management
  const [modalWorkout, setModalWorkout] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            switchTab('register');
            break;
          case '2':
            event.preventDefault();
            switchTab('profile');
            break;
          case '3':
            event.preventDefault();
            switchTab('saved-workouts');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [switchTab]);

  // Handle quick actions from enhanced header
  const handleQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'generate':
        // Scroll to generator section
        document.querySelector('.dashboard-generator-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
        break;
      case 'library':
        switchTab('saved-workouts');
        break;
      case 'profile':
        switchTab('profile');
        break;
      case 'settings':
        // TODO: Open settings modal or switch to settings tab
        console.log('Settings action');
        break;
    }
  };

  // Transform profile data for ProfileSummary
  const transformedProfile = transformProfileData(profile);

  // Handle profile edit
  const handleEditProfile = () => {
    console.log('Edit profile clicked - TODO: Open profile edit modal');
    // TODO: Implement profile edit functionality
  };

  // Handle preferences update
  const handleUpdatePreferences = () => {
    console.log('Update preferences clicked - TODO: Open preferences modal');
    // TODO: Implement preferences update functionality
  };

  // Handle profile registration completion
  const handleProfileComplete = () => {
    console.log('Profile registration completed!');
    // Refresh profile data
    getProfile();
    // Switch to profile tab to show the completed profile
    switchTab('profile');
  };

  // Enhanced modal handlers
  const handleOpenModal = (workout: any, mode: ModalMode = 'view') => {
    setModalWorkout(workout);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalWorkout(null);
    setModalMode('view');
    setIsModalLoading(false);
  };

  const handleModeChange = (newMode: ModalMode) => {
    setModalMode(newMode);
  };

  const handleModalSave = async (updatedWorkout: any) => {
    try {
      console.log('[Dashboard] Saving workout from modal:', {
        id: updatedWorkout.id,
        title: updatedWorkout.title,
        version: updatedWorkout.version,
        exerciseCount: updatedWorkout.exercises?.length || 0
      });

      // CRITICAL FIX: Ensure we have version information for proper versioning
      if (!updatedWorkout.version && modalWorkout?.version) {
        updatedWorkout.version = modalWorkout.version;
        console.log('[Dashboard] Added missing version from modal workout:', updatedWorkout.version);
      }

      // Use the context method for saving with proper versioning
      const savedWorkout = await updateWorkoutAndRefresh(updatedWorkout);
      
      console.log('[Dashboard] Workout saved successfully:', {
        id: savedWorkout.id,
        newVersion: savedWorkout.version,
        title: savedWorkout.title
      });

      // Update the modal workout to reflect the new version
      setModalWorkout(savedWorkout);
      
      // Switch to view mode after successful save
      setModalMode('view');
    } catch (error) {
      console.error('[Dashboard] Failed to save workout:', error);
      // Modal will show the error state
    }
  };

  const handleModalDelete = async (workoutId: string) => {
    setIsModalLoading(true);
    try {
      await deleteWorkoutAndRefresh(workoutId);
      handleCloseModal(); // Close modal after successful deletion
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error; // Re-throw to let modal handle error display
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleModalDuplicate = async (workout: any) => {
    try {
      // Create a new workout based on the existing one
      const duplicatedWorkout = {
        ...workout,
        id: `duplicate-${Date.now()}`,
        title: `${workout.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await saveWorkoutAndRefresh(duplicatedWorkout);
    } catch (error) {
      console.error('Failed to duplicate workout:', error);
      throw error;
    }
  };

  const handleModalStart = (workout: any) => {
    console.log('Starting workout:', workout);
    // TODO: Implement workout start functionality
    // This could navigate to a workout player/timer component
  };

  // Dual Modal System Handlers - NEW IMPLEMENTATION
  // Workout grid handlers
  const handleWorkoutSelect = (workout: any) => {
    handleOpenModal(workout, 'view');
  };

  const handleWorkoutEdit = (workout: any) => {
    handleOpenModal(workout, 'edit');
  };

  const handleWorkoutDelete = async (workoutId: string) => {
    console.log('Delete workout:', workoutId);
    try {
      await deleteWorkoutAndRefresh(workoutId);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      // Error message is handled by the context
    }
  };

  const handleWorkoutDuplicate = async (workout: any) => {
    console.log('Duplicate workout:', workout);
    try {
      await handleModalDuplicate(workout);
    } catch (error) {
      console.error('Failed to duplicate workout:', error);
      // Error message is handled by the context
    }
  };

  const handleCreateSimilar = async (workout: any) => {
    console.log('Create similar workout:', workout);
    // TODO: Generate a similar workout based on the selected one
  };

  const handleMarkComplete = async (workoutId: string) => {
    console.log('Mark workout complete:', workoutId);
    // TODO: Mark workout as completed and update stats
  };

  // Enhanced bulk operations
  const handleBulkDelete = async (workoutIds: string[]) => {
    console.log('Bulk delete workouts:', workoutIds);
    try {
      // Delete each workout - in a real app, you'd want a bulk delete API
      await Promise.all(workoutIds.map(id => deleteWorkoutAndRefresh(id)));
    } catch (error) {
      console.error('Failed to bulk delete workouts:', error);
      // Error message is handled by the context
    }
  };

  const handleToggleFavorite = async (workoutId: string) => {
    console.log('Toggle favorite for workout:', workoutId);
    // TODO: Implement favorite toggle functionality
  };

  const handleRateWorkout = async (workoutId: string, rating: number) => {
    console.log('Rate workout:', workoutId, 'Rating:', rating);
    // TODO: Implement workout rating functionality
  };

  // Tab configuration with enhanced features
  const tabConfig = [
    {
      id: 'register' as TabType,
      label: 'Get Started',
      icon: '🚀',
      shortcut: 'Alt+1'
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: '👤',
      shortcut: 'Alt+2'
    },
    {
      id: 'saved-workouts' as TabType,
      label: 'My Workouts',
      icon: '💪',
      badge: workouts?.length || 0,
      shortcut: 'Alt+3'
    }
  ];

  return (
    <>
      {/* Enhanced Dashboard Header */}
      <EnhancedDashboardHeader
        activeTab={activeTab}
        onQuickAction={handleQuickAction}
        onTabSwitch={switchTab}
        onRefresh={refreshDashboard}
        isLoading={isLoading || workoutsLoading}
      />

      {/* Enhanced Tab Header */}
      <EnhancedTabHeader
        tabs={tabConfig}
        showShortcuts={true}
        enableMobileMenu={true}
      />

      {/* Tab Content */}
      <TabContent>
        {/* Registration Tab */}
        <TabPanel tabId="register">
          <div className="tab-panel-content">
            <div className="register-tab-layout">
              {/* Registration Header */}
              <div className="register-header">
                <h2>Welcome to FitCopilot</h2>
                <p className="register-description">
                  Let's set up your fitness profile to get personalized workout recommendations 
                  tailored to your goals, preferences, and available equipment.
                </p>
              </div>
              
              {/* Registration Form */}
              <div className="register-form-section">
                <Card className="register-form-card">
                  <ProfileFeature />
                </Card>
              </div>
              
              {/* Registration Info */}
              <div className="register-info-section">
                <Card className="register-info-card">
                  <h3>Why Complete Your Profile?</h3>
                  <div className="steps-overview">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Personalized Workouts</strong>
                        <p>Get AI-generated workouts that match your fitness level and goals</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Equipment Optimization</strong>
                        <p>Workouts designed for the equipment you actually have</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Progress Tracking</strong>
                        <p>Monitor your fitness journey with detailed statistics</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Profile Tab */}
        <TabPanel tabId="profile">
          <div className="tab-panel-content">
            <div className="profile-tab-layout">
              {/* Profile Summary */}
              <div className="profile-summary-section">
                <ProfileSummary 
                  profile={transformedProfile}
                  onEditProfile={handleEditProfile}
                  onUpdatePreferences={handleUpdatePreferences}
                  isLoading={isLoading}
                />
              </div>
              
              {/* API Usage Stats */}
              <div className="api-usage-section">
                <ApiUsage />
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Saved Workouts Tab */}
        <TabPanel tabId="saved-workouts">
          <div className="tab-panel-content">
            <div className="saved-workouts-tab-layout">
              {/* 🚀 TASK 1.2.1: Enhanced Workout Grid with Unified Data Service */}
              <EnhancedWorkoutGrid
                workouts={workouts || []}
                isLoading={workoutsLoading}
                enableUnifiedDataService={true}
                enableVersionTracking={true}
                showDataQuality={true}
                onWorkoutSelect={handleWorkoutSelect}
                onWorkoutEdit={handleWorkoutEdit}
                onWorkoutDelete={handleWorkoutDelete}
                onWorkoutDuplicate={handleWorkoutDuplicate}
                onCreateSimilar={handleCreateSimilar}
                onMarkComplete={handleMarkComplete}
                onBulkDelete={handleBulkDelete}
                onToggleFavorite={handleToggleFavorite}
                onRateWorkout={handleRateWorkout}
              />
            </div>
          </div>
        </TabPanel>
      </TabContent>

      {/* Legacy Unified Workout Modal - TODO: Remove after dual modal migration */}
      {isModalOpen && modalWorkout && (
        <UnifiedWorkoutModal
          workout={modalWorkout}
          isOpen={isModalOpen}
          mode={modalMode}
          isLoading={isModalLoading}
          onClose={handleCloseModal}
          onModeChange={handleModeChange}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onDuplicate={handleModalDuplicate}
          onStart={handleModalStart}
        />
      )}

      {/* NEW: Dual Modal System Integration */}
      <WorkoutEditorModal />
    </>
  );
};

/**
 * Error Boundary component for catching React errors
 */
class WorkoutGridErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WorkoutGrid Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="workout-grid-error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Unable to Load Workouts</h3>
            <p className="error-message">
              There was a problem displaying your saved workouts. This might be due to a data formatting issue.
            </p>
            <div className="error-actions">
              <Button 
                variant="primary" 
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Dashboard; 