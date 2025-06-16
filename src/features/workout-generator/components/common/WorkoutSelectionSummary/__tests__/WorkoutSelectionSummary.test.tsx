/**
 * WorkoutSelectionSummary Component Tests
 * 
 * Simple tests for the basic functionality of the extracted component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WorkoutSelectionSummary } from '../WorkoutSelectionSummary';
import { GeneratedWorkout } from '../../../../types/workout';

// Mock workout data for testing
const mockWorkout: GeneratedWorkout = {
  id: 1,
  title: 'Test Workout',
  description: 'A test workout',
  duration: 30,
  goals: 'build_muscle',
  intensity_level: 4,
  fitness_level: 'intermediate',
  stress_level: 'moderate',
  energy_level: 'high',
  sleep_quality: 'good',
  location: 'gym',
  custom_notes: 'Test notes',
  primary_muscle_focus: 'chest',
  sections: [],
  exercises: []
};

const emptyWorkout: GeneratedWorkout = {
  id: 2,
  title: 'Empty Workout',
  description: 'No selections',
  sections: [],
  exercises: []
};

describe('WorkoutSelectionSummary', () => {
  it('renders with workout selections', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText('Your Selections')).toBeInTheDocument();
    expect(screen.getByText('These preferences shaped your personalized workout')).toBeInTheDocument();
  });

  it('displays workout setup information', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText('Workout Setup')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('Build Muscle')).toBeInTheDocument();
  });

  it('displays fitness level information', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText('Fitness Level')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
  });

  it('displays daily state information', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText("Today's State")).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Energetic')).toBeInTheDocument();
    expect(screen.getByText('Good Sleep')).toBeInTheDocument();
  });

  it('displays environment information', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText('Environment & Focus')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('shows AI context message', () => {
    render(<WorkoutSelectionSummary workout={mockWorkout} />);
    
    expect(screen.getByText(/Your AI trainer considered these preferences/)).toBeInTheDocument();
  });

  it('does not render when no selections are present', () => {
    const { container } = render(<WorkoutSelectionSummary workout={emptyWorkout} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('accepts custom title and subtitle', () => {
    render(
      <WorkoutSelectionSummary 
        workout={mockWorkout}
        title="Custom Title"
        subtitle="Custom subtitle"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <WorkoutSelectionSummary 
        workout={mockWorkout}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
}); 