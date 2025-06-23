<?php
/**
 * API Tracker
 *
 * Handles tracking of API calls, token usage, and statistics.
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Tracker class
 */
class APITracker {
    
    /**
     * Option name for storing summary data
     */
    const SUMMARY_OPTION = 'fitcopilot_api_tracker_summary';
    
    /**
     * Option name for storing daily data
     */
    const DAILY_OPTION = 'fitcopilot_api_tracker_daily';
    
    /**
     * Option name for storing monthly data
     */
    const MONTHLY_OPTION = 'fitcopilot_api_tracker_monthly';
    
    /**
     * Option name for token cost
     */
    const TOKEN_COST_OPTION = 'fitcopilot_api_token_cost';
    
    /**
     * Default token cost per 1M tokens in USD
     */
    const DEFAULT_TOKEN_COST = 0.002;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Initialize tracker on activation
        register_activation_hook(FITCOPILOT_FILE, [$this, 'activate']);
        
        // Hook into API request completion
        add_action('fitcopilot_api_request_complete', [$this, 'track_request'], 10, 3);
    }
    
    /**
     * Activate the tracker
     */
    public function activate() {
        // Initialize options if they don't exist
        if (false === get_option(self::SUMMARY_OPTION)) {
            add_option(self::SUMMARY_OPTION, $this->get_default_summary());
        }
        
        if (false === get_option(self::DAILY_OPTION)) {
            add_option(self::DAILY_OPTION, []);
        }
        
        if (false === get_option(self::MONTHLY_OPTION)) {
            add_option(self::MONTHLY_OPTION, []);
        }
        
        if (false === get_option(self::TOKEN_COST_OPTION)) {
            add_option(self::TOKEN_COST_OPTION, self::DEFAULT_TOKEN_COST);
        }
    }
    
    /**
     * Track an API request
     *
     * @param array  $response    The API response data
     * @param int    $duration_ms The request duration in milliseconds
     * @param string $endpoint    The API endpoint that was called
     */
    public function track_request($response, $duration_ms, $endpoint) {
        // Extract token usage from response
        $prompt_tokens = isset($response['usage']['prompt_tokens']) ? intval($response['usage']['prompt_tokens']) : 0;
        $completion_tokens = isset($response['usage']['completion_tokens']) ? intval($response['usage']['completion_tokens']) : 0;
        $total_tokens = $prompt_tokens + $completion_tokens;
        
        // Get current date
        $today = date('Y-m-d');
        $current_month = date('Y-m');
        
        // Update summary stats
        $this->update_summary_stats($prompt_tokens, $completion_tokens, $duration_ms);
        
        // Update daily stats
        $this->update_daily_stats($today, $prompt_tokens, $completion_tokens, $duration_ms);
        
        // Update monthly stats
        $this->update_monthly_stats($current_month, $prompt_tokens, $completion_tokens, $duration_ms);
    }
    
    /**
     * Update summary statistics
     *
     * @param int $prompt_tokens     Prompt tokens used
     * @param int $completion_tokens Completion tokens used
     * @param int $duration_ms       Request duration in milliseconds
     */
    private function update_summary_stats($prompt_tokens, $completion_tokens, $duration_ms) {
        $summary = get_option(self::SUMMARY_OPTION, $this->get_default_summary());
        
        $summary['total_requests']++;
        $summary['prompt_tokens'] += $prompt_tokens;
        $summary['completion_tokens'] += $completion_tokens;
        $summary['total_tokens'] += ($prompt_tokens + $completion_tokens);
        $summary['total_duration_ms'] += $duration_ms;
        
        // Update option
        update_option(self::SUMMARY_OPTION, $summary);
    }
    
    /**
     * Update daily statistics
     *
     * @param string $date             Date in Y-m-d format
     * @param int    $prompt_tokens    Prompt tokens used
     * @param int    $completion_tokens Completion tokens used
     * @param int    $duration_ms      Request duration in milliseconds
     */
    private function update_daily_stats($date, $prompt_tokens, $completion_tokens, $duration_ms) {
        $daily_stats = get_option(self::DAILY_OPTION, []);
        
        if (!isset($daily_stats[$date])) {
            $daily_stats[$date] = [
                'date' => $date,
                'requests' => 0,
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
                'total_tokens' => 0,
                'total_duration_ms' => 0,
            ];
        }
        
        $daily_stats[$date]['requests']++;
        $daily_stats[$date]['prompt_tokens'] += $prompt_tokens;
        $daily_stats[$date]['completion_tokens'] += $completion_tokens;
        $daily_stats[$date]['total_tokens'] += ($prompt_tokens + $completion_tokens);
        $daily_stats[$date]['total_duration_ms'] += $duration_ms;
        
        // Maintain only the last 90 days of data
        if (count($daily_stats) > 90) {
            ksort($daily_stats);
            $daily_stats = array_slice($daily_stats, -90, 90, true);
        }
        
        // Update option
        update_option(self::DAILY_OPTION, $daily_stats);
    }
    
    /**
     * Update monthly statistics
     *
     * @param string $month            Month in Y-m format
     * @param int    $prompt_tokens    Prompt tokens used
     * @param int    $completion_tokens Completion tokens used
     * @param int    $duration_ms      Request duration in milliseconds
     */
    private function update_monthly_stats($month, $prompt_tokens, $completion_tokens, $duration_ms) {
        $monthly_stats = get_option(self::MONTHLY_OPTION, []);
        
        if (!isset($monthly_stats[$month])) {
            $monthly_stats[$month] = [
                'month' => $month,
                'requests' => 0,
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
                'total_tokens' => 0,
                'total_duration_ms' => 0,
            ];
        }
        
        $monthly_stats[$month]['requests']++;
        $monthly_stats[$month]['prompt_tokens'] += $prompt_tokens;
        $monthly_stats[$month]['completion_tokens'] += $completion_tokens;
        $monthly_stats[$month]['total_tokens'] += ($prompt_tokens + $completion_tokens);
        $monthly_stats[$month]['total_duration_ms'] += $duration_ms;
        
        // Maintain only the last 24 months of data
        if (count($monthly_stats) > 24) {
            ksort($monthly_stats);
            $monthly_stats = array_slice($monthly_stats, -24, 24, true);
        }
        
        // Update option
        update_option(self::MONTHLY_OPTION, $monthly_stats);
    }
    
    /**
     * Get default summary data structure
     *
     * @return array Default summary structure
     */
    private function get_default_summary() {
        return [
            'total_requests' => 0,
            'prompt_tokens' => 0,
            'completion_tokens' => 0,
            'total_tokens' => 0,
            'total_duration_ms' => 0,
        ];
    }
    
    /**
     * Get summary statistics
     *
     * @return array Summary statistics
     */
    public function get_summary() {
        $summary = get_option(self::SUMMARY_OPTION, $this->get_default_summary());
        
        // Calculate average tokens per request
        $avg_tokens = $summary['total_requests'] > 0 
            ? round($summary['total_tokens'] / $summary['total_requests'], 2) 
            : 0;
        
        // Calculate average duration per request
        $avg_duration = $summary['total_requests'] > 0 
            ? round($summary['total_duration_ms'] / $summary['total_requests'], 2) 
            : 0;
        
        // Calculate estimated cost
        $token_cost = $this->get_token_cost();
        $estimated_cost = ($summary['total_tokens'] / 1000000) * $token_cost;
        
        // Add calculated values to summary
        $summary['avg_tokens'] = $avg_tokens;
        $summary['avg_duration_ms'] = $avg_duration;
        $summary['estimated_cost'] = round($estimated_cost, 4);
        
        return $summary;
    }
    
    /**
     * Get daily statistics
     *
     * @param int $days Number of days to retrieve (default: 30)
     * @return array Daily statistics
     */
    public function get_daily_stats($days = 30) {
        $daily_stats = get_option(self::DAILY_OPTION, []);
        
        // Sort by date
        ksort($daily_stats);
        
        // Get only the requested number of days
        $daily_stats = array_slice($daily_stats, -$days, $days, true);
        
        // Convert to indexed array
        return array_values($daily_stats);
    }
    
    /**
     * Get monthly statistics
     *
     * @param int $months Number of months to retrieve (default: 12)
     * @return array Monthly statistics
     */
    public function get_monthly_stats($months = 12) {
        $monthly_stats = get_option(self::MONTHLY_OPTION, []);
        
        // Sort by month
        ksort($monthly_stats);
        
        // Get only the requested number of months
        $monthly_stats = array_slice($monthly_stats, -$months, $months, true);
        
        // Convert to indexed array
        return array_values($monthly_stats);
    }
    
    /**
     * Get token cost per 1M tokens in USD
     *
     * @return float Token cost
     */
    public function get_token_cost() {
        return floatval(get_option(self::TOKEN_COST_OPTION, self::DEFAULT_TOKEN_COST));
    }
    
    /**
     * Update token cost per 1M tokens in USD
     *
     * @param float $cost New token cost
     * @return bool Whether the update was successful
     */
    public function update_token_cost($cost) {
        $cost = floatval($cost);
        
        if ($cost <= 0) {
            return false;
        }
        
        return update_option(self::TOKEN_COST_OPTION, $cost);
    }
    
    /**
     * Reset all statistics
     *
     * @return bool Whether the reset was successful
     */
    public function reset_stats() {
        $reset_summary = update_option(self::SUMMARY_OPTION, $this->get_default_summary());
        $reset_daily = update_option(self::DAILY_OPTION, []);
        $reset_monthly = update_option(self::MONTHLY_OPTION, []);
        
        return $reset_summary && $reset_daily && $reset_monthly;
    }
}

// Initialize the API Tracker
new APITracker(); 