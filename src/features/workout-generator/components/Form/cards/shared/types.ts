/**
 * Shared types for workout generator cards
 * Ensures consistency across all modular card components
 */

export interface BaseCardProps {
  delay?: number;
  className?: string;
}

export interface ProfileBadge {
  value: string;
  display: string;
  icon?: string;
  color?: string;
  bgColor?: string;
}

export interface FallbackHeader {
  icon: string;
  text: string;
  subtitle: string;
}

export interface GridOption<T = string> {
  value: T;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: string;
}

export interface SelectionOption {
  value: string | number;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: string;
}

// Card-specific interfaces
export interface FocusOption extends GridOption<string> {}
export interface IntensityOption extends GridOption<number> {}
export interface DurationOption extends GridOption<number> {}
export interface EquipmentOption extends GridOption<string> {}
export interface RestrictionOption extends GridOption<string> {}
export interface LocationOption extends GridOption<string> {}

// Common card hook return types
export interface BaseCardHookReturn {
  isLoading: boolean;
  error?: string;
  hasProfileData: boolean;
}

export interface SelectionCardHookReturn<T> extends BaseCardHookReturn {
  selectedValue: T;
  options: GridOption<T>[];
  profileBadges: ProfileBadge[];
  handleSelection: (value: T) => void;
}

export interface MultiSelectCardHookReturn<T> extends BaseCardHookReturn {
  selectedValues: T[];
  options: GridOption<T>[];
  profileBadges: ProfileBadge[];
  handleToggle: (value: T) => void;
} 