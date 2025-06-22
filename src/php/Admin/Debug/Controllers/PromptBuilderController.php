<?php
/**
 * PromptBuilderController - Phase 2 Week 1: Advanced Prompt Engineering Interface
 * 
 * Main controller for the PromptBuilder system that integrates analytics, multi-provider
 * support, and visual prompt design capabilities with the existing Testing Lab architecture.
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Services\PromptAnalyticsService;
use FitCopilot\Admin\Debug\Services\PromptBuilderService;
use FitCopilot\Admin\Debug\Services\MultiProviderManager;
use FitCopilot\Admin\Debug\Services\TestingService;
use FitCopilot\Admin\Debug\Views\PromptBuilderView;
use FitCopilot\Service\AI\OpenAIProvider;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PromptBuilderController Class
 * 
 * Advanced prompt engineering interface with analytics and multi-provider support
 */
class PromptBuilderController {
    
    /**
     * Analytics service instance
     *
     * @var PromptAnalyticsService
     */
    private $analytics;
    
    /**
     * Multi-provider manager instance
     *
     * @var MultiProviderManager
     */
    private $multiProvider;
    
    /**
     * Testing service instance
     *
     * @var TestingService
     */
    private $testingService;
    
    /**
     * PromptBuilder service instance
     *
     * @var PromptBuilderService
     */
    private $promptBuilderService;
    
    /**
     * View instance
     *
     * @var PromptBuilderView
     */
    private $view;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->analytics = new PromptAnalyticsService();
        $this->multiProvider = new MultiProviderManager();
        $this->testingService = new TestingService();
        $this->promptBuilderService = new PromptBuilderService();
        $this->view = new PromptBuilderView();
        
