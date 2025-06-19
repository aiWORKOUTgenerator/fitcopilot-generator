<?php

namespace FitCopilot\Modules\MuscleTargeting;

use FitCopilot\Modules\Core\ModuleInterface;

/**
 * Muscle Targeting Module
 * 
 * Handles all muscle targeting functionality including:
 * - Nested muscle group selection
 * - Muscle suggestions based on profile
 * - Muscle selection persistence
 * - Muscle targeting form rendering
 */
class MuscleModule implements ModuleInterface {
    
    private MuscleRepository $repository;
    private MuscleService $service;
    private MuscleView $view;
    
    public function __construct() {
        $this->repository = new MuscleRepository();
        $this->service = new MuscleService($this->repository);
        $this->view = new MuscleView();
    }
    
    /**
     * Boot the module
     */
    public function boot(): void {
        add_action('wp_ajax_fitcopilot_muscle_suggestions', [$this, 'handleMuscleSuggestions']);
        add_action('wp_ajax_fitcopilot_load_muscle_selection', [$this, 'handleLoadMuscleSelection']);
        add_action('wp_ajax_fitcopilot_save_muscle_selection', [$this, 'handleSaveMuscleSelection']);
        add_action('wp_ajax_fitcopilot_clear_muscle_selection', [$this, 'handleClearMuscleSelection']);
    }
    
