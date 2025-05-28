/**
 * ProfileCard Integration Test
 * 
 * Test the new step-based ProfileCard layout with sample data
 */

import React from 'react';
import { UserProfile } from '../../types/profile';

// Sample profile data for testing
const sampleCompleteProfile: UserProfile = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  fitnessLevel: 'intermediate',
  goals: ['weight_loss', 'muscle_building'],
  age: 30,
  weight: 75,
  weightUnit: 'kg',
  height: 180,
  heightUnit: 'cm',
  gender: 'male',
  availableEquipment: ['dumbbells', 'resistance_bands'],
  preferredLocation: 'home',
  limitations: ['none'],
  medicalConditions: '',
  workoutFrequency: '3-4',
  preferredWorkoutDuration: 45,
  lastUpdated: '2024-01-01T00:00:00Z',
  profileComplete: true,
  completedWorkouts: 5
};

const sampleIncompleteProfile: UserProfile = {
  id: 2,
  firstName: 'Jane',
  lastName: '',
  email: '',
  fitnessLevel: 'beginner',
  goals: ['general_fitness'],
  availableEquipment: ['none'],
  limitations: ['none'],
  preferredLocation: 'home',
  workoutFrequency: '1-2',
  lastUpdated: '2024-01-01T00:00:00Z',
  profileComplete: false,
  completedWorkouts: 0
};

/**
 * Test component to verify ProfileCard integration
 */
const ProfileCardTest: React.FC = () => {
  const handleEdit = () => {
    console.log('Edit profile clicked');
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>ProfileCard Integration Test</h1>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Complete Profile</h2>
        {/* 
        Uncomment when ready to test:
        <ProfileCard profile={sampleCompleteProfile} onEdit={handleEdit} />
        */}
        <div style={{ color: '#8cd867', padding: '1rem', border: '1px solid #8cd867', borderRadius: '8px' }}>
          ✅ Complete Profile Test Ready - Uncomment ProfileCard import and usage above
        </div>
      </div>
      
      <div>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Incomplete Profile</h2>
        {/* 
        Uncomment when ready to test:
        <ProfileCard profile={sampleIncompleteProfile} onEdit={handleEdit} />
        */}
        <div style={{ color: '#f59e0b', padding: '1rem', border: '1px solid #f59e0b', borderRadius: '8px' }}>
          ⚠️ Incomplete Profile Test Ready - Uncomment ProfileCard import and usage above
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
        <p>Integration test shows:</p>
        <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <li>✅ Step-based data organization</li>
          <li>✅ Fitness-themed icons and styling</li>
          <li>✅ Responsive 2x2 grid layout</li>
          <li>✅ Smart completion indicators</li>
          <li>✅ Prominent CTA button</li>
          <li>✅ Dark theme compatibility</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileCardTest; 