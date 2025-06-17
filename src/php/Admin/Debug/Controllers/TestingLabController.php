<?php
/**
 * TestingLabController - Handles Testing Lab functionality
 * 
 * Manages workout generation testing, prompt building, and context validation
 * without the architectural issues that caused 500 errors
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Traits\AjaxHandlerTrait;
use FitCopilot\Admin\Debug\Services\TestingService;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * TestingLabController Class
 * 
 * Handles all Testing Lab related functionality
 */
class TestingLabController {
    
    use AjaxHandlerTrait;
    
    /**
     * Testing service
     *
     * @var TestingService
     */
    private $testingService;
    
    /**
     * Initialize controller
     */
    public function __construct() {
        // Initialize service without calling WordPress functions
        $this->testingService = new TestingService();
    }
    
    /**
     * Register AJAX handlers
     *
     * @return void
     */
    public function registerAjaxHandlers(): void {
        // Only register if WordPress functions are available
        if (function_exists('add_action')) {
            add_action('wp_ajax_fitcopilot_debug_test_workout', [$this, 'handleWorkoutTest']);
            add_action('wp_ajax_fitcopilot_debug_test_prompt', [$this, 'handlePromptTest']);
            add_action('wp_ajax_fitcopilot_debug_validate_context', [$this, 'handleContextValidation']);
            add_action('wp_ajax_fitcopilot_debug_performance_test', [$this, 'handlePerformanceTest']);
        }
    }
    
    /**
     * Register menu pages
     *
     * @return void
     */
    public function registerMenuPages(): void {
        // Register Testing Lab sub-menu page
        add_submenu_page(
            'fitcopilot-debug',
            'Testing Lab',
            'Testing Lab',
            'manage_options',
            'fitcopilot-testing-lab',
            [$this, 'renderTestingLabPage']
        );
    }
    
    /**
     * Enqueue assets for Testing Lab
     *
     * @param string $hook_suffix Current admin page
     * @return void
     */
    public function enqueueAssets(string $hook_suffix): void {
        // Only load on Testing Lab page
        if (strpos($hook_suffix, 'testing-lab') !== false) {
            wp_enqueue_script(
                'fitcopilot-testing-lab',
                plugins_url('assets/js/admin-testing-lab.js', FITCOPILOT_PLUGIN_FILE),
                ['jquery', 'wp-util'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_style(
                'fitcopilot-testing-lab',
                plugins_url('assets/css/admin-testing-lab.css', FITCOPILOT_PLUGIN_FILE),
                [],
                FITCOPILOT_VERSION
            );
            
            // Localize script with proper nonce
            wp_localize_script('fitcopilot-testing-lab', 'fitcopilotData', [
                'nonce' => wp_create_nonce('fitcopilot_admin_ajax'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'debug' => defined('WP_DEBUG') && WP_DEBUG
            ]);
        }
    }
    
    /**
     * Handle workout generation test
     *
     * @return void
     */
    public function handleWorkoutTest(): void {
        $start_time = microtime(true);
        
        // Validate request
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Get and sanitize test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            // Generate test ID
            $test_id = $this->generateTestId('workout');
            
            // Perform workout test
            $result = $this->testingService->testWorkoutGeneration($test_data, $test_id);
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics(
                $start_time,
                $result['prompt'] ?? '',
                $result['raw_response'] ?? ''
            );
            
            // Log request
            $this->logAjaxRequest('test_workout', $test_data, $start_time);
            
            // Send response
            $this->sendSuccessResponse($result, 'Workout test completed successfully');
            
        } catch (\Exception $e) {
            $this->sendErrorResponse(
                'Workout test failed: ' . $e->getMessage(),
                'workout_test_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => defined('WP_DEBUG') && WP_DEBUG ? $e->getTraceAsString() : null
                ]
            );
        }
    }
    
    /**
     * Handle prompt building test
     *
     * @return void
     */
    public function handlePromptTest(): void {
        $start_time = microtime(true);
        
        // Validate request
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Get and sanitize test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            // Generate test ID
            $test_id = $this->generateTestId('prompt');
            
            // Perform prompt test
            $result = $this->testingService->testPromptBuilding($test_data, $test_id);
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics(
                $start_time,
                $result['prompt'] ?? ''
            );
            
            // Log request
            $this->logAjaxRequest('test_prompt', $test_data, $start_time);
            
            // Send response
            $this->sendSuccessResponse($result, 'Prompt test completed successfully');
            
        } catch (\Exception $e) {
            $this->sendErrorResponse(
                'Prompt test failed: ' . $e->getMessage(),
                'prompt_test_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => defined('WP_DEBUG') && WP_DEBUG ? $e->getTraceAsString() : null
                ]
            );
        }
    }
    
    /**
     * Handle context validation
     *
     * @return void
     */
    public function handleContextValidation(): void {
        $start_time = microtime(true);
        
        // Validate request
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Get and sanitize test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            // Generate test ID
            $test_id = $this->generateTestId('context');
            
            // Perform context validation
            $result = $this->testingService->validateContext($test_data, $test_id);
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics($start_time);
            
            // Log request
            $this->logAjaxRequest('validate_context', $test_data, $start_time);
            
            // Send response
            $this->sendSuccessResponse($result, 'Context validation completed successfully');
            
        } catch (\Exception $e) {
            $this->sendErrorResponse(
                'Context validation failed: ' . $e->getMessage(),
                'context_validation_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => defined('WP_DEBUG') && WP_DEBUG ? $e->getTraceAsString() : null
                ]
            );
        }
    }
    
    /**
     * Handle performance test
     *
     * @return void
     */
    public function handlePerformanceTest(): void {
        $start_time = microtime(true);
        
        // Validate request
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Get and sanitize test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            // Generate test ID
            $test_id = $this->generateTestId('performance');
            
            // Perform performance test
            $result = $this->testingService->performanceTest($test_data, $test_id);
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics($start_time);
            
            // Log request
            $this->logAjaxRequest('performance_test', $test_data, $start_time);
            
            // Send response
            $this->sendSuccessResponse($result, 'Performance test completed successfully');
            
        } catch (\Exception $e) {
            $this->sendErrorResponse(
                'Performance test failed: ' . $e->getMessage(),
                'performance_test_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => defined('WP_DEBUG') && WP_DEBUG ? $e->getTraceAsString() : null
                ]
            );
        }
    }
    
    /**
     * Render Testing Lab page
     *
     * @return void
     */
    public function renderTestingLabPage(): void {
        // Delegate to view
        $view = new \FitCopilot\Admin\Debug\Views\TestingLabView();
        $view->render();
    }
    
    /**
     * Get testing service
     *
     * @return TestingService
     */
    public function getTestingService(): TestingService {
        return $this->testingService;
    }
} 