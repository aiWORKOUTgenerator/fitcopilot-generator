/**
 * Avatar Utilities
 * 
 * Provides functions for avatar display logic including image URLs,
 * initials generation, and fallback handling
 */

import { UserProfile } from '../types/profile';

/**
 * Avatar display options
 */
export interface AvatarOptions {
  size?: number;
  className?: string;
  fallbackToInitials?: boolean;
  showTooltip?: boolean;
}

/**
 * Avatar data structure
 */
export interface AvatarData {
  type: 'image' | 'initials' | 'default';
  value: string;
  alt: string;
  title: string;
  backgroundColor?: string;
}

/**
 * Generate initials from user data with fallback hierarchy
 * 
 * @param profile User profile data
 * @returns Generated initials (1-2 characters)
 */
export function generateInitials(profile: UserProfile): string {
  // Priority 1: First name + Last name initials
  if (profile.firstName && profile.lastName) {
    return (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase();
  }
  
  // Priority 2: First name initial only
  if (profile.firstName) {
    return profile.firstName.charAt(0).toUpperCase();
  }
  
  // Priority 3: Display name initials
  if (profile.displayName) {
    const nameParts = profile.displayName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  // Priority 4: Username initial
  if (profile.username) {
    return profile.username.charAt(0).toUpperCase();
  }
  
  // Priority 5: Email initial
  if (profile.email) {
    return profile.email.charAt(0).toUpperCase();
  }
  
  // Final fallback
  return 'U';
}

/**
 * Generate a consistent background color based on user data
 * 
 * @param profile User profile data
 * @returns CSS color value
 */
export function generateAvatarColor(profile: UserProfile): string {
  // Create a simple hash from user data for consistent colors
  const hashSource = profile.email || profile.username || profile.firstName || 'default';
  let hash = 0;
  
  for (let i = 0; i < hashSource.length; i++) {
    const char = hashSource.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate a pleasant color palette
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet  
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
    '#3b82f6', // Blue
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Get avatar data with complete fallback logic
 * 
 * @param profile User profile data
 * @param options Avatar display options
 * @returns Complete avatar data for rendering
 */
export function getAvatarData(profile: UserProfile, options: AvatarOptions = {}): AvatarData {
  const { fallbackToInitials = true } = options;
  
  // Get display name for alt text and title
  const displayName = getUserDisplayName(profile);
  
  // Priority 1: Use avatar URL if available
  if (profile.avatarUrl) {
    return {
      type: 'image',
      value: profile.avatarUrl,
      alt: `${displayName}'s avatar`,
      title: displayName,
    };
  }
  
  // Priority 2: Generate initials if enabled
  if (fallbackToInitials) {
    const initials = generateInitials(profile);
    const backgroundColor = generateAvatarColor(profile);
    
    return {
      type: 'initials',
      value: initials,
      alt: `${displayName}'s initials`,
      title: displayName,
      backgroundColor,
    };
  }
  
  // Priority 3: Default avatar
  return {
    type: 'default',
    value: 'U',
    alt: 'Default user avatar',
    title: 'User',
    backgroundColor: '#6b7280', // Gray
  };
}

/**
 * Get user display name with fallback hierarchy
 * (Helper function for avatar alt text and titles)
 * 
 * @param profile User profile data
 * @returns Display name string
 */
function getUserDisplayName(profile: UserProfile): string {
  // Priority 1: First name + Last name
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  // Priority 2: Display name
  if (profile.displayName) {
    return profile.displayName;
  }
  
  // Priority 3: First name only
  if (profile.firstName) {
    return profile.firstName;
  }
  
  // Priority 4: Username
  if (profile.username) {
    return profile.username;
  }
  
  // Priority 5: Email
  if (profile.email) {
    return profile.email;
  }
  
  // Final fallback
  return 'User';
}

/**
 * Validate avatar URL and provide fallback
 * 
 * @param avatarUrl Avatar URL to validate
 * @param profile User profile for fallback
 * @returns Promise resolving to valid avatar data
 */
export async function validateAvatarUrl(
  avatarUrl: string, 
  profile: UserProfile
): Promise<AvatarData> {
  try {
    // Test if the image loads successfully
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = avatarUrl;
    });
    
    // If successful, return image avatar data
    const displayName = getUserDisplayName(profile);
    return {
      type: 'image',
      value: avatarUrl,
      alt: `${displayName}'s avatar`,
      title: displayName,
    };
  } catch (error) {
    // If failed, fall back to initials
    console.warn('Avatar image failed to load, falling back to initials:', error);
    return getAvatarData({ ...profile, avatarUrl: undefined });
  }
}

/**
 * Get avatar size classes for different contexts
 * 
 * @param size Size identifier
 * @returns CSS classes for avatar sizing
 */
export function getAvatarSizeClasses(size: 'small' | 'medium' | 'large' | number = 'medium'): string {
  if (typeof size === 'number') {
    return `w-${Math.round(size/4)} h-${Math.round(size/4)}`;
  }
  
  switch (size) {
    case 'small':
      return 'w-8 h-8 text-sm';
    case 'medium':
      return 'w-12 h-12 text-base';
    case 'large':
      return 'w-16 h-16 text-lg';
    default:
      return 'w-12 h-12 text-base';
  }
}

/**
 * Avatar component props interface
 */
export interface AvatarProps {
  profile: UserProfile;
  size?: 'small' | 'medium' | 'large' | number;
  className?: string;
  showTooltip?: boolean;
  onClick?: () => void;
} 