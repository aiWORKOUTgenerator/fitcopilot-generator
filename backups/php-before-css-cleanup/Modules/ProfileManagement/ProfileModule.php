<?php

namespace FitCopilot\Modules\ProfileManagement;

use FitCopilot\Modules\Core\ModuleInterface;

/**
 * Profile Management Module
 * 
 * Handles all user profile related functionality including:
 * - Profile data loading and saving
 * - Profile form rendering
 * - Profile validation
 * - Height/weight conversions
 */
class ProfileModule implements ModuleInterface {
    
    private ProfileRepository $repository;
    private ProfileValidator $validator;
    private ProfileView $view;
    private ProfileService $service;
    
    public function __construct() {
        $this->repository = new ProfileRepository();
        $this->validator = new ProfileValidator();
        $this->view = new ProfileView();
        $this->service = new ProfileService($this->repository, $this->validator);
    }
    
    /**
     * Boot the module
     */
    public function boot(): void {
        // Temporarily disable this handler to prevent conflicts with PromptBuilderController
        // The PromptBuilderController has the updated permission logic
        // add_action('wp_ajax_fitcopilot_prompt_builder_load_profile', [$this, 'handleLoadProfile']);
        
        add_action('wp_ajax_fitcopilot_prompt_builder_save_profile', [$this, 'handleSaveProfile']);
        add_action('wp_ajax_fitcopilot_prompt_builder_validate_profile', [$this, 'handleValidateProfile']);
    }
    
    /**
     * Register module routes
     */
    public function registerRoutes(): void {
        // REST API routes for profile management
        register_rest_route('fitcopilot/v1', '/profile/load', [
            'methods' => 'GET',
            'callback' => [$this, 'loadProfileRest'],
            'permission_callback' => [$this, 'checkPermissions']
        ]);
        
        register_rest_route('fitcopilot/v1', '/profile/save', [
            'methods' => 'POST',
            'callback' => [$this, 'saveProfileRest'],
            'permission_callback' => [$this, 'checkPermissions']
        ]);
    }
    
