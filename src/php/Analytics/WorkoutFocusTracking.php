<?php
/**
 * Workout Focus Analytics Tracking
 * 
 * Handles tracking and caching of workout focus selections for analytics
 * and user experience (remembering last selection).
 */

namespace FitCopilot\Analytics;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class WorkoutFocusTracking {
    
    /**
     * User meta key for storing last workout focus selection
     */
    const LAST_FOCUS_META_KEY = 'fitcopilot_last_workout_focus';
    
    /**
     * User meta key for storing workout focus history
     */
    const FOCUS_HISTORY_META_KEY = 'fitcopilot_workout_focus_history';
    
    /**
     * Maximum number of focus selections to keep in history
     */
    const MAX_HISTORY_ENTRIES = 50;
    
    /**
     * Initialize workout focus tracking
     */
    public static function init() {
        // Register AJAX handlers
        add_action('wp_ajax_fitcopilot_track_workout_focus', [__CLASS__, 'handle_track_workout_focus']);
        add_action('wp_ajax_nopriv_fitcopilot_track_workout_focus', [__CLASS__, 'handle_track_workout_focus']);
        
        // Register REST API endpoints
        add_action('rest_api_init', [__CLASS__, 'register_rest_endpoints']);
    }
    
    /**
     * Register REST API endpoints for workout focus tracking
     */
    public static function register_rest_endpoints() {
        // Track workout focus selection
        register_rest_route('fitcopilot/v1', '/analytics/workout-focus', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'track_workout_focus_selection'],
            'permission_callback' => function() {
                return is_user_logged_in();
            },
            'args' => [
                'focus' => [
                    'required' => true,
                    'type' => 'string',
                    'enum' => ['fat-burning', 'muscle-building', 'endurance', 'strength', 'flexibility', 'general-fitness']
                ],
                'context' => [
                    'required' => false,
                    'type' => 'object'
                ]
            ]
        ]);
        
        // Get last workout focus selection
        register_rest_route('fitcopilot/v1', '/analytics/workout-focus/last', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_last_workout_focus'],
            'permission_callback' => function() {
                return is_user_logged_in();
            }
        ]);
        
        // Get workout focus analytics
        register_rest_route('fitcopilot/v1', '/analytics/workout-focus/stats', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_workout_focus_analytics'],
            'permission_callback' => function() {
                return is_user_logged_in();
            }
        ]);
    }
    
    /**
     * Track a workout focus selection
     * 
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public static function track_workout_focus_selection($request) {
        $user_id = get_current_user_id();
        $focus = $request->get_param('focus');
        $context = $request->get_param('context') ?: [];
        
        try {
            // Store as last selection (indefinite cache)
            $last_selection_data = [
                'focus' => $focus,
                'timestamp' => current_time('timestamp'),
                'context' => $context
            ];
            
            update_user_meta($user_id, self::LAST_FOCUS_META_KEY, $last_selection_data);
            
            // Add to history for analytics
            self::add_to_focus_history($user_id, $focus, $context);
            
            // Log analytics event
            self::log_analytics_event($user_id, 'workout_focus_selected', [
                'focus' => $focus,
                'context' => $context,
                'timestamp' => current_time('timestamp')
            ]);
            
            return new \WP_REST_Response([
                'success' => true,
                'message' => 'Workout focus tracked successfully',
                'data' => [
                    'focus' => $focus,
                    'cached_until' => 'indefinite'
                ]
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to track workout focus: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the last workout focus selection for a user
     * 
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public static function get_last_workout_focus($request) {
        $user_id = get_current_user_id();
        
        $last_selection = get_user_meta($user_id, self::LAST_FOCUS_META_KEY, true);
        
        if (empty($last_selection)) {
            return new \WP_REST_Response([
                'success' => true,
                'message' => 'No previous workout focus found',
                'data' => null
            ], 200);
        }
        
        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Last workout focus retrieved',
            'data' => [
                'focus' => $last_selection['focus'],
                'timestamp' => $last_selection['timestamp'],
                'context' => $last_selection['context'] ?? [],
                'cached_since' => date('Y-m-d H:i:s', $last_selection['timestamp'])
            ]
        ], 200);
    }
    
    /**
     * Get workout focus analytics for a user
     * 
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public static function get_workout_focus_analytics($request) {
        $user_id = get_current_user_id();
        
        $history = get_user_meta($user_id, self::FOCUS_HISTORY_META_KEY, true);
        
        if (empty($history)) {
            return new \WP_REST_Response([
                'success' => true,
                'message' => 'No workout focus history found',
                'data' => [
                    'total_selections' => 0,
                    'focus_distribution' => [],
                    'recent_selections' => [],
                    'trends' => []
                ]
            ], 200);
        }
        
        $analytics = self::analyze_focus_history($history);
        
        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Workout focus analytics retrieved',
            'data' => $analytics
        ], 200);
    }
    
    /**
     * Add a focus selection to user's history
     * 
     * @param int $user_id
     * @param string $focus
     * @param array $context
     */
    private static function add_to_focus_history($user_id, $focus, $context = []) {
        $history = get_user_meta($user_id, self::FOCUS_HISTORY_META_KEY, true);
        
        if (!is_array($history)) {
            $history = [];
        }
        
        // Add new entry
        $history[] = [
            'focus' => $focus,
            'timestamp' => current_time('timestamp'),
            'context' => $context
        ];
        
        // Keep only the most recent entries
        if (count($history) > self::MAX_HISTORY_ENTRIES) {
            $history = array_slice($history, -self::MAX_HISTORY_ENTRIES);
        }
        
        update_user_meta($user_id, self::FOCUS_HISTORY_META_KEY, $history);
    }
    
    /**
     * Analyze focus history for analytics
     * 
     * @param array $history
     * @return array
     */
    private static function analyze_focus_history($history) {
        $total_selections = count($history);
        $focus_counts = [];
        $recent_selections = array_slice($history, -10); // Last 10 selections
        
        // Count focus types
        foreach ($history as $entry) {
            $focus = $entry['focus'];
            $focus_counts[$focus] = ($focus_counts[$focus] ?? 0) + 1;
        }
        
        // Calculate percentages
        $focus_distribution = [];
        foreach ($focus_counts as $focus => $count) {
            $focus_distribution[$focus] = [
                'count' => $count,
                'percentage' => round(($count / $total_selections) * 100, 1)
            ];
        }
        
        // Analyze trends (last 30 days vs previous 30 days)
        $trends = self::calculate_focus_trends($history);
        
        return [
            'total_selections' => $total_selections,
            'focus_distribution' => $focus_distribution,
            'recent_selections' => $recent_selections,
            'trends' => $trends,
            'most_popular' => array_keys($focus_counts, max($focus_counts))[0] ?? null,
            'analysis_date' => current_time('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Calculate focus trends over time
     * 
     * @param array $history
     * @return array
     */
    private static function calculate_focus_trends($history) {
        $now = current_time('timestamp');
        $thirty_days_ago = $now - (30 * 24 * 60 * 60);
        $sixty_days_ago = $now - (60 * 24 * 60 * 60);
        
        $recent_period = [];
        $previous_period = [];
        
        foreach ($history as $entry) {
            $timestamp = $entry['timestamp'];
            
            if ($timestamp >= $thirty_days_ago) {
                $recent_period[] = $entry['focus'];
            } elseif ($timestamp >= $sixty_days_ago) {
                $previous_period[] = $entry['focus'];
            }
        }
        
        $recent_counts = array_count_values($recent_period);
        $previous_counts = array_count_values($previous_period);
        
        $trends = [];
        $all_focuses = array_unique(array_merge(array_keys($recent_counts), array_keys($previous_counts)));
        
        foreach ($all_focuses as $focus) {
            $recent = $recent_counts[$focus] ?? 0;
            $previous = $previous_counts[$focus] ?? 0;
            
            if ($previous > 0) {
                $change = (($recent - $previous) / $previous) * 100;
            } else {
                $change = $recent > 0 ? 100 : 0;
            }
            
            $trends[$focus] = [
                'recent_count' => $recent,
                'previous_count' => $previous,
                'change_percentage' => round($change, 1),
                'trend' => $change > 10 ? 'increasing' : ($change < -10 ? 'decreasing' : 'stable')
            ];
        }
        
        return $trends;
    }
    
    /**
     * Log analytics event
     * 
     * @param int $user_id
     * @param string $event_type
     * @param array $event_data
     */
    private static function log_analytics_event($user_id, $event_type, $event_data) {
        // Use existing analytics logging if available
        if (function_exists('FitCopilot\\Analytics\\log_event')) {
            \FitCopilot\Analytics\log_event($user_id, $event_type, $event_data);
        } else {
            // Fallback logging
            error_log(
                sprintf(
                    'FitCopilot Workout Focus Analytics: [User: %d] [Event: %s] [Data: %s]',
                    $user_id,
                    $event_type,
                    json_encode($event_data)
                )
            );
        }
    }
    
    /**
     * Handle AJAX tracking (legacy support)
     */
    public static function handle_track_workout_focus() {
        // Verify nonce
        if (!check_ajax_referer('fitcopilot_analytics', 'security', false)) {
            wp_send_json_error(['message' => 'Invalid security token'], 403);
            exit;
        }
        
        $focus = sanitize_text_field($_POST['focus'] ?? '');
        $context = json_decode($_POST['context'] ?? '{}', true);
        
        if (empty($focus)) {
            wp_send_json_error(['message' => 'Focus parameter is required'], 400);
            exit;
        }
        
        $user_id = get_current_user_id();
        
        try {
            // Store as last selection
            $last_selection_data = [
                'focus' => $focus,
                'timestamp' => current_time('timestamp'),
                'context' => $context
            ];
            
            update_user_meta($user_id, self::LAST_FOCUS_META_KEY, $last_selection_data);
            
            // Add to history
            self::add_to_focus_history($user_id, $focus, $context);
            
            wp_send_json_success([
                'message' => 'Workout focus tracked successfully',
                'focus' => $focus
            ]);
            
        } catch (\Exception $e) {
            wp_send_json_error(['message' => 'Failed to track workout focus'], 500);
        }
        
        exit;
    }
}

// Initialize the tracking
WorkoutFocusTracking::init(); 