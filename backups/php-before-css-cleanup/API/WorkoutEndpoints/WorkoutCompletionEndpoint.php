<?php
/**
 * Workout Completion Endpoint
 *
 * Handles workout completion requests through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Workout Completion Endpoint class
 */
class WorkoutCompletionEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/workouts/(?P<id>\d+)/complete';
        $this->method = 'POST';
        
        parent::__construct();
        
        error_log('FitCopilot WorkoutCompletionEndpoint initialized');
    }
    
    /**
     * Handle workout completion request
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);
        
        if (!$post || $post->post_type !== 'fc_workout' || $post->post_author != get_current_user_id()) {
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
        }
        
        // Get the current user ID
        $user_id = get_current_user_id();
        
        // Parse and validate parameters
        $params = $request->get_json_params() ?: [];
        
        // Normalize request data to support both direct and wrapped formats
        $params = APIUtils::normalize_request_data($params, 'completion');
        
        // Get the client-provided version for concurrency control
        $client_version = isset($params['version']) ? (int) $params['version'] : null;
        
        // Validate client version
        $validation_result = VersioningUtils::validate_client_version($post_id, $client_version, $request);
        if ($validation_result !== false) {
            return $validation_result['response'];
        }
        
        // Start a database transaction for concurrency control
        $versioning_service = VersioningUtils::start_transaction();
        
        try {
            // Get the workout state before changes
            $before_state = VersioningUtils::get_workout_state($post_id, $user_id, $versioning_service);
            
            // If we couldn't get the before state, return an error
            if ($before_state === null || $before_state === false) {
                VersioningUtils::rollback_transaction($versioning_service);
                
                return APIUtils::create_api_error(
                    'versioning_error',
                    __('Could not get current workout state for versioning.', 'fitcopilot')
                );
            }
            
            $completion_date = current_time('mysql');
            
            // Get existing completions
            $completions = get_post_meta($post_id, '_workout_completions', true);
            
            if (!$completions) {
                $completions = [];
            }
            
            // Add new completion with any additional data
            $completion_data = array_merge([
                'user_id' => $user_id,
                'date'    => $completion_date,
            ], $params);
            
            $completions[] = $completion_data;
            
            // Update post meta
            update_post_meta($post_id, '_workout_completions', $completions);
            update_post_meta($post_id, '_workout_last_completed', $completion_date);
            
            // Get the workout state after changes
            $after_state = VersioningUtils::get_workout_state($post_id, $user_id, $versioning_service);
            
            // Create a version record for the changes
            $change_type = 'completion';
            $change_summary = 'Workout completed';
            
            $new_version = VersioningUtils::create_version_record(
                $post_id,
                $before_state,
                $user_id,
                $change_type,
                $change_summary,
                $versioning_service
            );
            
            if ($new_version === false) {
                VersioningUtils::rollback_transaction($versioning_service);
                
                return APIUtils::create_api_error(
                    'version_creation_failed',
                    __('Failed to create version record.', 'fitcopilot')
                );
            }
            
            // Commit the transaction
            VersioningUtils::commit_transaction($versioning_service);
            
            // Get the current version metadata for the response
            $metadata = VersioningUtils::get_version_metadata($post_id, $post);
            
            // Set the ETag header for the response
            APIUtils::set_etag_header($metadata['version']);
            
            return APIUtils::create_api_response(
                APIUtils::add_version_metadata_to_response(
                    [
                        'id' => $post_id,
                        'completion_date' => $completion_date,
                        'completion_data' => $completion_data,
                    ],
                    $metadata,
                    $change_type,
                    $change_summary
                ),
                APIUtils::get_success_message('complete', 'workout')
            );
        } catch (\Exception $e) {
            // Rollback the transaction on any error
            VersioningUtils::rollback_transaction($versioning_service);
            
            return APIUtils::create_api_error(
                'completion_failed',
                $e->getMessage()
            );
        }
    }
} 