    /**
     * Register module assets
     */
    public function registerAssets(): void {
        wp_register_script(
            'profile-module',
            plugin_dir_url(__FILE__) . 'assets/profile-module.js',
            ['jquery'],
            '1.0.0',
            true
        );
        
        wp_register_style(
            'profile-module',
            plugin_dir_url(__FILE__) . 'assets/profile-module.css',
            [],
            '1.0.0'
        );
        
        // Localize script with profile module data
        wp_localize_script('profile-module', 'profileModule', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('profile_module_nonce'),
            'endpoints' => [
                'load' => rest_url('fitcopilot/v1/profile/load'),
                'save' => rest_url('fitcopilot/v1/profile/save'),
                'validate' => rest_url('fitcopilot/v1/profile/validate')
            ]
        ]);
    }
    
    /**
     * Get module capabilities
     */
    public function getCapabilities(): array {
        return [
            'profile_loading',
            'profile_saving',
            'profile_validation',
            'height_conversion',
            'weight_conversion',
            'profile_form_rendering'
        ];
    }
    
    /**
     * Render profile form section
     */
    public function renderProfileForm(array $data = []): string {
        return $this->view->renderProfileForm($data);
    }
    
    /**
     * Handle AJAX profile loading
     */
    public function handleLoadProfile(): void {
        try {
            // Validate nonce - accept both profile module nonce and prompt builder nonce
            $nonce = $_POST['nonce'] ?? '';
            $nonce_valid = false;
            
            if (wp_verify_nonce($nonce, 'profile_module_nonce')) {
                $nonce_valid = true;
            } elseif (wp_verify_nonce($nonce, 'fitcopilot_prompt_builder')) {
                $nonce_valid = true;
            }
            
            if (!$nonce_valid && !empty($nonce)) {
                error_log('[ProfileModule] Nonce verification failed. Received: ' . $nonce);
                wp_die('Security check failed', 'Profile Module', ['response' => 403]);
            }
            
            // Check user permissions
            if (!is_user_logged_in()) {
                wp_die('User not logged in', 'Profile Module', ['response' => 403]);
            }
            
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            
            // Security check: ensure user can access this profile data
            $current_user_id = get_current_user_id();
            if ($user_id != $current_user_id && !current_user_can('manage_options')) {
                wp_die('Insufficient permissions to access user profile', 'Profile Module', ['response' => 403]);
            }
            
            $profile_data = $this->service->loadUserProfile($user_id);
            
            wp_send_json_success([
                'profile_data' => $profile_data,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[ProfileModule] Failed to load profile: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to load profile: ' . $e->getMessage(),
                'code' => 'profile_load_failed'
            ]);
        }
    }
    
    /**
     * Handle AJAX profile saving
     */
    public function handleSaveProfile(): void {
        try {
            // Validate nonce
            if (!wp_verify_nonce($_POST['nonce'] ?? '', 'profile_module_nonce')) {
                wp_die('Security check failed', 'Profile Module', ['response' => 403]);
            }
            
            $profile_data = json_decode(stripslashes($_POST['profile_data'] ?? '{}'), true);
            $user_id = intval($_POST['user_id'] ?? get_current_user_id());
            
            // Validate profile data
            $validation_result = $this->validator->validate($profile_data);
            if (!$validation_result['is_valid']) {
                wp_send_json_error([
                    'message' => 'Profile validation failed',
                    'errors' => $validation_result['errors'],
                    'code' => 'validation_failed'
                ]);
                return;
            }
            
            // Save profile
            $save_result = $this->service->saveUserProfile($user_id, $profile_data);
            
            wp_send_json_success([
                'saved' => $save_result,
                'user_id' => $user_id,
                'timestamp' => current_time('mysql')
            ]);
            
        } catch (\Exception $e) {
            error_log('[ProfileModule] Failed to save profile: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Failed to save profile: ' . $e->getMessage(),
                'code' => 'profile_save_failed'
            ]);
        }
    }
    
    /**
     * Handle AJAX profile validation
     */
    public function handleValidateProfile(): void {
        try {
            $profile_data = json_decode(stripslashes($_POST['profile_data'] ?? '{}'), true);
            $validation_result = $this->validator->validate($profile_data);
            
            wp_send_json_success($validation_result);
            
        } catch (\Exception $e) {
            error_log('[ProfileModule] Profile validation failed: ' . $e->getMessage());
            wp_send_json_error([
                'message' => 'Validation failed: ' . $e->getMessage(),
                'code' => 'validation_error'
            ]);
        }
    }
    
    /**
     * REST API: Load profile
     */
    public function loadProfileRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $user_id = $request->get_param('user_id') ?? get_current_user_id();
            $profile_data = $this->service->loadUserProfile($user_id);
            
            return new \WP_REST_Response([
                'success' => true,
                'data' => $profile_data
            ], 200);
            
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * REST API: Save profile
     */
    public function saveProfileRest(\WP_REST_Request $request): \WP_REST_Response {
        try {
            $profile_data = $request->get_json_params();
            $user_id = $request->get_param('user_id') ?? get_current_user_id();
            
            $validation_result = $this->validator->validate($profile_data);
            if (!$validation_result['is_valid']) {
                return new \WP_REST_Response([
                    'success' => false,
                    'errors' => $validation_result['errors']
                ], 400);
            }
            
            $save_result = $this->service->saveUserProfile($user_id, $profile_data);
            
            return new \WP_REST_Response([
                'success' => true,
                'data' => $save_result
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
     * Get profile data for user
     */
    public function getProfileData(int $user_id = null): array {
        $user_id = $user_id ?? get_current_user_id();
        return $this->service->loadUserProfile($user_id);
    }
    
    /**
     * Convert height between units
     */
    public function convertHeight(float $height, string $from_unit, string $to_unit): float {
        return $this->service->convertHeight($height, $from_unit, $to_unit);
    }
    
    /**
     * Convert weight between units
     */
    public function convertWeight(float $weight, string $from_unit, string $to_unit): float {
        return $this->service->convertWeight($weight, $from_unit, $to_unit);
    }
} 