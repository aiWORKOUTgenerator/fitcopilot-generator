import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';
import './styles/Dashboard.scss';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { WorkoutGeneratorFeature } from '../features/workout-generator/WorkoutGeneratorFeature';

// Import profile context and components
import { ProfileProvider, useProfile } from '../features/profile/context';
import { ProfileFeature } from '../features/profile';
import type { UserProfile } from '../features/profile/types';

// Import new tab system components
import { 
  TabContainer, 
  TabHeader, 
  TabContent, 
  TabPanel,
  useTabNavigation
} from './components/TabSystem';
import type { TabType } from './components/TabSystem';

// Import enhanced tab content components
import { ProfileSummary } from './components/ProfileTab/ProfileSummary';
import { WorkoutGrid } from './components/SavedWorkoutsTab/WorkoutGrid';
import ApiUsage from './components/ApiUsage';
import { RegistrationSteps } from './components';

/**
 * Transform real UserProfile data to ProfileSummary format
 */
const transformProfileData = (profile: UserProfile | null) => {
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
    fitnessLevel: profile.fitnessLevel,
    fitnessGoals: profile.goals?.map(goal => goalMap[goal] || goal) || ['General Fitness'],
    preferredWorkoutTypes: [], // TODO: Derive from goals or add to profile
    availableEquipment: profile.availableEquipment?.map(eq => equipmentMap[eq] || eq) || ['None'],
    completedWorkouts: profile.completedWorkouts || 0,
    currentStreak: 0, // TODO: Calculate from workout history
    totalMinutesExercised: 0, // TODO: Calculate from workout history
    profileCompleteness: calculateCompleteness(profile)
  };
};

/**
 * Enhanced Dashboard with tabbed interface
 */
const Dashboard: React.FC = () => {
  return (
    <ProfileProvider>
      <DashboardProvider>
        <DashboardInner />
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
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="dashboard-title">FitCopilot Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage your fitness profile and generate personalized workouts
            </p>
          </div>
          
          <div className="header-actions">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshDashboard}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Tabbed Interface */}
        <section className="dashboard-tabs-section">
          <TabContainer>
            <TabContentWrapper />
          </TabContainer>
        </section>

        {/* Always-Visible Workout Generator */}
        <section className="dashboard-generator-section">
          <div className="generator-header">
            <h2 className="generator-title">Workout Generator</h2>
            <p className="generator-subtitle">
              Create personalized workouts based on your profile and preferences
            </p>
          </div>
          
          <div className="generator-content">
            <WorkoutGeneratorFeature />
          </div>
        </section>
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
  const { profile, isLoading, error, fetchProfile, updateUserProfile } = useProfile();

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
    fetchProfile();
    // Switch to profile tab to show the completed profile
    switchTab('profile');
  };

  return (
    <>
      {/* Tab Navigation */}
      <TabHeader 
        tabs={[
          { id: 'register', label: 'Register', icon: '📝' },
          { id: 'profile', label: 'Profile', icon: '👤' },
          { id: 'saved-workouts', label: 'Saved Workouts', icon: '💾' }
        ]}
      />

      {/* Tab Content */}
      <TabContent>
        {/* Register Tab - Multi-step Profile Registration Form */}
        <TabPanel tabId="register">
          <div className="tab-panel-content">
            <div className="register-tab-layout">
              <div className="register-header">
                <h2>Profile Registration</h2>
                <p className="register-description">
                  Complete your fitness profile to get personalized workout recommendations. 
                  This is the original multi-step registration form that guides you through 
                  all the necessary information to create your comprehensive fitness profile.
                </p>
              </div>
              
              <div className="register-form-section">
                <Card className="register-form-card">
                  <ProfileFeature 
                    onProfileComplete={handleProfileComplete}
                    className="dashboard-profile-feature"
                  />
                </Card>
              </div>
              
              <div className="register-info-section">
                <Card className="register-info-card">
                  <RegistrationSteps />
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
              <WorkoutGrid 
                workouts={[]}
                isLoading={false}
                onWorkoutSelect={(workout) => console.log('Select workout:', workout)}
                onWorkoutEdit={(workout) => console.log('Edit workout:', workout)}
                onWorkoutDelete={(workoutId) => console.log('Delete workout:', workoutId)}
                onWorkoutDuplicate={(workout) => console.log('Duplicate workout:', workout)}
                onCreateSimilar={(workout) => console.log('Create similar:', workout)}
                onMarkComplete={(workoutId) => console.log('Mark complete:', workoutId)}
              />
            </div>
          </div>
        </TabPanel>
      </TabContent>
    </>
  );
};

export default Dashboard; 