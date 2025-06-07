<?php
/**
 * Muscle Data Endpoint
 * 
 * REST API endpoint for muscle group data management.
 * Provides server-side muscle data for the workout generator.
 * 
 * Based on the 6-group muscle classification system.
 */

namespace FitCopilot\API\MuscleEndpoints;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

class MuscleDataEndpoint {
    
    /**
     * Register REST API routes for muscle data
     */
    public function register_routes() {
        register_rest_route('fitcopilot/v1', '/muscle-groups', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_muscle_groups'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
        
        register_rest_route('fitcopilot/v1', '/muscle-groups/(?P<group>[a-zA-Z-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_muscles_in_group'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'group' => array(
                    'required' => true,
                    'validate_callback' => array($this, 'validate_muscle_group')
                )
            )
        ));
        
        register_rest_route('fitcopilot/v1', '/muscle-data/all', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_all_muscle_data'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
        
        register_rest_route('fitcopilot/v1', '/muscle-selection/validate', array(
            'methods' => 'POST',
            'callback' => array($this, 'validate_muscle_selection'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
    }
    
    /**
     * Check API permissions
     */
    public function check_permissions($request) {
        // Allow logged-in users for now, can be made more restrictive
        return is_user_logged_in();
    }
    
    /**
     * Get all muscle groups
     * 
     * @return WP_REST_Response
     */
    public function get_muscle_groups(WP_REST_Request $request) {
        try {
            $muscle_groups = $this->get_muscle_groups_data();
            
            return new WP_REST_Response(array(
                'success' => true,
                'data' => $muscle_groups,
                'message' => 'Muscle groups retrieved successfully'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to retrieve muscle groups',
                'code' => 'muscle_groups_error'
            ), 500);
        }
    }
    
    /**
     * Get muscles in a specific group
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_muscles_in_group(WP_REST_Request $request) {
        try {
            $group_key = $request->get_param('group');
            $muscles = $this->get_muscles_in_group_data($group_key);
            
            if (empty($muscles)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => 'Muscle group not found',
                    'code' => 'muscle_group_not_found'
                ), 404);
            }
            
            return new WP_REST_Response(array(
                'success' => true,
                'data' => array(
                    'group' => $group_key,
                    'muscles' => $muscles
                ),
                'message' => 'Muscles retrieved successfully'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to retrieve muscles',
                'code' => 'muscles_error'
            ), 500);
        }
    }
    
    /**
     * Get all muscle data (groups + muscles)
     * 
     * @return WP_REST_Response
     */
    public function get_all_muscle_data(WP_REST_Request $request) {
        try {
            $all_data = $this->get_all_muscle_data_structured();
            
            return new WP_REST_Response(array(
                'success' => true,
                'data' => $all_data,
                'message' => 'All muscle data retrieved successfully'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to retrieve muscle data',
                'code' => 'muscle_data_error'
            ), 500);
        }
    }
    
    /**
     * Validate muscle selection
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function validate_muscle_selection(WP_REST_Request $request) {
        try {
            $selection_data = $request->get_json_params();
            $validation_result = $this->validate_selection_data($selection_data);
            
            return new WP_REST_Response(array(
                'success' => true,
                'data' => $validation_result,
                'message' => 'Muscle selection validated'
            ), 200);
            
        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to validate selection',
                'code' => 'validation_error'
            ), 500);
        }
    }
    
    /**
     * Core muscle groups data
     * Based on the 6-group classification system
     */
    private function get_muscle_groups_data() {
        return array(
            'back' => array(
                'display' => 'Back',
                'icon' => '🏋️',
                'description' => 'Upper and lower back muscles for posture and pulling strength'
            ),
            'chest' => array(
                'display' => 'Chest',
                'icon' => '💪',
                'description' => 'Pectoral muscles for pushing movements and upper body strength'
            ),
            'arms' => array(
                'display' => 'Arms',
                'icon' => '💪',
                'description' => 'Biceps, triceps, and forearms for arm strength and definition'
            ),
            'shoulders' => array(
                'display' => 'Shoulders',
                'icon' => '🤸',
                'description' => 'Deltoid muscles for shoulder stability and overhead movements'
            ),
            'core' => array(
                'display' => 'Core',
                'icon' => '🧘',
                'description' => 'Abdominal and core muscles for stability and functional strength'
            ),
            'legs' => array(
                'display' => 'Legs',
                'icon' => '🦵',
                'description' => 'Lower body muscles for power, stability, and functional movement'
            )
        );
    }
    
    /**
     * Get muscles for a specific group
     */
    private function get_muscles_in_group_data($group_key) {
        $muscle_data = array(
            'back' => array('Lats', 'Rhomboids', 'Middle Traps', 'Lower Traps', 'Rear Delts'),
            'chest' => array('Upper Chest', 'Middle Chest', 'Lower Chest'),
            'arms' => array('Biceps', 'Triceps', 'Forearms'),
            'shoulders' => array('Front Delts', 'Side Delts', 'Rear Delts'),
            'core' => array('Upper Abs', 'Lower Abs', 'Obliques', 'Transverse Abdominis'),
            'legs' => array('Quadriceps', 'Hamstrings', 'Glutes', 'Calves')
        );
        
        $normalized_key = strtolower($group_key);
        return isset($muscle_data[$normalized_key]) ? $muscle_data[$normalized_key] : array();
    }
    
    /**
     * Get all muscle data in structured format
     */
    private function get_all_muscle_data_structured() {
        $groups = $this->get_muscle_groups_data();
        $structured_data = array();
        
        foreach ($groups as $key => $group_info) {
            $structured_data[$key] = array_merge(
                $group_info,
                array('muscles' => $this->get_muscles_in_group_data($key))
            );
        }
        
        return $structured_data;
    }
    
    /**
     * Validate muscle selection data
     */
    private function validate_selection_data($selection_data) {
        $errors = array();
        $warnings = array();
        $max_groups = 3;
        $min_groups = 1;
        
        // Validate structure
        if (!isset($selection_data['selectedGroups']) || !is_array($selection_data['selectedGroups'])) {
            $errors[] = 'Invalid selection data structure';
            return array(
                'isValid' => false,
                'errors' => $errors,
                'warnings' => $warnings
            );
        }
        
        $selected_groups = $selection_data['selectedGroups'];
        $selected_muscles = isset($selection_data['selectedMuscles']) ? $selection_data['selectedMuscles'] : array();
        
        // Check group limits
        if (count($selected_groups) > $max_groups) {
            $errors[] = "Maximum {$max_groups} muscle groups allowed";
        }
        
        if (count($selected_groups) < $min_groups) {
            $warnings[] = 'At least one muscle group is recommended';
        }
        
        // Validate group names
        $valid_groups = array_keys($this->get_muscle_groups_data());
        foreach ($selected_groups as $group) {
            $normalized_group = strtolower($group);
            if (!in_array($normalized_group, $valid_groups)) {
                $errors[] = "Invalid muscle group: {$group}";
            }
        }
        
        // Validate specific muscles if provided
        foreach ($selected_muscles as $group => $muscles) {
            if (!is_array($muscles)) continue;
            
            $valid_muscles = $this->get_muscles_in_group_data(strtolower($group));
            foreach ($muscles as $muscle) {
                if (!in_array($muscle, $valid_muscles)) {
                    $warnings[] = "Invalid muscle '{$muscle}' for group '{$group}'";
                }
            }
        }
        
        return array(
            'isValid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'canAddMore' => count($selected_groups) < $max_groups,
            'maxGroupsReached' => count($selected_groups) >= $max_groups,
            'summary' => array(
                'totalGroups' => count($selected_groups),
                'totalMuscles' => array_sum(array_map('count', $selected_muscles))
            )
        );
    }
    
    /**
     * Validate muscle group parameter
     */
    public function validate_muscle_group($param, $request, $key) {
        $valid_groups = array_keys($this->get_muscle_groups_data());
        return in_array(strtolower($param), $valid_groups);
    }
    
    /**
     * Normalize muscle names for consistency
     */
    public function normalize_muscle_names($muscles) {
        if (!is_array($muscles)) {
            return array();
        }
        
        return array_map(function($muscle) {
            // Remove extra spaces and standardize capitalization
            return ucwords(trim(strtolower($muscle)));
        }, $muscles);
    }
    
    /**
     * Get muscle group combinations for suggestions
     */
    public function get_muscle_group_combinations() {
        return array(
            'upper_body_push' => array('chest', 'shoulders', 'arms'),
            'upper_body_pull' => array('back', 'arms'),
            'lower_body' => array('legs', 'core'),
            'full_body' => array('back', 'chest', 'legs'),
            'core_focus' => array('core', 'back'),
            'arms_shoulders' => array('arms', 'shoulders')
        );
    }
}

// Initialize the endpoint
add_action('rest_api_init', function() {
    $muscle_endpoint = new MuscleDataEndpoint();
    $muscle_endpoint->register_routes();
}); 