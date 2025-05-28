/**
 * User Display Utilities
 * 
 * Utilities for displaying user information with fallback hierarchy
 */

import { UserProfile } from '../types';

/**
 * Helper function to check if a string has meaningful content (not just whitespace)
 */
function hasContent(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Helper function to safely trim a string
 */
function safeTrim(value: string | undefined | null): string {
  return value ? value.trim() : '';
}

/**
 * Get the best available display name for a user with fallback hierarchy
 * 
 * Priority:
 * 1. firstName + lastName (if both available and have content)
 * 2. displayName (WordPress, if has content)
 * 3. firstName only (if has content)
 * 4. username (if has content)
 * 5. email (first part before @, if has content)
 * 6. "User" (final fallback)
 */
export function getUserDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User';
  
  const { firstName, lastName, displayName, username, email } = profile;
  
  // Priority 1: Full name (firstName + lastName)
  if (hasContent(firstName) && hasContent(lastName)) {
    return `${safeTrim(firstName)} ${safeTrim(lastName)}`;
  }
  
  // Priority 2: WordPress display name
  if (hasContent(displayName)) {
    return safeTrim(displayName);
  }
  
  // Priority 3: First name only
  if (hasContent(firstName)) {
    return safeTrim(firstName);
  }
  
  // Priority 4: Username
  if (hasContent(username)) {
    return safeTrim(username);
  }
  
  // Priority 5: Email (first part before @)
  if (hasContent(email)) {
    const emailPart = safeTrim(email).split('@')[0];
    if (emailPart && emailPart.trim()) {
      return emailPart.trim();
    }
  }
  
  // Final fallback
  return 'User';
}

/**
 * Get the best available email for a user
 * 
 * Priority:
 * 1. Profile email (if has content)
 * 2. Empty string (graceful fallback)
 */
export function getUserEmail(profile: UserProfile | null): string {
  if (!profile) return '';
  
  return hasContent(profile.email) ? safeTrim(profile.email) : '';
}

/**
 * Get user initials for avatar display
 * 
 * Priority:
 * 1. firstName + lastName initials (if both have content)
 * 2. displayName initials (first two words, if has content)
 * 3. firstName initial only (if has content)
 * 4. username initial (if has content)
 * 5. email initial (if has content)
 * 6. "U" (final fallback)
 */
export function getUserInitials(profile: UserProfile | null): string {
  if (!profile) return 'U';
  
  const { firstName, lastName, displayName, username, email } = profile;
  
  // Priority 1: firstName + lastName initials
  if (hasContent(firstName) && hasContent(lastName)) {
    return `${safeTrim(firstName).charAt(0)}${safeTrim(lastName).charAt(0)}`.toUpperCase();
  }
  
  // Priority 2: displayName initials (first two words)
  if (hasContent(displayName)) {
    const words = safeTrim(displayName).split(/\s+/).filter(word => word.length > 0);
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    } else if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
  }
  
  // Priority 3: firstName initial only
  if (hasContent(firstName)) {
    return safeTrim(firstName).charAt(0).toUpperCase();
  }
  
  // Priority 4: username initial
  if (hasContent(username)) {
    return safeTrim(username).charAt(0).toUpperCase();
  }
  
  // Priority 5: email initial
  if (hasContent(email)) {
    return safeTrim(email).charAt(0).toUpperCase();
  }
  
  // Final fallback
  return 'U';
}

/**
 * Get the best available avatar URL or generate initials
 * 
 * Priority:
 * 1. avatarUrl (Gravatar/WordPress, if has content)
 * 2. null (will use initials)
 */
export function getUserAvatarUrl(profile: UserProfile | null): string | null {
  if (!profile) return null;
  
  // Return avatar URL if available and has content, otherwise null (caller should use initials)
  return hasContent(profile.avatarUrl) ? safeTrim(profile.avatarUrl) : null;
}

/**
 * Check if user has complete identity information
 * 
 * Complete identity requires:
 * - A meaningful name (firstName + lastName OR displayName with content)
 * - A meaningful email address
 */
export function hasCompleteUserIdentity(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  const hasName = (hasContent(profile.firstName) && hasContent(profile.lastName)) || 
                  hasContent(profile.displayName);
  const hasEmail = hasContent(profile.email);
  
  return hasName && hasEmail;
}