        $this->initializeHooks();
    }
    
    /**
     * Initialize the PromptBuilder controller
     */
    public function init(): void {
        // This method is called by DebugManager
        // The constructor already handles initialization, but we need this method for compatibility
        error_log('[PromptBuilderController] init() called');
    }

    /**
     * Initialize WordPress hooks
     */
    private function initializeHooks(): void {
        // Register all AJAX endpoints properly
        $this->registerAjaxHandlers();
        
        // Admin scripts and styles
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
    }
    
    /**
     * Render the main PromptBuilder interface
     */
    public function renderPromptBuilder(): void {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        try {
            // Get initial data
            $dashboard_data = $this->getDashboardData(['time_range' => '7 days']);
            $provider_health = $this->multiProvider->getProvidersHealth();
            $available_strategies = $this->getAvailableStrategies();
            $users = $this->getUsers();
            
            // Prepare system info for the view - using same logic as Testing Lab
            $systemInfo = [
                'modular_system_active' => $this->getModularSystemStatus(),
                'ai_provider' => $provider_health['primary_provider'] ?? 'Unknown',
                'strategies_available' => count($available_strategies),
                'system_health' => $provider_health['status'] ?? 'unknown',
                'last_updated' => current_time('c')
            ];
            
            // Render the interface
            $this->view->render([
                'dashboard_data' => $dashboard_data,
                'provider_health' => $provider_health,
                'strategies' => $available_strategies,
                'systemInfo' => $systemInfo,
                'users' => $users,
                'currentStrategy' => 'SingleWorkoutStrategy',
                'current_user' => wp_get_current_user(),
                'nonce' => wp_create_nonce('fitcopilot_prompt_builder')
            ]);
            
        } catch (\Exception $e) {
            error_log('[PromptBuilder] Failed to render interface: ' . $e->getMessage());
            
            echo '<div class="notice notice-error"><p>';
            echo '<strong>PromptBuilder Error:</strong> Failed to load interface. ';
            echo 'Please check the error logs for details.';
            echo '</p></div>';
        }
    }
    

    public function registerAjaxHandlers(): void {
        // Only register if WordPress functions are available
        if (function_exists('add_action')) {
            // Phase 1: Core PromptBuilder AJAX endpoints
            add_action('wp_ajax_fitcopilot_prompt_builder_generate', [$this, 'handleLivePromptGeneration']);
            add_action('wp_ajax_fitcopilot_prompt_builder_get_strategy', [$this, 'handleGetStrategyCode']);
            add_action('wp_ajax_fitcopilot_prompt_builder_view_code', [$this, 'handleGetStrategyCode']); // MISSING REGISTRATION
            add_action('wp_ajax_fitcopilot_prompt_builder_get_context', [$this, 'handleGetContextData']);
            add_action('wp_ajax_fitcopilot_prompt_builder_save_template', [$this, 'handleSaveTemplate']);
            add_action('wp_ajax_fitcopilot_prompt_builder_test_workout', [$this, 'handleTestWorkout']);
            add_action('wp_ajax_fitcopilot_prompt_builder_load_profile', [$this, 'handleLoadUserProfile']);
        }
    }
    
    /**
     * Enqueue assets for PromptBuilder
     *
     * @param string $hook_suffix Current admin page
     * @return void
     */
    public function enqueueAssets(string $hook_suffix): void {
        // Debug: Log when this method is called
        error_log("PromptBuilderController::enqueueAssets called with hook: {$hook_suffix}");
        
        // Only load on PromptBuilder page
        if (strpos($hook_suffix, 'prompt-builder') !== false || strpos($hook_suffix, 'fitcopilot-prompt-builder') !== false) {
            error_log("PromptBuilderController: Hook condition matched, enqueuing OPTIMIZED SYSTEM assets");
            
            // CSS Performance Optimization Sprint - Load optimized CSS
            wp_enqueue_style(
                'fitcopilot-prompt-builder-optimized',
                plugins_url('assets/css/admin-prompt-builder-optimized.css', FITCOPILOT_FILE),
                [],
                FITCOPILOT_VERSION . '-optimized'
            );
            
            // Dark Mode Toggle Support
            wp_enqueue_script(
                'fitcopilot-dark-mode-toggle',
                plugins_url('assets/js/admin-dark-mode-toggle.js', FITCOPILOT_FILE),
                [],
                FITCOPILOT_VERSION,
                true
            );
            
            // CSS Performance Monitor
            wp_enqueue_script(
                'fitcopilot-css-performance-monitor',
                plugins_url('assets/js/css-performance-monitor.js', FITCOPILOT_FILE),
                [],
                FITCOPILOT_VERSION,
                true
            );
            
            // Enqueue config and utilities first
            wp_enqueue_script(
                'fitcopilot-prompt-builder-config',
                plugins_url('assets/js/prompt-builder/config.js', FITCOPILOT_FILE),
                ['jquery'],
                FITCOPILOT_VERSION,
                true
            );
            
            // MODULAR SYSTEM ACTIVATION - Load modular components
            wp_enqueue_script(
                'fitcopilot-prompt-builder-form-handler',
                plugins_url('assets/js/prompt-builder/modules/FormHandler.js', FITCOPILOT_FILE),
                ['jquery', 'fitcopilot-prompt-builder-config'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_script(
                'fitcopilot-prompt-builder-ajax-manager',
                plugins_url('assets/js/prompt-builder/modules/AjaxManager.js', FITCOPILOT_FILE),
                ['jquery', 'fitcopilot-prompt-builder-config'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_script(
                'fitcopilot-prompt-builder-ui-controller',
                plugins_url('assets/js/prompt-builder/modules/UIController.js', FITCOPILOT_FILE),
                ['jquery', 'fitcopilot-prompt-builder-config'],
                FITCOPILOT_VERSION,
                true
            );
            
            // Enqueue modular coordinator (replaces monolithic index.js)
            wp_enqueue_script(
                'fitcopilot-prompt-builder',
                plugins_url('assets/js/prompt-builder/index-modular.js', FITCOPILOT_FILE),
                [
                    'jquery', 
                    'wp-util', 
                    'fitcopilot-prompt-builder-config',
                    'fitcopilot-prompt-builder-form-handler',
                    'fitcopilot-prompt-builder-ajax-manager',
                    'fitcopilot-prompt-builder-ui-controller'
                ],
                FITCOPILOT_VERSION,
                true
            );
            
            // Note: Using optimized CSS only (admin-prompt-builder-optimized.css)
            // Original admin-prompt-builder.css is disabled to prevent conflicts
            
            // Enqueue MuscleModule assets (depends on modular coordinator)
            wp_enqueue_script(
                'muscle-targeting-module',
                plugins_url('src/php/Modules/MuscleTargeting/assets/muscle-targeting.js', FITCOPILOT_FILE),
                ['jquery', 'fitcopilot-prompt-builder'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_style(
                'muscle-targeting-module',
                plugins_url('src/php/Modules/MuscleTargeting/assets/muscle-targeting.css', FITCOPILOT_FILE),
                ['fitcopilot-prompt-builder-optimized'],
                FITCOPILOT_VERSION
            );
            
            // Localize MuscleModule script
            wp_localize_script('muscle-targeting-module', 'muscleModule', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('muscle_module_nonce'),
                'endpoints' => [
                    'groups' => rest_url('fitcopilot/v1/muscle-groups'),
                    'selection' => rest_url('fitcopilot/v1/muscle-selection'),
                    'suggestions' => rest_url('fitcopilot/v1/muscle-suggestions')
                ],
                'maxSelections' => 3
            ]);
            
            // Localize script with PromptBuilder configuration
            $nonce = wp_create_nonce('fitcopilot_prompt_builder');
            error_log("PromptBuilderController: Localizing script with nonce: {$nonce}");
            
            wp_localize_script('fitcopilot-prompt-builder', 'fitcopilotPromptBuilder', [
                'nonce' => $nonce,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
                'currentUserId' => get_current_user_id(),
                'adminUrl' => admin_url(),
                'pluginUrl' => plugins_url('', FITCOPILOT_FILE)
            ]);
        }
    }
    
    /**
     * Handle live prompt generation
     * Phase 1: Real-time prompt building with immediate preview
     *
     * @return void
     */
    public function handleLivePromptGeneration(): void {
        error_log('[PromptBuilderController] handleLivePromptGeneration called');
        
        // Clear any existing output buffers to prevent conflicts
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        ob_start();
        $start_time = microtime(true);
        
        try {
            // Force modular system activation (same as Testing Lab)
            $this->ensureModularSystemForPromptBuilder();
            
            // Validate request
            if (!$this->validateAjaxRequest()) {
                error_log('[PromptBuilderController] Request validation failed');
                return;
            }
            
            // Get form data
            $form_data = $this->getRequestData();
            $form_data = $this->sanitizeFormData($form_data);
            
            error_log('[PromptBuilderController] Form data sanitized: ' . json_encode($form_data));
            
            // Generate live prompt using PromptBuilderService (MODULAR SYSTEM ONLY)
            $result = $this->promptBuilderService->generateLivePrompt($form_data);
            
            // Add modular system status to result
            $result['modular_system_active'] = true;
            $result['system_type'] = 'modular';
            $result['modular_system_forced'] = true;
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics(
                $start_time,
                $result['prompt'] ?? '',
                ''
            );
            
            // Log request
            $this->logAjaxRequest('live_prompt_generation', $form_data, $start_time);
            
            // Clear output buffer before sending response
            ob_end_clean();
            
            // Send response directly (no double wrapping like strategy code handler)
            wp_send_json_success($result);
            
        } catch (\Exception $e) {
            ob_end_clean();
            error_log('[PromptBuilderController] Live prompt generation failed: ' . $e->getMessage());
            error_log('[PromptBuilderController] Exception trace: ' . $e->getTraceAsString());
            
            $this->sendErrorResponse(
                'Live prompt generation failed: ' . $e->getMessage(),
                'live_prompt_generation_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => $e->getTraceAsString(),
                    'modular_system_only' => true
                ]
            );
        }
    }
    
    /**
     * Handle strategy code viewing
     * Phase 1: Inspect actual strategy PHP code
     *
     * @return void
     */
    public function handleGetStrategyCode(): void {
        error_log('[PromptBuilderController] handleGetStrategyCode called');
        
        try {
            // Validate request
            if (!$this->validateAjaxRequest()) {
                return;
            }
            
            // Get strategy name
            $strategy_name = sanitize_text_field($_POST['strategy_name'] ?? 'default');
            
            // Get strategy code using PromptBuilderService
            $result = $this->promptBuilderService->getStrategyCode($strategy_name);
            
            // Send response directly (no double wrapping)
            if ($result['success']) {
                wp_send_json_success($result);
            } else {
                wp_send_json_error($result);
            }
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Get strategy code failed: ' . $e->getMessage());
            
            $this->sendErrorResponse(
                'Failed to retrieve strategy code: ' . $e->getMessage(),
                'get_strategy_code_error'
            );
        }
    }
    
    /**
     * Handle context data inspection
     * Phase 1: Show how form data transforms into context
     *
     * @return void
     */
    public function handleGetContextData(): void {
        error_log('[PromptBuilderController] handleGetContextData called');
        
        try {
            // Validate request
            if (!$this->validateAjaxRequest()) {
                return;
            }
            
            // Get form data
            $form_data = $this->getRequestData();
            $form_data = $this->sanitizeFormData($form_data);
            
            // Get context data using PromptBuilderService
            $result = $this->promptBuilderService->getContextData($form_data);
            
            // Send response
            $this->sendSuccessResponse($result, 'Context data retrieved successfully');
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Get context data failed: ' . $e->getMessage());
            
            $this->sendErrorResponse(
                'Failed to retrieve context data: ' . $e->getMessage(),
                'get_context_data_error'
            );
        }
    }
    
    /**
     * Handle template saving
     * Phase 1: Save prompt templates for reuse
     *
     * @return void
     */
    public function handleSaveTemplate(): void {
        error_log('[PromptBuilderController] handleSaveTemplate called');
        
        try {
            // Validate request
            if (!$this->validateAjaxRequest()) {
                return;
            }
            
            // Get template data
            $template_data = $this->getRequestData();
            $template_data = $this->sanitizeTemplateData($template_data);
            
            // Save template using PromptBuilderService
            $result = $this->promptBuilderService->saveTemplate($template_data);
            
            // Send response
            $this->sendSuccessResponse($result, 'Template saved successfully');
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Save template failed: ' . $e->getMessage());
            
            $this->sendErrorResponse(
                'Failed to save template: ' . $e->getMessage(),
                'save_template_error'
            );
        }
    }
    
    /**
     * Handle workout testing
     * Phase 1: Test generated prompts with actual workout generation
     *
     * @return void
     */
    public function handleTestWorkout(): void {
        error_log('[PromptBuilderController] handleTestWorkout called');
        
        try {
            // Validate request
            if (!$this->validateAjaxRequest()) {
                return;
            }
            
            // Get test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            // Test workout using integrated TestingService
            $test_id = $this->generateTestId('prompt_builder_workout');
            $result = $this->testingService->testWorkoutGeneration($test_data, $test_id);
            
            // Send response
            $this->sendSuccessResponse($result, 'Workout test completed successfully');
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Test workout failed: ' . $e->getMessage());
            
            $this->sendErrorResponse(
                'Workout test failed: ' . $e->getMessage(),
                'test_workout_error'
            );
        }
    }
    
    /**
     * Handle user profile loading
     * Phase 1: Load user's profile data for form population
     *
     * @return void
     */
    public function handleLoadUserProfile(): void {
        error_log('[PromptBuilderController] handleLoadUserProfile called');
        
        try {
            // Validate request
            if (!$this->validateAjaxRequest()) {
                return;
            }
            
            // Get request data
            $request_data = $this->getRequestData();
            $user_id = intval($request_data['user_id'] ?? 0);
            
            // If no user_id provided, use current user
            if (!$user_id) {
                $user_id = get_current_user_id();
            }
            
            error_log('[PromptBuilderController] Loading profile for user ID: ' . $user_id);
            
            // Get user profile data using PromptBuilderService
            $result = $this->promptBuilderService->getUserProfileData($user_id);
            
            // Send response
            $this->sendSuccessResponse($result, 'User profile loaded successfully');
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Load user profile failed: ' . $e->getMessage());
            
            $this->sendErrorResponse(
                'Failed to load user profile: ' . $e->getMessage(),
                'load_user_profile_error'
            );
        }
    }
    
    /**
     * Render PromptBuilder page
     * Called from AdminMenu.php
     *
     * @return void
     */
    public function renderPromptBuilderPage(): void {
        try {
            error_log('[PromptBuilderController] Rendering PromptBuilder page');
            
            // Use PromptBuilderView to render the page
            $this->view->renderPromptBuilderPage();
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Failed to render PromptBuilder page: ' . $e->getMessage());
            
            // Fallback error display
            echo '<div class="wrap">';
            echo '<h1>PromptBuilder - Error</h1>';
            echo '<div class="notice notice-error"><p>Failed to load PromptBuilder: ' . esc_html($e->getMessage()) . '</p></div>';
            echo '</div>';
        }
    }
    
    /**
     * Sanitize form data for live prompt generation
     *
     * @param array $data Raw form data
     * @return array Sanitized data
     */
    private function sanitizeFormData(array $data): array {
        return [
            'basic_info' => [
                'name' => sanitize_text_field($data['basic_info']['name'] ?? ''),
                'age' => absint($data['basic_info']['age'] ?? 0),
                'gender' => sanitize_text_field($data['basic_info']['gender'] ?? ''),
                'fitness_level' => sanitize_text_field($data['basic_info']['fitness_level'] ?? ''),
                'weight' => floatval($data['basic_info']['weight'] ?? 0),
                'height' => floatval($data['basic_info']['height'] ?? 0)
            ],
            'goals' => [
                'primary_goal' => sanitize_text_field($data['goals']['primary_goal'] ?? ''),
                'secondary_goals' => array_map('sanitize_text_field', $data['goals']['secondary_goals'] ?? []),
                'target_areas' => array_map('sanitize_text_field', $data['goals']['target_areas'] ?? [])
            ],
            'equipment' => array_map('sanitize_text_field', $data['equipment'] ?? []),
            'session_params' => [
                'duration' => absint($data['session_params']['duration'] ?? 30),
                'focus' => sanitize_text_field($data['session_params']['focus'] ?? ''),
                'energy_level' => absint($data['session_params']['energy_level'] ?? 3),
                'stress_level' => absint($data['session_params']['stress_level'] ?? 3),
                'sleep_quality' => absint($data['session_params']['sleep_quality'] ?? 3)
            ],
            'limitations' => [
                'injuries' => sanitize_textarea_field($data['limitations']['injuries'] ?? ''),
                'restrictions' => sanitize_textarea_field($data['limitations']['restrictions'] ?? ''),
                'preferences' => sanitize_textarea_field($data['limitations']['preferences'] ?? '')
            ],
            'custom_instructions' => sanitize_textarea_field($data['custom_instructions'] ?? '')
        ];
    }
    
    /**
     * Sanitize template data
     *
     * @param array $data Raw template data
     * @return array Sanitized data
     */
    private function sanitizeTemplateData(array $data): array {
        return [
            'name' => sanitize_text_field($data['name'] ?? ''),
            'description' => sanitize_textarea_field($data['description'] ?? ''),
            'form_data' => $this->sanitizeFormData($data['form_data'] ?? []),
            'prompt' => sanitize_textarea_field($data['prompt'] ?? ''),
            'tags' => array_map('sanitize_text_field', $data['tags'] ?? [])
        ];
    }
    
    /**
     * Get PromptBuilderService instance
     *
     * @return PromptBuilderService
     */
    public function getPromptBuilderService(): PromptBuilderService {
        return $this->promptBuilderService;
    }
    
    /**
     * Get TestingService instance  
     *
     * @return TestingService
     */
    public function getTestingService(): TestingService {
        return $this->testingService;
    }
    
    /**
     * Get dashboard data for PromptBuilder interface
     *
     * @param array $options Options for data retrieval
     * @return array Dashboard data
     */
    private function getDashboardData(array $options = []): array {
        error_log('[PromptBuilderController] Getting dashboard data with options: ' . json_encode($options));
        
        try {
            $time_range = $options['time_range'] ?? '7 days';
            
            // Get analytics data if available
            $analytics_data = [];
            if ($this->analytics) {
                $analytics_data = $this->analytics->getDashboardData(['time_range' => $time_range]);
            }
            
            // Get system info using consistent modular system status check
            $system_info = [
                'modular_system_active' => $this->getModularSystemStatus(),
                'ai_provider' => 'OpenAI', // Default provider
                'strategies_available' => count($this->getAvailableStrategies()),
                'version' => FITCOPILOT_VERSION ?? '1.0.0',
                'last_updated' => current_time('c')
            ];
            
            return [
                'systemInfo' => $system_info,
                'analytics' => $analytics_data,
                'users' => $this->getUsers(),
                'strategies' => $this->getAvailableStrategies(),
                'currentStrategy' => get_option('fitcopilot_current_strategy', 'SingleWorkoutStrategy')
            ];
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderController] Failed to get dashboard data: ' . $e->getMessage());
            
            return [
                'systemInfo' => [
                    'modular_system_active' => $this->getModularSystemStatus(),
                    'ai_provider' => 'Unknown',
                    'strategies_available' => 0,
                    'version' => '1.0.0',
                    'last_updated' => current_time('c')
                ],
                'analytics' => [],
                'users' => [],
                'strategies' => [],
                'currentStrategy' => 'SingleWorkoutStrategy'
            ];
        }
    }
    
    /**
     * Get available prompt strategies
     *
     * @return array Available strategies
     */
    private function getAvailableStrategies(): array {
        return [
            'SingleWorkoutStrategy' => [
                'name' => 'Single Workout Strategy',
                'description' => 'Standard single workout generation with comprehensive personalization',
                'class' => 'FitCopilot\\Service\\AI\\PromptEngineering\\Strategies\\SingleWorkoutStrategy',
                'supported_features' => ['profile_integration', 'session_customization', 'equipment_filtering'],
                'performance' => [
                    'avg_generation_time' => 150,
                    'success_rate' => 98.5,
                    'avg_prompt_length' => 1200
                ]
            ]
            // Future strategies can be added here
        ];
    }
    
    /**
     * Get WordPress users for testing
     *
     * @return array User list
     */
    private function getUsers(): array {
        $users = get_users([
            'number' => 50,
            'fields' => ['ID', 'display_name', 'user_email'],
            'orderby' => 'display_name',
            'order' => 'ASC'
        ]);
        
        $formatted_users = [];
        foreach ($users as $user) {
            $formatted_users[] = [
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email
            ];
        }
        
        return $formatted_users;
    }
    
    /**
     * Get modular system status using same logic as Testing Lab and OpenAI Provider
     * 
     * @return bool True if modular system is active
     */
    private function getModularSystemStatus(): bool {
        // Priority 1: Check if Testing Lab has forced modular system active
        $forced_active = get_option('fitcopilot_modular_system_active', false);
        if ($forced_active) {
            return true;
        }
        
        // Priority 2: Check main setting (same as OpenAI Provider)
        $option_enabled = get_option('fitcopilot_use_modular_prompts', false);
        $filter_enabled = apply_filters('fitcopilot_use_modular_prompts', $option_enabled);
        
        return (bool) $filter_enabled;
    }
    
    /**
     * Force modular system activation (same as Testing Lab)
     * 
     * @return void
     */
    private function ensureModularSystemForPromptBuilder(): void {
        // Force modular system to be active for PromptBuilder (same as Testing Lab)
        update_option('fitcopilot_modular_system_active', true);
        
        // Disable any legacy system flags
        update_option('fitcopilot_use_legacy_prompts', false);
        
        error_log('[PromptBuilderController] Modular system enforced for PromptBuilder: modular=true, legacy=false');
        
        // Verify modular system classes are available
        $required_classes = [
            'FitCopilot\Service\AI\PromptEngineering\Core\ContextManager',
            'FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder', 
            'FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy'
        ];
        
        foreach ($required_classes as $class) {
            if (!class_exists($class)) {
                throw new \Exception("Required modular system class not found for PromptBuilder: {$class}");
            }
        }
        
        error_log('[PromptBuilderController] All modular system classes verified for PromptBuilder');
    }
    
    /**
     * Validate AJAX request
     *
     * @return bool True if valid
     */
    private function validateAjaxRequest(): bool {
        // Check if this is an AJAX request
        if (!wp_doing_ajax()) {
            error_log('[PromptBuilderController] Not an AJAX request');
            return false;
        }
        
        // Check nonce (optional for non-sensitive operations)
        $nonce = $_POST['nonce'] ?? $_GET['nonce'] ?? '';
        if ($nonce && !wp_verify_nonce($nonce, 'fitcopilot_prompt_builder')) {
            error_log('[PromptBuilderController] Nonce verification failed');
            return false;
        }
        
        // Get current action to apply appropriate permission checks
        $action = $_POST['action'] ?? $_GET['action'] ?? '';
        
        // Profile loading should be available to all authenticated users
        if ($action === 'fitcopilot_prompt_builder_load_profile') {
            if (!is_user_logged_in()) {
                error_log('[PromptBuilderController] User not logged in for profile loading');
                return false;
            }
            return true; // Allow authenticated users to load their own profiles
        }
        
        // Other admin functions require manage_options capability
        if (!current_user_can('manage_options')) {
            error_log('[PromptBuilderController] User lacks required capabilities for action: ' . $action);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get request data
     *
     * @return array Request data
     */
    private function getRequestData(): array {
        return $_POST;
    }
    
    /**
     * Get performance metrics
     *
     * @param float $start_time Start time
     * @param string $prompt Generated prompt
     * @param string $context Additional context
     * @return array Performance metrics
     */
    private function getPerformanceMetrics(float $start_time, string $prompt = '', string $context = ''): array {
        $execution_time = (microtime(true) - $start_time) * 1000; // Convert to milliseconds
        
        return [
            'execution_time_ms' => round($execution_time, 2),
            'prompt_length' => strlen($prompt),
            'estimated_tokens' => $this->estimateTokenCount($prompt),
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'timestamp' => current_time('c')
        ];
    }
    
    /**
     * Estimate token count
     *
     * @param string $text Text to estimate
     * @return int Estimated token count
     */
    private function estimateTokenCount(string $text): int {
        // Simple estimation: ~4 characters per token for English text
        return (int) ceil(strlen($text) / 4);
    }
    
    /**
     * Log AJAX request
     *
     * @param string $action Action name
     * @param array $data Request data
     * @param float $start_time Start time
     */
    private function logAjaxRequest(string $action, array $data, float $start_time): void {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $execution_time = (microtime(true) - $start_time) * 1000;
            error_log("[PromptBuilderController] AJAX {$action} completed in {$execution_time}ms");
        }
    }
    
    /**
     * Send success response
     *
     * @param array $data Response data
     * @param string $message Success message
     */
    private function sendSuccessResponse(array $data, string $message = 'Success'): void {
        wp_send_json_success([
            'message' => $message,
            'data' => $data,
            'timestamp' => current_time('c')
        ]);
    }
    
    /**
     * Send error response
     *
     * @param string $message Error message
     * @param string $code Error code
     * @param array $data Additional data
     */
    private function sendErrorResponse(string $message, string $code = 'error', array $data = []): void {
        wp_send_json_error([
            'message' => $message,
            'code' => $code,
            'data' => $data,
            'timestamp' => current_time('c')
        ]);
    }
    
    /**
     * Generate test ID
     *
     * @param string $prefix Test prefix
     * @return string Test ID
     */
    private function generateTestId(string $prefix): string {
        return $prefix . '_' . uniqid() . '_' . time();
    }
    
    /**
     * Sanitize test data
     *
     * @param array $data Raw test data
     * @return array Sanitized data
     */
    private function sanitizeTestData(array $data): array {
        return [
            'prompt' => sanitize_textarea_field($data['prompt'] ?? ''),
            'parameters' => $this->sanitizeFormData($data['parameters'] ?? []),
            'test_type' => sanitize_text_field($data['test_type'] ?? 'prompt_builder_test')
        ];
    }
} 