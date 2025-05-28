/**
 * User Display Utilities Tests
 * 
 * Tests for user display logic with fallback hierarchy
 */

import {
  getUserDisplayName,
  getUserEmail,
  getUserInitials,
  getUserAvatarUrl,
  hasCompleteUserIdentity,
  getUserIdentitySummary,
  getShortDisplayName,
  getFormalDisplayName,
  hasAnyUserIdentity,
  UserIdentitySummary
} from '../../../../../src/features/profile/utils/userDisplay';
import { UserProfile } from '../../../../../src/features/profile/types/profile';

describe('User Display Utilities', () => {
  // Test profiles for different scenarios
  const completeProfile: UserProfile = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
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
  };

  const displayNameOnlyProfile: UserProfile = {
    ...completeProfile,
    firstName: undefined,
    lastName: undefined,
    displayName: 'Mike Johnson'
  };

  const firstNameOnlyProfile: UserProfile = {
    ...completeProfile,
    firstName: 'Jane',
    lastName: undefined,
    displayName: undefined
  };

  const usernameOnlyProfile: UserProfile = {
    ...completeProfile,
    firstName: undefined,
    lastName: undefined,
    displayName: undefined,
    username: 'fitnessfan2024'
  };

  const emailOnlyProfile: UserProfile = {
    ...completeProfile,
    firstName: undefined,
    lastName: undefined,
    displayName: undefined,
    username: undefined,
    email: 'anonymous@example.com'
  };

  const minimalProfile: UserProfile = {
    ...completeProfile,
    firstName: undefined,
    lastName: undefined,
    displayName: undefined,
    username: undefined,
    email: undefined,
    avatarUrl: undefined
  };

  describe('getUserDisplayName', () => {
    it('returns full name when both firstName and lastName are available', () => {
      expect(getUserDisplayName(completeProfile)).toBe('John Doe');
    });

    it('returns displayName when firstName/lastName are not available', () => {
      expect(getUserDisplayName(displayNameOnlyProfile)).toBe('Mike Johnson');
    });

    it('returns firstName only when lastName is not available', () => {
      expect(getUserDisplayName(firstNameOnlyProfile)).toBe('Jane');
    });

    it('returns username when name fields are not available', () => {
      expect(getUserDisplayName(usernameOnlyProfile)).toBe('fitnessfan2024');
    });

    it('returns email part before @ when only email is available', () => {
      expect(getUserDisplayName(emailOnlyProfile)).toBe('anonymous');
    });

    it('returns "User" as final fallback', () => {
      expect(getUserDisplayName(minimalProfile)).toBe('User');
    });

    it('returns "User" for null profile', () => {
      expect(getUserDisplayName(null)).toBe('User');
    });

    it('handles empty strings correctly', () => {
      const emptyStringsProfile = {
        ...completeProfile,
        firstName: '',
        lastName: '',
        displayName: '',
        username: '',
        email: ''
      };
      expect(getUserDisplayName(emptyStringsProfile)).toBe('User');
    });

    it('trims whitespace from names', () => {
      const whitespaceProfile = {
        ...completeProfile,
        firstName: '  John  ',
        lastName: '  Doe  '
      };
      expect(getUserDisplayName(whitespaceProfile)).toBe('John Doe');
    });
  });

  describe('getUserEmail', () => {
    it('returns email when available', () => {
      expect(getUserEmail(completeProfile)).toBe('john.doe@example.com');
    });

    it('returns empty string when email is not available', () => {
      expect(getUserEmail(minimalProfile)).toBe('');
    });

    it('returns empty string for null profile', () => {
      expect(getUserEmail(null)).toBe('');
    });
  });

  describe('getUserInitials', () => {
    it('returns firstName + lastName initials when both available', () => {
      expect(getUserInitials(completeProfile)).toBe('JD');
    });

    it('returns displayName initials when firstName/lastName not available', () => {
      expect(getUserInitials(displayNameOnlyProfile)).toBe('MJ');
    });

    it('returns single initial from displayName when only one word', () => {
      const singleWordProfile = {
        ...displayNameOnlyProfile,
        displayName: 'Madonna'
      };
      expect(getUserInitials(singleWordProfile)).toBe('M');
    });

    it('returns firstName initial when lastName not available', () => {
      expect(getUserInitials(firstNameOnlyProfile)).toBe('J');
    });

    it('returns username initial when name fields not available', () => {
      expect(getUserInitials(usernameOnlyProfile)).toBe('F');
    });

    it('returns email initial when only email available', () => {
      expect(getUserInitials(emailOnlyProfile)).toBe('A');
    });

    it('returns "U" as final fallback', () => {
      expect(getUserInitials(minimalProfile)).toBe('U');
    });

    it('returns "U" for null profile', () => {
      expect(getUserInitials(null)).toBe('U');
    });

    it('handles displayName with multiple words correctly', () => {
      const multiWordProfile = {
        ...displayNameOnlyProfile,
        displayName: 'Mary Jane Watson Smith'
      };
      expect(getUserInitials(multiWordProfile)).toBe('MJ'); // First two words
    });
  });

  describe('getUserAvatarUrl', () => {
    it('returns avatarUrl when available', () => {
      expect(getUserAvatarUrl(completeProfile)).toBe('https://example.com/avatar.jpg');
    });

    it('returns null when avatarUrl is not available', () => {
      expect(getUserAvatarUrl(minimalProfile)).toBe(null);
    });

    it('returns null for null profile', () => {
      expect(getUserAvatarUrl(null)).toBe(null);
    });
  });

  describe('hasCompleteUserIdentity', () => {
    it('returns true when user has complete identity (full name + email)', () => {
      expect(hasCompleteUserIdentity(completeProfile)).toBe(true);
    });

    it('returns true when user has displayName + email', () => {
      const displayNameProfile = {
        ...completeProfile,
        firstName: undefined,
        lastName: undefined,
        displayName: 'John Doe'
      };
      expect(hasCompleteUserIdentity(displayNameProfile)).toBe(true);
    });

    it('returns false when user has name but no email', () => {
      const noEmailProfile = {
        ...completeProfile,
        email: undefined
      };
      expect(hasCompleteUserIdentity(noEmailProfile)).toBe(false);
    });

    it('returns false when user has email but no name', () => {
      const noNameProfile = {
        ...completeProfile,
        firstName: undefined,
        lastName: undefined,
        displayName: undefined
      };
      expect(hasCompleteUserIdentity(noNameProfile)).toBe(false);
    });

    it('returns false for null profile', () => {
      expect(hasCompleteUserIdentity(null)).toBe(false);
    });
  });

  describe('getUserIdentitySummary', () => {
    it('returns complete summary for full profile', () => {
      const summary = getUserIdentitySummary(completeProfile);
      
      expect(summary).toEqual({
        displayName: 'John Doe',
        email: 'john.doe@example.com',
        initials: 'JD',
        avatarUrl: 'https://example.com/avatar.jpg',
        hasCompleteIdentity: true,
        source: {
          name: 'fullName',
          email: 'profile',
          avatar: 'url'
        }
      });
    });

    it('returns summary with displayName source', () => {
      const summary = getUserIdentitySummary(displayNameOnlyProfile);
      
      expect(summary.displayName).toBe('Mike Johnson');
      expect(summary.source.name).toBe('displayName');
    });

    it('returns summary with firstName source', () => {
      const summary = getUserIdentitySummary(firstNameOnlyProfile);
      
      expect(summary.displayName).toBe('Jane');
      expect(summary.source.name).toBe('firstName');
    });

    it('returns summary with username source', () => {
      const summary = getUserIdentitySummary(usernameOnlyProfile);
      
      expect(summary.displayName).toBe('fitnessfan2024');
      expect(summary.source.name).toBe('username');
    });

    it('returns summary with email source', () => {
      const summary = getUserIdentitySummary(emailOnlyProfile);
      
      expect(summary.displayName).toBe('anonymous');
      expect(summary.source.name).toBe('email');
    });

    it('returns summary with fallback source', () => {
      const summary = getUserIdentitySummary(minimalProfile);
      
      expect(summary.displayName).toBe('User');
      expect(summary.source.name).toBe('fallback');
      expect(summary.source.email).toBe('empty');
      expect(summary.source.avatar).toBe('initials');
    });

    it('returns summary for null profile', () => {
      const summary = getUserIdentitySummary(null);
      
      expect(summary).toEqual({
        displayName: 'User',
        email: '',
        initials: 'U',
        avatarUrl: null,
        hasCompleteIdentity: false,
        source: {
          name: 'fallback',
          email: 'empty',
          avatar: 'initials'
        }
      });
    });

    it('correctly identifies incomplete identity scenarios', () => {
      const noEmailSummary = getUserIdentitySummary({
        ...completeProfile,
        email: undefined
      });
      expect(noEmailSummary.hasCompleteIdentity).toBe(false);

      const noNameSummary = getUserIdentitySummary({
        ...completeProfile,
        firstName: undefined,
        lastName: undefined,
        displayName: undefined
      });
      expect(noNameSummary.hasCompleteIdentity).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles profiles with only whitespace in fields', () => {
      const whitespaceProfile = {
        ...completeProfile,
        firstName: '   ',
        lastName: '   ',
        displayName: '   ',
        username: '   ',
        email: '   '
      };

      expect(getUserDisplayName(whitespaceProfile)).toBe('User');
      expect(getUserInitials(whitespaceProfile)).toBe('U');
    });

    it('handles email without @ symbol', () => {
      const invalidEmailProfile = {
        ...completeProfile,
        firstName: undefined,
        lastName: undefined,
        displayName: undefined,
        username: undefined,
        email: 'invalidemail'
      };

      expect(getUserDisplayName(invalidEmailProfile)).toBe('invalidemail');
    });

    it('handles very long names gracefully', () => {
      const longNameProfile = {
        ...completeProfile,
        firstName: 'Verylongfirstnamethatexceedsnormallimits',
        lastName: 'Verylonglastnamethatexceedsnormallimits'
      };

      const displayName = getUserDisplayName(longNameProfile);
      expect(displayName).toContain('Verylongfirstnamethatexceedsnormallimits');
      expect(displayName).toContain('Verylonglastnamethatexceedsnormallimits');
    });

    it('handles special characters in names', () => {
      const specialCharsProfile = {
        ...completeProfile,
        firstName: 'José',
        lastName: "O'Connor"
      };

      expect(getUserDisplayName(specialCharsProfile)).toBe("José O'Connor");
      expect(getUserInitials(specialCharsProfile)).toBe('JO');
    });
  });

  describe('getShortDisplayName', () => {
    it('returns firstName when available', () => {
      expect(getShortDisplayName(completeProfile)).toBe('John');
    });

    it('returns first word of displayName when firstName not available', () => {
      expect(getShortDisplayName(displayNameOnlyProfile)).toBe('Mike');
    });

    it('returns username when name fields not available', () => {
      expect(getShortDisplayName(usernameOnlyProfile)).toBe('fitnessfan2024');
    });

    it('returns email part when only email available', () => {
      expect(getShortDisplayName(emailOnlyProfile)).toBe('anonymous');
    });

    it('returns "User" for minimal profile', () => {
      expect(getShortDisplayName(minimalProfile)).toBe('User');
    });

    it('returns "User" for null profile', () => {
      expect(getShortDisplayName(null)).toBe('User');
    });
  });

  describe('getFormalDisplayName', () => {
    it('returns full name when both firstName and lastName available', () => {
      expect(getFormalDisplayName(completeProfile)).toBe('John Doe');
    });

    it('returns displayName when firstName/lastName not available', () => {
      expect(getFormalDisplayName(displayNameOnlyProfile)).toBe('Mike Johnson');
    });

    it('returns username when name fields not available', () => {
      expect(getFormalDisplayName(usernameOnlyProfile)).toBe('fitnessfan2024');
    });

    it('returns email when only email available', () => {
      expect(getFormalDisplayName(emailOnlyProfile)).toBe('anonymous@example.com');
    });

    it('returns "User" for minimal profile', () => {
      expect(getFormalDisplayName(minimalProfile)).toBe('User');
    });

    it('returns "User" for null profile', () => {
      expect(getFormalDisplayName(null)).toBe('User');
    });
  });

  describe('hasAnyUserIdentity', () => {
    it('returns true when user has firstName', () => {
      expect(hasAnyUserIdentity(firstNameOnlyProfile)).toBe(true);
    });

    it('returns true when user has displayName', () => {
      expect(hasAnyUserIdentity(displayNameOnlyProfile)).toBe(true);
    });

    it('returns true when user has username', () => {
      expect(hasAnyUserIdentity(usernameOnlyProfile)).toBe(true);
    });

    it('returns true when user has email', () => {
      expect(hasAnyUserIdentity(emailOnlyProfile)).toBe(true);
    });

    it('returns false for minimal profile', () => {
      expect(hasAnyUserIdentity(minimalProfile)).toBe(false);
    });

    it('returns false for null profile', () => {
      expect(hasAnyUserIdentity(null)).toBe(false);
    });

    it('returns false for whitespace-only fields', () => {
      const whitespaceProfile = {
        ...completeProfile,
        firstName: '   ',
        lastName: '   ',
        displayName: '   ',
        username: '   ',
        email: '   '
      };
      expect(hasAnyUserIdentity(whitespaceProfile)).toBe(false);
    });
  });
}); 