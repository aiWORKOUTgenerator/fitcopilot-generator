/**
 * ProfileHeader Demo Component
 * 
 * Demo component to showcase the enhanced ProfileHeader with different user scenarios
 */

import React from 'react';
import ProfileHeader from './ProfileHeader';
import { UserProfile } from '../../types/profile';

const ProfileHeaderDemo: React.FC = () => {
  // Complete user profile with avatar
  const completeProfile: UserProfile = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=80',
    fitnessLevel: 'intermediate',
    goals: ['muscle_building', 'strength'],
    availableEquipment: ['dumbbells', 'barbell'],
    workoutFrequency: '3-4',
    preferredLocation: 'gym',
    limitations: ['none'],
    lastUpdated: '2024-01-01T00:00:00Z',
    profileComplete: true,
    completedWorkouts: 12
  };

  // Partial profile (no avatar, only username)
  const partialProfile: UserProfile = {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    fitnessLevel: 'beginner',
    goals: ['weight_loss'],
    availableEquipment: ['none'],
    workoutFrequency: '1-2',
    preferredLocation: 'home',
    limitations: ['none'],
    lastUpdated: '2024-01-01T00:00:00Z',
    profileComplete: false,
    completedWorkouts: 0
  };

  // Minimal profile (email only)
  const minimalProfile: UserProfile = {
    id: 3,
    email: 'test@example.com',
    fitnessLevel: 'beginner',
    goals: ['general_fitness'],
    availableEquipment: ['none'],
    workoutFrequency: '3-4',
    preferredLocation: 'home',
    limitations: ['none'],
    lastUpdated: '2024-01-01T00:00:00Z',
    profileComplete: false,
    completedWorkouts: 0
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
      <h1>ProfileHeader Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Complete Profile (with avatar)</h2>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
          <ProfileHeader profile={completeProfile} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Partial Profile (username + email, no avatar)</h2>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
          <ProfileHeader profile={partialProfile} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Minimal Profile (email only)</h2>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
          <ProfileHeader profile={minimalProfile} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Null Profile (fallback)</h2>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
          <ProfileHeader profile={null} />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderDemo; 