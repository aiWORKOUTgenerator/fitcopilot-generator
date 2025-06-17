<?php
/**
 * PromptBuilderController - Phase 2 Week 1: Advanced Prompt Engineering Interface
 * 
 * Main controller for the PromptBuilder system that integrates analytics, multi-provider
 * support, and visual prompt design capabilities with the existing Testing Lab architecture.
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Services\PromptAnalyticsService;
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
        // AJAX endpoints
        add_action('wp_ajax_fitcopilot_prompt_builder_generate', [$this, 'handleGeneratePrompt']);
        add_action('wp_ajax_fitcopilot_prompt_builder_compare_providers', [$this, 'handleCompareProviders']);
        add_action('wp_ajax_fitcopilot_analytics_get_dashboard', [$this, 'handleGetDashboard']);
        add_action('wp_ajax_fitcopilot_analytics_create_ab_test', [$this, 'handleCreateABTest']);
        add_action('wp_ajax_fitcopilot_multi_provider_compare', [$this, 'handleMultiProviderCompare']);
        add_action('wp_ajax_fitcopilot_prompt_builder_save_template', [$this, 'handleSaveTemplate']);
        
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
            
            // Render the interface
            $this->view->render([
                'dashboard_data' => $dashboard_data,
                'provider_health' => $provider_health,
                'available_strategies' => $available_strategies,
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
    
         /**
      * Handle live prompt generation AJAX request
      */
     public function handleGeneratePrompt(): void {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'fitcopilot_prompt_builder')) {
            wp_die('Security check failed');
        }
        
        try {
            $test_data = json_decode(stripslashes($_POST['test_data'] ?? '{}'), true);
            
            if (empty($test_data)) {
                throw new \Exception('No test data provided');
            }
            
            $start_time = microtime(true);
            
            // Use selected provider or default
            $provider_name = $test_data['provider'] ?? 'openai';
            $provider = $this->multiProvider->getProvider($provider_name);
            
            if (!$provider) {
                throw new \Exception("Provider not available: {$provider_name}");
            }
            
            // Generate prompt
            $prompt = $provider->buildPrompt($test_data);
            $generation_time = (microtime(true) - $start_time) * 1000;
            
            // Track analytics
            $prompt_data = [
                'prompt_id' => wp_generate_uuid4(),
                'prompt' => $prompt,
                'strategy_name' => $test_data['strategy'] ?? 'SingleWorkoutStrategy',
                'parameters' => $test_data,
                'context' => $this->extractContextData($test_data),
                'generation_time_ms' => $generation_time,
                'provider' => $provider_name
            ];
            
            $analytics_id = $this->analytics->trackPromptGeneration($prompt_data);
            
            // Prepare response
            $response_data = [
                'prompt' => $prompt,
                'prompt_id' => $prompt_data['prompt_id'],
                'analytics_id' => $analytics_id,
                'generation_time_ms' => round($generation_time, 2),
                'prompt_length' => strlen($prompt),
                'estimated_tokens' => $this->estimateTokenCount($prompt),
                'estimated_cost' => $provider->estimateCost($prompt),
                'provider_info' => $provider->getProviderInfo(),
                'quality_metrics' => $this->calculateQuickQualityMetrics($prompt, $test_data),
                'timestamp' => current_time('c')
            ];
            
            wp_send_json_success($response_data);
            
        } catch (\Exception $e) {
            error_log('[PromptBuilder] Generate prompt failed: ' . $e->getMessage());
            wp_send_json_error([
                'message' => $e->getMessage(),
                'timestamp' => current_time('c')
            ]);
                 }
     }
    public function registerAjaxHandlers(): void {
        // Only register if WordPress functions are available
        if (function_exists('add_action')) {
            // Phase 1: Core PromptBuilder AJAX endpoints
            add_action('wp_ajax_fitcopilot_prompt_builder_generate', [$this, 'handleLivePromptGeneration']);
            add_action('wp_ajax_fitcopilot_prompt_builder_get_strategy', [$this, 'handleGetStrategyCode']);
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
            error_log("PromptBuilderController: Hook condition matched, enqueuing assets");
            
            // Enqueue modular JavaScript architecture
            wp_enqueue_script(
                'fitcopilot-prompt-builder',
                plugins_url('assets/js/prompt-builder/index.js', FITCOPILOT_FILE),
                ['jquery', 'wp-util'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_style(
                'fitcopilot-prompt-builder',
                plugins_url('assets/css/admin-prompt-builder.css', FITCOPILOT_FILE),
                [],
                FITCOPILOT_VERSION
            );
            
            // Localize script with PromptBuilder configuration
            $nonce = wp_create_nonce('fitcopilot_admin_ajax');
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
            // Validate request
            if (!$this->validateAjaxRequest()) {
                error_log('[PromptBuilderController] Request validation failed');
                return;
            }
            
            // Get form data
            $form_data = $this->getRequestData();
            $form_data = $this->sanitizeFormData($form_data);
            
            error_log('[PromptBuilderController] Form data sanitized: ' . json_encode($form_data));
            
            // Generate live prompt using PromptBuilderService
            $result = $this->promptBuilderService->generateLivePrompt($form_data);
            
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
            
            // Send response
            $this->sendSuccessResponse($result, 'Live prompt generated successfully');
            
        } catch (\Exception $e) {
            ob_end_clean();
            error_log('[PromptBuilderController] Live prompt generation failed: ' . $e->getMessage());
            error_log('[PromptBuilderController] Exception trace: ' . $e->getTraceAsString());
            
            $this->sendErrorResponse(
                'Live prompt generation failed: ' . $e->getMessage(),
                'live_prompt_generation_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => $e->getTraceAsString()
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
            
            // Send response
            $this->sendSuccessResponse($result, 'Strategy code retrieved successfully');
            
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
     * Phase 1: Load current user's profile data for form population
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
            
            // Get user profile data using PromptBuilderService
            $result = $this->promptBuilderService->getUserProfileData();
            
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
} 