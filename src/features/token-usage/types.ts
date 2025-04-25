/**
 * Token Usage Types
 */

/**
 * Model information with pricing
 */
export interface AIModel {
  id: string;
  name: string;
  prompt_cost: number;
  completion_cost: number;
  total_tokens: number;
  estimated_cost: number;
}

/**
 * Token usage summary statistics
 */
export interface TokenSummary {
  // Overall statistics
  total_tokens: number;
  total_requests: number;
  total_cost: number;
  
  // Per-model statistics
  models: AIModel[];
  
  // Time period
  start_date: string;
  end_date: string;
}

/**
 * Base stats interface containing common properties
 */
interface BaseStats {
  requests: number;
  total_tokens: number;
  estimated_cost: number;
}

/**
 * Daily token statistics
 */
export interface DailyTokenStats extends BaseStats {
  date: string; // ISO format: YYYY-MM-DD
  models: {
    [modelId: string]: {
      tokens: number;
      cost: number;
    };
  };
}

/**
 * Monthly token statistics
 */
export interface MonthlyTokenStats extends BaseStats {
  month: string; // Format: YYYY-MM
  models: {
    [modelId: string]: {
      tokens: number;
      cost: number;
    };
  };
}

/**
 * Model breakdown data
 */
export interface ModelBreakdown {
  model_id: string;
  model_name: string;
  tokens: number;
  percentage: number;
  cost: number;
}

/**
 * Props for the SummaryCard component
 */
export interface SummaryCardProps {
  summary: TokenSummary | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Props for the UsageChart component
 */
export interface UsageChartProps {
  data: (DailyTokenStats | MonthlyTokenStats)[];
  isLoading: boolean;
  error: string | null;
  dateKey: 'date' | 'month';
  title: string;
}

/**
 * Props for the ModelDistribution component
 */
export interface ModelDistributionProps {
  models: AIModel[];
  isLoading: boolean;
  error: string | null;
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