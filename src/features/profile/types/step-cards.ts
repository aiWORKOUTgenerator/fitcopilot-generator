/**
 * Step Card Types
 * 
 * Type definitions for organizing profile data into step-based cards
 */

import { ReactNode } from 'react';
import { UserProfile, PartialUserProfile } from './profile';

/**
 * Profile field keys that can be displayed in step cards
 */
export type ProfileFieldKey = keyof UserProfile;

/**
 * Step card data structure
 */
export interface StepCardData {
  stepNumber: number;
  title: string;
  description: string;
  icon?: ReactNode;
  fields: ProfileFieldKey[];
  isComplete: boolean;
  completionText: string;
  summary: string;
  displayData: StepDisplayData[];
}

/**
 * Display data for individual fields within a step
 */
export interface StepDisplayData {
  label: string;
  value: string | string[];
  fieldKey: ProfileFieldKey;
  isSet: boolean;
}

/**
 * Step metadata configuration
 */
export interface StepMetadata {
  stepNumber: number;
  title: string;
  description: string;
  fields: ProfileFieldKey[];
  iconName?: string; // Will be used for icon selection
}

/**
 * Step completion status
 */
export interface StepCompletionStatus {
  stepNumber: number;
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  completionPercentage: number;
}

/**
 * Profile step mapping configuration
 */
export const PROFILE_STEP_MAPPING: Record<number, StepMetadata> = {
  1: {
    stepNumber: 1,
    title: "Basic Info",
    description: "Personal details and fitness level",
    fields: ["firstName", "lastName", "email", "fitnessLevel"],
    iconName: "user"
  },
  2: {
    stepNumber: 2,
    title: "Body Metrics",
    description: "Physical measurements",
    fields: ["age", "weight", "height", "gender"],
    iconName: "activity"
  },
  3: {
    stepNumber: 3,
    title: "Equipment",
    description: "Available equipment and location",
    fields: ["availableEquipment", "preferredLocation"],
    iconName: "dumbbell"
  },
  4: {
    stepNumber: 4,
    title: "Health",
    description: "Health considerations",
    fields: ["limitations", "medicalConditions"],
    iconName: "heart"
  },
  5: {
    stepNumber: 5,
    title: "Preferences",
    description: "Workout goals and preferences",
    fields: ["goals", "workoutFrequency", "preferredWorkoutDuration"],
    iconName: "target"
  }
};

/**
 * Field display configuration for formatting values
 */
export const FIELD_DISPLAY_CONFIG: Record<ProfileFieldKey, {
  label: string;
  formatter?: (value: any) => string;
  isRequired?: boolean;
}> = {
  // Basic Info
  firstName: { label: "First Name", isRequired: true },
  lastName: { label: "Last Name", isRequired: true },
  email: { label: "Email", isRequired: true },
  fitnessLevel: { 
    label: "Fitness Level", 
    formatter: (value: string) => value?.replace(/\b\w/g, l => l.toUpperCase()) || 'Not set',
    isRequired: true 
  },
  
  // Body Metrics
  age: { 
    label: "Age", 
    formatter: (value: number) => value ? `${value} years` : 'Not set',
    isRequired: true 
  },
  weight: { 
    label: "Weight", 
    formatter: (value: number, profile: UserProfile) => {
      if (!value) return 'Not set';
      const unit = profile.weightUnit || 'kg';
      return `${value} ${unit}`;
    },
    isRequired: true
  },
  height: { 
    label: "Height", 
    formatter: (value: number, profile: UserProfile) => {
      if (!value) return 'Not set';
      const unit = profile.heightUnit || 'cm';
      
      if (unit === 'ft') {
        // Convert total inches to feet and inches display
        const feet = Math.floor(value / 12);
        const inches = Math.round(value % 12);
        return `${feet}'${inches}"`;
      } else {
        return `${value} ${unit}`;
      }
    },
    isRequired: true
  },
  gender: { 
    label: "Gender", 
    formatter: (value: string) => value?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set',
    isRequired: true 
  },
  
  // Equipment
  availableEquipment: { 
    label: "Equipment", 
    formatter: (value: string[]) => {
      if (!value || value.length === 0) return 'Not set';
      if (value.includes('none')) return 'No equipment';
      return value.map(eq => eq.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
    },
    isRequired: true 
  },
  preferredLocation: { 
    label: "Location", 
    formatter: (value: string) => value?.replace(/\b\w/g, l => l.toUpperCase()) || 'Not set',
    isRequired: true 
  },
  
  // Health
  limitations: { 
    label: "Limitations", 
    formatter: (value: string[]) => {
      if (!value || value.length === 0 || value.includes('none')) return 'None';
      return value.map(lim => lim.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
    },
    isRequired: true
  },
  medicalConditions: { 
    label: "Medical Conditions", 
    formatter: (value: string) => value || 'None' 
  },
  
  // Preferences
  goals: { 
    label: "Goals", 
    formatter: (value: string[]) => {
      if (!value || value.length === 0) return 'Not set';
      return value.map(goal => goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
    },
    isRequired: true 
  },
  workoutFrequency: { 
    label: "Frequency", 
    formatter: (value: string) => value ? `${value} times per week` : 'Not set',
    isRequired: true 
  },
  
  // Meta fields (not displayed in step cards)
  id: { label: "ID" },
  username: { label: "Username" },
  weightUnit: { label: "Weight Unit" },
  heightUnit: { label: "Height Unit" },
  customGoal: { label: "Custom Goal" },
  customEquipment: { label: "Custom Equipment" },
  limitationNotes: { label: "Limitation Notes" },
  customFrequency: { label: "Custom Frequency" },
  favoriteExercises: { label: "Favorite Exercises" },
  dislikedExercises: { label: "Disliked Exercises" },
  lastUpdated: { label: "Last Updated" },
  profileComplete: { label: "Profile Complete" },
  completedWorkouts: { label: "Completed Workouts" }
}; 