/**
 * Get user identity summary for display
 */
export interface UserIdentitySummary {
  displayName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  hasCompleteIdentity: boolean;
  source: {
    name: 'fullName' | 'displayName' | 'firstName' | 'username' | 'email' | 'fallback';
    email: 'profile' | 'empty';
    avatar: 'url' | 'initials';
  };
}

/**
 * Get comprehensive user identity summary
 */
export function getUserIdentitySummary(profile: UserProfile | null): UserIdentitySummary {
  const displayName = getUserDisplayName(profile);
  const email = getUserEmail(profile);
  const initials = getUserInitials(profile);
  const avatarUrl = getUserAvatarUrl(profile);
  const hasCompleteIdentity = hasCompleteUserIdentity(profile);
  
  // Determine sources for debugging/analytics
  let nameSource: UserIdentitySummary['source']['name'] = 'fallback';
  if (hasContent(profile?.firstName) && hasContent(profile?.lastName)) {
    nameSource = 'fullName';
  } else if (hasContent(profile?.displayName)) {
    nameSource = 'displayName';
  } else if (hasContent(profile?.firstName)) {
    nameSource = 'firstName';
  } else if (hasContent(profile?.username)) {
    nameSource = 'username';
  } else if (hasContent(profile?.email)) {
    nameSource = 'email';
  }
  
  const emailSource: UserIdentitySummary['source']['email'] = hasContent(profile?.email) ? 'profile' : 'empty';
  const avatarSource: UserIdentitySummary['source']['avatar'] = avatarUrl ? 'url' : 'initials';
  
  return {
    displayName,
    email,
    initials,
    avatarUrl,
    hasCompleteIdentity,
    source: {
      name: nameSource,
      email: emailSource,
      avatar: avatarSource
    }
  };
}

/**
 * Get a short display name suitable for limited space contexts
 * 
 * Priority:
 * 1. firstName only (if available)
 * 2. First word of displayName (if available)
 * 3. username (if available)
 * 4. First part of email (if available)
 * 5. "User" (final fallback)
 */
export function getShortDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User';
  
  const { firstName, displayName, username, email } = profile;
  
  // Priority 1: First name only
  if (hasContent(firstName)) {
    return safeTrim(firstName);
  }
  
  // Priority 2: First word of display name
  if (hasContent(displayName)) {
    const firstWord = safeTrim(displayName).split(/\s+/)[0];
    if (firstWord && firstWord.trim()) {
      return firstWord.trim();
    }
  }
  
  // Priority 3: Username
  if (hasContent(username)) {
    return safeTrim(username);
  }
  
  // Priority 4: Email (first part before @)
  if (hasContent(email)) {
    const emailPart = safeTrim(email).split('@')[0];
    if (emailPart && emailPart.trim()) {
      return emailPart.trim();
    }
  }
  
  // Final fallback
  return 'User';
}

/**
 * Get a formal display name suitable for professional contexts
 * 
 * Priority:
 * 1. firstName + lastName (if both available)
 * 2. displayName (if available)
 * 3. username (if available)
 * 4. email (if available)
 * 5. "User" (final fallback)
 */
export function getFormalDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User';
  
  const { firstName, lastName, displayName, username, email } = profile;
  
  // Priority 1: Full formal name
  if (hasContent(firstName) && hasContent(lastName)) {
    return `${safeTrim(firstName)} ${safeTrim(lastName)}`;
  }
  
  // Priority 2: Display name
  if (hasContent(displayName)) {
    return safeTrim(displayName);
  }
  
  // Priority 3: Username
  if (hasContent(username)) {
    return safeTrim(username);
  }
  
  // Priority 4: Email
  if (hasContent(email)) {
    return safeTrim(email);
  }
  
  // Final fallback
  return 'User';
}

/**
 * Check if the user has any meaningful identity data
 */
export function hasAnyUserIdentity(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  return hasContent(profile.firstName) ||
         hasContent(profile.lastName) ||
         hasContent(profile.displayName) ||
         hasContent(profile.username) ||
         hasContent(profile.email);
} 