    /**
     * Register module routes
     */
    public function registerRoutes(): void {
        // REST API routes for muscle targeting
        register_rest_route('fitcopilot/v1', '/muscle-groups', [
            'methods' => 'GET',
            'callback' => [$this, 'getMuscleGroupsRest'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route('fitcopilot/v1', '/muscle-groups/(?P<group>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getMuscleGroupDetailsRest'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route('fitcopilot/v1', '/muscle-selection', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'muscleSelectionRest'],
            'permission_callback' => [$this, 'checkPermissions']
        ]);
        
        register_rest_route('fitcopilot/v1', '/muscle-suggestions', [
            'methods' => 'POST',
            'callback' => [$this, 'getMuscleSuggestionsRest'],
            'permission_callback' => [$this, 'checkPermissions']
        ]);
    }
    
    /**
     * Register module assets
     */
    public function registerAssets(): void {
        wp_register_script(
            'muscle-targeting-module',
            plugin_dir_url(__FILE__) . 'assets/muscle-targeting.js',
            ['jquery'],
            '1.0.0',
            true
        );
        
        wp_register_style(
            'muscle-targeting-module',
            plugin_dir_url(__FILE__) . 'assets/muscle-targeting.css',
            [],
            '1.0.0'
        );
        
        // Localize script with muscle module data
        wp_localize_script('muscle-targeting-module', 'muscleModule', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('muscle_module_nonce'),
            'endpoints' => [
                'groups' => rest_url('fitcopilot/v1/muscle-groups'),
                'selection' => rest_url('fitcopilot/v1/muscle-selection'),
                'suggestions' => rest_url('fitcopilot/v1/muscle-suggestions')
            ],
            'muscleGroups' => $this->service->getMuscleGroups(),
            'maxSelections' => 3
        ]);
    }
    
    /**
     * Get module capabilities
     */
    public function getCapabilities(): array {
        return [
            'muscle_group_selection',
            'nested_muscle_targeting',
            'muscle_suggestions',
            'muscle_selection_persistence',
            'muscle_form_rendering'
        ];
    }
    
    /**
     * Render muscle targeting form section
     */
    public function renderMuscleForm(array $data = []): string {
        return $this->view->renderMuscleTargetingForm($data);
    }
    
    /**
     * Alternative method name for muscle selection (Sprint 2 compatibility)
     */
    public function renderMuscleSelection(array $data = []): string {
        return $this->view->renderMuscleTargetingForm($data);
    }
    
    /**
     * Handle AJAX muscle suggestions
     */
    public function handleMuscleSuggestions(): void {
        try {
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'muscle_module_nonce')) {
                wp_die('Security check failed');
            }
            
            $profile_data = json_decode(stripslashes($_POST['profile_data'] ?? '{}'), true);
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            
            $suggestions = $this->service->generateMuscleSuggestions($profile_data, $user_id);
            
            wp_send_json_success([
                'suggestions' => $suggestions,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[MuscleModule] Failed to generate suggestions: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to generate muscle suggestions: ' . $e->getMessage(),
                'code' => 'suggestions_failed'
            ]);
        }
    }
    
    /**
     * Handle AJAX load muscle selection
     */
    public function handleLoadMuscleSelection(): void {
        try {
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'muscle_module_nonce')) {
                wp_die('Security check failed');
            }
            
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            $selection_data = $this->service->loadMuscleSelection($user_id);
            
            wp_send_json_success([
                'selection_data' => $selection_data,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[MuscleModule] Failed to load selection: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to load muscle selection: ' . $e->getMessage(),
                'code' => 'load_failed'
            ]);
        }
    }
    
    /**
     * Handle AJAX save muscle selection
     */
    public function handleSaveMuscleSelection(): void {
        try {
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'muscle_module_nonce')) {
                wp_die('Security check failed');
            }
            
            $selection_data = json_decode(stripslashes($_POST['selection_data'] ?? '{}'), true);
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            
            $save_result = $this->service->saveMuscleSelection($user_id, $selection_data);
            
            wp_send_json_success([
                'saved' => $save_result,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[MuscleModule] Failed to save selection: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to save muscle selection: ' . $e->getMessage(),
                'code' => 'save_failed'
            ]);
        }
    }
    
    /**
     * Handle AJAX clear muscle selection
     */
    public function handleClearMuscleSelection(): void {
        try {
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'muscle_module_nonce')) {
                wp_die('Security check failed');
            }
            
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            $clear_result = $this->service->clearMuscleSelection($user_id);
            
            wp_send_json_success([
                'cleared' => $clear_result,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[MuscleModule] Failed to clear selection: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to clear muscle selection: ' . $e->getMessage(),
                'code' => 'clear_failed'
            ]);
        }
    }
    
    /**
     * REST API: Get muscle groups
     */
    public function getMuscleGroupsRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $muscle_groups = $this->service->getMuscleGroups();
            
            return new \WP_REST_Response([
                'success' => true,
                'data' => $muscle_groups
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * REST API: Get muscle group details
     */
    public function getMuscleGroupDetailsRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $group = $request->get_param('group');
            $group_details = $this->service->getMuscleGroupDetails($group);
            
            return new \WP_REST_Response([
                'success' => true,
                'data' => $group_details
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * REST API: Handle muscle selection
     */
    public function muscleSelectionRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $user_id = $request->get_param('user_id') ?? get_current_user_id();
            
            if ($request->get_method() === 'GET') {
                $selection_data = $this->service->loadMuscleSelection($user_id);
                return new \WP_REST_Response([
                    'success' => true,
                    'data' => $selection_data
                ], 200);
            } else {
                $selection_data = $request->get_json_params();
                $save_result = $this->service->saveMuscleSelection($user_id, $selection_data);
                
                return new \WP_REST_Response([
                    'success' => true,
                    'data' => $save_result
                ], 200);
            }
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * REST API: Get muscle suggestions
     */
    public function getMuscleSuggestionsRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $profile_data = $request->get_json_params();
            $user_id = $request->get_param('user_id') ?? get_current_user_id();
            
            $suggestions = $this->service->generateMuscleSuggestions($profile_data, $user_id);
            
            return new \WP_REST_Response([
                'success' => true,
                'data' => $suggestions
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check permissions for REST API
     */
    public function checkPermissions(): bool {
        return current_user_can('manage_options') || current_user_can('edit_posts');
    }
    
    /**
     * Get muscle selection data for user
     */
    public function getMuscleSelection(?int $user_id = null): array {
        $user_id = $user_id ?? get_current_user_id();
        return $this->service->loadMuscleSelection($user_id);
    }
    
    /**
     * Generate muscle suggestions based on profile
     */
    public function generateSuggestions(array $profile_data, ?int $user_id = null): array {
        $user_id = $user_id ?? get_current_user_id();
        return $this->service->generateMuscleSuggestions($profile_data, $user_id);
    }
} 