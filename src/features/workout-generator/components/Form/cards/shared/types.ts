/**
 * Shared types for workout generator cards
 */

export interface CardProfileSection {
  label: string;
  badges?: Array<{
    value: string;
    display: string;
    icon?: string;
    color?: string;
    bgColor?: string;
  }>;
  fallback?: {
    icon: string;
    text: string;
    subtitle: string;
  };
}

export interface GridOption<T = string> {
  value: T;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: string;
  bgColor?: string;
}

export interface SelectionHookReturn<T> {
  selectedValues: T[];
  isLoading: boolean;
  error?: string;
  handleSelection: (value: T) => void;
  handleMultiSelection: (values: T[]) => void;
}

export type CardVariant = 'standard' | 'complex';

export interface BaseCardProps {
  delay?: number;
  className?: string;
} 