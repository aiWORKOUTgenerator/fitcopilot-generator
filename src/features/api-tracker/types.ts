/**
 * API Tracker Types
 */

/**
 * API Summary statistics
 */
export interface APISummary {
  // Request counts
  total_requests: number;
  
  // Token counts
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  
  // Averages
  avg_tokens: number;
  avg_duration_ms: number;
  
  // Cost information
  token_cost: number;
  estimated_cost: number;
  
  // Total duration
  total_duration_ms: number;
}

/**
 * Base stats interface containing common properties
 */
interface BaseStats {
  requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_duration_ms: number;
}

/**
 * Daily statistics
 */
export interface DailyStats extends BaseStats {
  date: string; // ISO format: YYYY-MM-DD
}

/**
 * Monthly statistics
 */
export interface MonthlyStats extends BaseStats {
  month: string; // Format: YYYY-MM
}

/**
 * Props for the SummaryCard component
 */
export interface SummaryCardProps {
  summary: APISummary | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Props for the TokenCostSetting component
 */
export interface TokenCostSettingProps {
  currentCost: number;
  onUpdateCost: (cost: number) => Promise<boolean>;
}

/**
 * Props for the UsageChart component
 */
export interface UsageChartProps {
  data: (DailyStats | MonthlyStats)[];
  isLoading: boolean;
  error: string | null;
  dateKey: 'date' | 'month';
  title: string;
}

/**
 * Props for the ResetStats component
 */
export interface ResetStatsProps {
  onResetStats: () => Promise<boolean>;
}

/**
 * API Response structure
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
} 