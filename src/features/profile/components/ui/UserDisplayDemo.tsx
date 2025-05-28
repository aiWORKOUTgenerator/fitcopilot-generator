/**
 * User Display Demo Component
 * 
 * Showcases the enhanced user display logic with different fallback scenarios
 */

import React from 'react';
import { UserProfile } from '../../types/profile';
import {
  getUserDisplayName,
  getUserEmail,
  getUserInitials,
  getShortDisplayName,
  getFormalDisplayName,
  hasCompleteUserIdentity,
  hasAnyUserIdentity,
  getUserIdentitySummary
} from '../../utils/userDisplay';
import Avatar from './Avatar';

const UserDisplayDemo: React.FC = () => {
  // Sample user profiles for demonstration
  const profiles: Array<{ name: string; profile: UserProfile }> = [
    {
      name: 'Complete Profile',
      profile: {
        id: 1,
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        avatarUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=80',
        fitnessLevel: 'intermediate',
        goals: ['muscle_building'],
        customGoal: '',
        weight: 180,
        weightUnit: 'lbs',
        height: 72,
        heightUnit: 'in',
        age: 30,
        gender: 'male',
        availableEquipment: ['dumbbells'],
        customEquipment: '',
        preferredLocation: 'home',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 45,
        workoutFrequency: '4-5',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: true,
        completedWorkouts: 5
      }
    },
    {
      name: 'Display Name Only',
      profile: {
        id: 2,
        username: 'mikejohnson',
        firstName: undefined,
        lastName: undefined,
        email: 'mike.johnson@example.com',
        displayName: 'Mike Johnson',
        avatarUrl: undefined,
        fitnessLevel: 'advanced',
        goals: ['strength'],
        customGoal: '',
        weight: 200,
        weightUnit: 'lbs',
        height: 74,
        heightUnit: 'in',
        age: 35,
        gender: 'male',
        availableEquipment: ['full_gym'],
        customEquipment: '',
        preferredLocation: 'gym',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 60,
        workoutFrequency: '5-6',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: true,
        completedWorkouts: 15
      }
    },
    {
      name: 'First Name Only',
      profile: {
        id: 3,
        username: 'janedoe',
        firstName: 'Jane',
        lastName: undefined,
        email: 'jane.smith@example.com',
        displayName: undefined,
        avatarUrl: undefined,
        fitnessLevel: 'beginner',
        goals: ['weight_loss'],
        customGoal: '',
        weight: 140,
        weightUnit: 'lbs',
        height: 65,
        heightUnit: 'in',
        age: 28,
        gender: 'female',
        availableEquipment: ['none'],
        customEquipment: '',
        preferredLocation: 'home',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 30,
        workoutFrequency: '3-4',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: false,
        completedWorkouts: 0
      }
    },
    {
      name: 'Username Only',
      profile: {
        id: 4,
        username: 'fitnessfan2024',
        firstName: undefined,
        lastName: undefined,
        email: 'user@example.com',
        displayName: undefined,
        avatarUrl: undefined,
        fitnessLevel: 'intermediate',
        goals: ['general_fitness'],
        customGoal: '',
        weight: 160,
        weightUnit: 'lbs',
        height: 68,
        heightUnit: 'in',
        age: 25,
        gender: undefined,
        availableEquipment: ['resistance_bands'],
        customEquipment: '',
        preferredLocation: 'home',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 40,
        workoutFrequency: '4-5',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: false,
        completedWorkouts: 3
      }
    },
    {
      name: 'Email Only',
      profile: {
        id: 5,
        username: undefined,
        firstName: undefined,
        lastName: undefined,
        email: 'anonymous@example.com',
        displayName: undefined,
        avatarUrl: undefined,
        fitnessLevel: 'beginner',
        goals: ['general_fitness'],
        customGoal: '',
        weight: 0,
        weightUnit: 'lbs',
        height: 0,
        heightUnit: 'ft',
        age: 0,
        gender: undefined,
        availableEquipment: ['none'],
        customEquipment: '',
        preferredLocation: 'home',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 30,
        workoutFrequency: '3-4',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: false,
        completedWorkouts: 0
      }
    },
    {
      name: 'Whitespace Fields',
      profile: {
        id: 6,
        username: '   ',
        firstName: '   ',
        lastName: '   ',
        email: '   ',
        displayName: '   ',
        avatarUrl: undefined,
        fitnessLevel: 'beginner',
        goals: ['general_fitness'],
        customGoal: '',
        weight: 0,
        weightUnit: 'lbs',
        height: 0,
        heightUnit: 'ft',
        age: 0,
        gender: undefined,
        availableEquipment: ['none'],
        customEquipment: '',
        preferredLocation: 'home',
        limitations: ['none'],
        limitationNotes: '',
        preferredWorkoutDuration: 30,
        workoutFrequency: '3-4',
        customFrequency: '',
        favoriteExercises: [],
        dislikedExercises: [],
        medicalConditions: '',
        lastUpdated: '2024-01-01T00:00:00Z',
        profileComplete: false,
        completedWorkouts: 0
      }
    }
  ];

  return (
    <div className="user-display-demo" style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Enhanced User Display Logic Demo</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem' 
      }}>
        {profiles.map(({ name, profile }) => {
          const summary = getUserIdentitySummary(profile);
          
          return (
            <div 
              key={profile.id} 
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                backgroundColor: '#f9fafb'
              }}
            >
              {/* Header with Avatar and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Avatar profile={profile} size="medium" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1f2937' }}>
                    {name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    ID: {profile.id}
                  </p>
                </div>
              </div>

              {/* Raw Data */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase' }}>
                  Raw Data
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                  <div><strong>firstName:</strong> "{profile.firstName || ''}"</div>
                  <div><strong>lastName:</strong> "{profile.lastName || ''}"</div>
                  <div><strong>displayName:</strong> "{profile.displayName || ''}"</div>
                  <div><strong>username:</strong> "{profile.username || ''}"</div>
                  <div><strong>email:</strong> "{profile.email || ''}"</div>
                  <div><strong>avatarUrl:</strong> {profile.avatarUrl ? 'Present' : 'None'}</div>
                </div>
              </div>

              {/* Display Functions Results */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase' }}>
                  Display Functions
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                  <div><strong>getUserDisplayName:</strong> "{getUserDisplayName(profile)}"</div>
                  <div><strong>getShortDisplayName:</strong> "{getShortDisplayName(profile)}"</div>
                  <div><strong>getFormalDisplayName:</strong> "{getFormalDisplayName(profile)}"</div>
                  <div><strong>getUserEmail:</strong> "{getUserEmail(profile)}"</div>
                  <div><strong>getUserInitials:</strong> "{getUserInitials(profile)}"</div>
                </div>
              </div>

              {/* Identity Checks */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase' }}>
                  Identity Checks
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                  <div><strong>hasCompleteUserIdentity:</strong> {hasCompleteUserIdentity(profile) ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>hasAnyUserIdentity:</strong> {hasAnyUserIdentity(profile) ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>

              {/* Summary Object */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase' }}>
                  Identity Summary
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                  <div><strong>displayName:</strong> "{summary.displayName}"</div>
                  <div><strong>email:</strong> "{summary.email}"</div>
                  <div><strong>initials:</strong> "{summary.initials}"</div>
                  <div><strong>avatarUrl:</strong> {summary.avatarUrl ? 'Present' : 'None'}</div>
                  <div><strong>hasCompleteIdentity:</strong> {summary.hasCompleteIdentity ? '✅ Yes' : '❌ No'}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Sources:</strong>
                    <div style={{ marginLeft: '1rem' }}>
                      <div>name: {summary.source.name}</div>
                      <div>email: {summary.source.email}</div>
                      <div>avatar: {summary.source.avatar}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fallback Hierarchy Documentation */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Fallback Hierarchy Documentation</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#374151' }}>Display Name Priority</h3>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
              <li>firstName + lastName (if both have content)</li>
              <li>displayName (if has content)</li>
              <li>firstName only (if has content)</li>
              <li>username (if has content)</li>
              <li>email part before @ (if has content)</li>
              <li>"User" (final fallback)</li>
            </ol>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#374151' }}>Initials Priority</h3>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
              <li>firstName + lastName initials (if both have content)</li>
              <li>displayName initials - first two words (if has content)</li>
              <li>firstName initial only (if has content)</li>
              <li>username initial (if has content)</li>
              <li>email initial (if has content)</li>
              <li>"U" (final fallback)</li>
            </ol>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#374151' }}>Content Validation</h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
              <li>Checks for meaningful content (not just whitespace)</li>
              <li>Safely trims all strings</li>
              <li>Handles null/undefined values gracefully</li>
              <li>Filters empty words in displayName parsing</li>
              <li>Provides consistent fallback behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDisplayDemo; 