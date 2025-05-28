/**
 * Avatar Demo Component
 * 
 * Showcases the Avatar system with different user scenarios and configurations
 */

import React from 'react';
import Avatar from './Avatar';
import { UserProfile } from '../../types/profile';

const AvatarDemo: React.FC = () => {
  // Sample user profiles for demonstration
  const profiles: Array<{ name: string; profile: UserProfile }> = [
    {
      name: 'Complete Profile with Avatar',
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
      name: 'First & Last Name Only',
      profile: {
        id: 2,
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Smith',
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
      name: 'Display Name Only',
      profile: {
        id: 3,
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
      name: 'Minimal Data',
      profile: {
        id: 6,
        username: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
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
    }
  ];

  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

  return (
    <div className="avatar-demo" style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Avatar System Demo</h1>
      
      {/* Size Variations */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#374151' }}>Size Variations</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sizes.map(size => (
            <div key={size} style={{ textAlign: 'center' }}>
              <Avatar 
                profile={profiles[0].profile} 
                size={size}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {size}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* User Data Scenarios */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#374151' }}>User Data Scenarios</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {profiles.map(({ name, profile }) => (
            <div 
              key={profile.id} 
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                backgroundColor: '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Avatar profile={profile} size="medium" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1f2937' }}>{name}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                    ID: {profile.id}
                  </p>
                </div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                <p><strong>First Name:</strong> {profile.firstName || 'None'}</p>
                <p><strong>Last Name:</strong> {profile.lastName || 'None'}</p>
                <p><strong>Display Name:</strong> {profile.displayName || 'None'}</p>
                <p><strong>Username:</strong> {profile.username || 'None'}</p>
                <p><strong>Email:</strong> {profile.email || 'None'}</p>
                <p><strong>Avatar URL:</strong> {profile.avatarUrl ? 'Present' : 'None'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#374151' }}>Interactive Examples</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              profile={profiles[0].profile} 
              size="large"
              onClick={() => alert('Avatar clicked!')}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Clickable Avatar
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              profile={profiles[1].profile} 
              size="large"
              showTooltip={false}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              No Tooltip
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              profile={profiles[2].profile} 
              size="large"
              className="custom-border"
              style={{ border: '3px solid #3b82f6' } as React.CSSProperties}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Custom Styling
            </p>
          </div>
        </div>
      </section>

      {/* Avatar Group Example */}
      <section>
        <h2 style={{ marginBottom: '1rem', color: '#374151' }}>Avatar Group</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {profiles.slice(0, 4).map((item, index) => (
            <div 
              key={item.profile.id}
              style={{ 
                marginLeft: index > 0 ? '-0.5rem' : '0',
                position: 'relative',
                zIndex: profiles.length - index
              }}
            >
              <Avatar 
                profile={item.profile} 
                size="medium"
                style={{ border: '2px solid white' } as React.CSSProperties}
              />
            </div>
          ))}
          <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            +{profiles.length - 4} more
          </span>
        </div>
      </section>
    </div>
  );
};

export default AvatarDemo; 