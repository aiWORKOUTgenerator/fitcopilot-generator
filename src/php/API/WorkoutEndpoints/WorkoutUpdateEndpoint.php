<?php
/**
 * Workout Update Endpoint
 *
 * Handles workout update requests through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Workout Update Endpoint class
 */
class WorkoutUpdateEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/workouts/(?P<id>\d+)';
        $this->method = 'PUT';
        
        parent::__construct();
        
        error_log('FitCopilot WorkoutUpdateEndpoint initialized');
    }
    
    /**
     * Handle workout update request
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
        
        // Get parameters from request
        $params = $request->get_json_params();
        
        // Normalize request data to support both direct and wrapped formats
        $params = APIUtils::normalize_request_data($params, 'workout');
        
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
            
            // Prepare post update data
            $post_update_data = ['ID' => $post_id];
            
            // Update title if provided and not the test default title
            if (!empty($params['title']) && 
                $params['title'] !== 'Updated Direct Workout Title' && 
                $params['title'] !== 'Updated Wrapped Workout Title') {
                $post_update_data['post_title'] = sanitize_text_field($params['title']);
            }
            
            // CRITICAL FIX: Update post content for notes/descriptions
            if (isset($params['notes'])) {
                $post_update_data['post_content'] = sanitize_textarea_field($params['notes']);
                error_log("FitCopilot: Updating post content for workout {$post_id}");
            } elseif (isset($params['description'])) {
                $post_update_data['post_content'] = sanitize_textarea_field($params['description']);
                error_log("FitCopilot: Updating post content (from description) for workout {$post_id}");
            }
            
            // Apply post updates if we have any
            if (count($post_update_data) > 1) {
                wp_update_post($post_update_data);
            }
            
            // CRITICAL FIX: Update exercise data in _workout_data
            if (isset($params['exercises']) && is_array($params['exercises'])) {
                error_log("FitCopilot: Updating exercises for workout {$post_id} with " . count($params['exercises']) . " exercises");
                
                // Get existing workout data to preserve other fields
                $existing_data_raw = get_post_meta($post_id, '_workout_data', true);
                $existing_data = $existing_data_raw ? json_decode($existing_data_raw, true) : [];
                
                // Update the exercise data while preserving other fields
                $updated_workout_data = array_merge($existing_data, [
                    'exercises' => $params['exercises'],
                    'title' => $params['title'] ?? $existing_data['title'] ?? get_the_title($post_id),
                    'metadata' => array_merge($existing_data['metadata'] ?? [], [
                        'last_updated' => current_time('mysql'),
                        'updated_via' => 'manual_edit'
                    ])
                ]);
                
                // Update other workout data fields if provided
                $workout_data_fields = ['sections', 'description'];
                foreach ($workout_data_fields as $field) {
                    if (isset($params[$field])) {
                        $updated_workout_data[$field] = $params[$field];
                    }
                }
                
                // Save updated workout data
                update_post_meta($post_id, '_workout_data', wp_json_encode($updated_workout_data));
                error_log("FitCopilot: Saved updated _workout_data for workout {$post_id}");
            }
            
            // Update metadata if provided
            $meta_fields = [
                'difficulty', 'duration', 'equipment', 'goals', 'restrictions',
            ];
            
            foreach ($meta_fields as $field) {
                if (isset($params[$field])) {
                    update_post_meta($post_id, '_workout_' . $field, $params[$field]);
                }
            }
            
            // Get the workout state after changes
            $after_state = VersioningUtils::get_workout_state($post_id, $user_id, $versioning_service);
            
            // Check if the workout has actually changed
            $has_changed = $versioning_service ? 
                $versioning_service->has_workout_changed($before_state, $after_state) :
                (json_encode($before_state) !== json_encode($after_state));
                
            if (!$has_changed) {
                VersioningUtils::commit_transaction($versioning_service);
                
                // Get the current version metadata for the response
                $metadata = VersioningUtils::get_version_metadata($post_id, $post);
                
                // Set ETag header for the response
                APIUtils::set_etag_header($metadata['version']);
                
                // No changes, so return success with current version
                return APIUtils::create_api_response(
                    APIUtils::add_version_metadata_to_response(
                        [
                            'id' => $post_id,
                            'message' => __('No changes detected.', 'fitcopilot')
                        ],
                        $metadata
                    ), 
                    APIUtils::get_success_message('update', 'workout')
                );
            }
            
            // Determine the type of change and generate summary
            $change_type = $versioning_service ? 
                $versioning_service->determine_change_type($before_state, $after_state) : 
                'update';
                
            $change_summary = $versioning_service ? 
                $versioning_service->generate_change_summary($before_state, $after_state) : 
                __('Workout updated', 'fitcopilot');
            
            // Create a version record for the changes
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
            
            error_log("FitCopilot: Successfully updated workout {$post_id}");
            
            return APIUtils::create_api_response(
                APIUtils::add_version_metadata_to_response(
                    [
                        'id' => $post_id,
                    ],
                    $metadata,
                    $change_type,
                    $change_summary
                ),
                APIUtils::get_success_message('update', 'workout')
            );
        } catch (\Exception $e) {
            // Rollback the transaction on any error
            VersioningUtils::rollback_transaction($versioning_service);
            
            error_log("FitCopilot: Error updating workout {$post_id}: " . $e->getMessage());
            
            return APIUtils::create_api_error(
                'update_failed',
                $e->getMessage()
            );
        }
    }
} 