/**
 * Profile API - Simplified Working Version
 * 
 * Replicates the exact pattern from test-api-endpoints.php that consistently works
 */

export interface Profile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  fitnessLevel: string;
  goals: string[];
  customGoal: string;
  weight: number;
  weightUnit: string;
  height: number;
  heightUnit: string;
  age: number;
  gender: string;
  availableEquipment: string[];
  customEquipment: string;
  preferredLocation: string;
  limitations: string[];
  limitationNotes: string;
  workoutFrequency: string;
  customFrequency: string;
  preferredWorkoutDuration: number;
  favoriteExercises: string[];
  dislikedExercises: string[];
  medicalConditions: string;
  profileComplete: boolean;
  lastUpdated: string;
  completedWorkouts: number;
}

export interface ProfileApiResponse {
  success: boolean;
  message: string;
  data?: Profile;
  code?: string;
}

export interface UpdateProfileRequest {
  fitnessLevel?: string;
  goals?: string[];
  customGoal?: string;
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  age?: number;
  gender?: string;
  availableEquipment?: string[];
  customEquipment?: string;
  preferredLocation?: string;
  limitations?: string[];
  limitationNotes?: string;
  workoutFrequency?: string;
  customFrequency?: string;
  preferredWorkoutDuration?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  favoriteExercises?: string[];
  dislikedExercises?: string[];
  medicalConditions?: string;
  profileComplete?: boolean;
}

class ProfileApiService {
  private baseUrl: string;
  private nonce: string;

  constructor() {
    // Use the exact same setup as test-api-endpoints.php
    this.baseUrl = (window as any).fitcopilotData?.apiBase || '/wp-json/fitcopilot/v1';
    this.nonce = (window as any).fitcopilotData?.nonce || '';
    
    console.log('ProfileApiService initialized:', {
      baseUrl: this.baseUrl,
      hasNonce: !!this.nonce
    });
  }

  /**
   * Get user profile - exact replica of testGetProfile() from test-api-endpoints.php
   */
  async getProfile(): Promise<ProfileApiResponse> {
    try {
      console.log('Getting profile from:', `${this.baseUrl}/profile`);
      
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: {
          'X-WP-Nonce': this.nonce
        },
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      console.log('Profile API response:', data);
      
      if (data.success && data.data) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Profile API error:', error);
      throw error;
    }
  }

  /**
   * Update user profile - direct format (not wrapped)
   * Replicates testUpdateProfileDirect() from test-api-endpoints.php
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ProfileApiResponse> {
    try {
      console.log('Updating profile with:', profileData);
      
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce
        },
        body: JSON.stringify(profileData),
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      console.log('Update profile API response:', data);
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  }
}

export const profileApi = new ProfileApiService(); 