/**
 * ProfileHeader Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileHeader from '../../../../../src/features/profile/components/step-cards/ProfileHeader';
import { UserProfile } from '../../../../../src/features/profile/types/profile';

// Mock the step-data utility
jest.mock('../../../../../src/features/profile/utils/step-data', () => ({
  calculateOverallCompletion: jest.fn(() => ({
    completionPercentage: 75,
    completedSteps: 3,
    totalSteps: 4
  }))
}));

describe('ProfileHeader', () => {
  const mockCompleteProfile: UserProfile = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    fitnessLevel: 'intermediate',
    goals: ['muscle_building'],
    availableEquipment: ['dumbbells'],
    workoutFrequency: '3-4',
    preferredLocation: 'gym',
    limitations: ['none'],
    lastUpdated: '2024-01-01T00:00:00Z',
    profileComplete: true,
    completedWorkouts: 5
  };

  const mockPartialProfile: UserProfile = {
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

  it('renders user name and email when complete profile data is available', () => {
    render(<ProfileHeader profile={mockCompleteProfile} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile Details')).toBeInTheDocument();
  });

  it('renders completion percentage and steps', () => {
    render(<ProfileHeader profile={mockCompleteProfile} />);
    
    expect(screen.getByText('75% Complete')).toBeInTheDocument();
    expect(screen.getByText('3 of 4 steps')).toBeInTheDocument();
  });

  it('displays avatar image when avatarUrl is provided', () => {
    render(<ProfileHeader profile={mockCompleteProfile} />);
    
    const avatarImage = screen.getByAltText("John Doe's avatar");
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays initials when no avatar URL is provided', () => {
    render(<ProfileHeader profile={mockPartialProfile} />);
    
    // Should display initials based on username fallback
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles profile with only email', () => {
    const emailOnlyProfile: UserProfile = {
      ...mockPartialProfile,
      username: undefined,
      email: 'test@example.com'
    };
    
    render(<ProfileHeader profile={emailOnlyProfile} />);
    
    // Should display email part as name
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles null profile gracefully', () => {
    render(<ProfileHeader profile={null} />);
    
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Profile Details')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument(); // Initials fallback
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProfileHeader profile={mockCompleteProfile} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('profile-header', 'custom-class');
  });

  it('does not render email when not available', () => {
    const noEmailProfile: UserProfile = {
      ...mockCompleteProfile,
      email: undefined
    };
    
    render(<ProfileHeader profile={noEmailProfile} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('@')).not.toBeInTheDocument();
  });
}); 