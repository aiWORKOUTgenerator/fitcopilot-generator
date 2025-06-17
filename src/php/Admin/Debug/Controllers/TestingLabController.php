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
        // Debug: Log when this method is called
        error_log("TestingLabController::enqueueAssets called with hook: {$hook_suffix}");
        
        // Only load on Testing Lab page
        if (strpos($hook_suffix, 'testing-lab') !== false || strpos($hook_suffix, 'fitcopilot-debug') !== false) {
            error_log("TestingLabController: Hook condition matched, enqueuing assets");
            wp_enqueue_script(
                'fitcopilot-testing-lab',
                plugins_url('assets/js/admin-testing-lab.js', FITCOPILOT_FILE),
                ['jquery', 'wp-util'],
                FITCOPILOT_VERSION,
                true
            );
            
            wp_enqueue_style(
                'fitcopilot-testing-lab',
                plugins_url('assets/css/admin-testing-lab.css', FITCOPILOT_FILE),
                [],
                FITCOPILOT_VERSION
            );
            
            // Localize script with proper nonce (use unique variable name to avoid conflicts)
            $nonce = wp_create_nonce('fitcopilot_admin_ajax');
            error_log("TestingLabController: Localizing script with nonce: {$nonce}");
            
            wp_localize_script('fitcopilot-testing-lab', 'fitcopilotTestingLab', [
                'nonce' => $nonce,
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
        // Enhanced error handling to prevent 500 errors
        error_log('[TestingLabController] handleWorkoutTest called');
        
        // Clear any existing output buffers to prevent conflicts
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        // Start fresh output buffer
        ob_start();
        
        $start_time = microtime(true);
        
        try {
            error_log('[TestingLabController] Starting request validation');
            
            // Validate request
            if (!$this->validateAjaxRequest()) {
                error_log('[TestingLabController] Request validation failed');
                return;
            }
            
            error_log('[TestingLabController] Request validation passed');
            
            // Get and sanitize test data
            $test_data = $this->getRequestData();
            $test_data = $this->sanitizeTestData($test_data);
            
            error_log('[TestingLabController] Test data sanitized: ' . json_encode($test_data));
            
            // Generate test ID
            $test_id = $this->generateTestId('workout');
            
            error_log('[TestingLabController] Generated test ID: ' . $test_id);
            
            // Perform workout test
            error_log('[TestingLabController] About to call testWorkoutGeneration');
            $result = $this->testingService->testWorkoutGeneration($test_data, $test_id);
            
            error_log('[TestingLabController] testWorkoutGeneration completed successfully');
            
            // Add performance metrics
            $result['performance_metrics'] = $this->getPerformanceMetrics(
                $start_time,
                $result['prompt'] ?? '',
                $result['raw_response'] ?? ''
            );
            
            // Log request
            $this->logAjaxRequest('test_workout', $test_data, $start_time);
            
            // Clear output buffer before sending response
            ob_end_clean();
            
            // Send response
            $this->sendSuccessResponse($result, 'Workout test completed successfully');
            
        } catch (\Error $e) {
            // Handle fatal errors
            ob_end_clean();
            error_log('[TestingLabController] Fatal error: ' . $e->getMessage());
            error_log('[TestingLabController] Fatal error trace: ' . $e->getTraceAsString());
            
            $this->sendErrorResponse(
                'Fatal error in workout test: ' . $e->getMessage(),
                'workout_test_fatal_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => $e->getTraceAsString(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine()
                ]
            );
        } catch (\Exception $e) {
            ob_end_clean();
            error_log('[TestingLabController] Exception: ' . $e->getMessage());
            error_log('[TestingLabController] Exception trace: ' . $e->getTraceAsString());
            
            $this->sendErrorResponse(
                'Workout test failed: ' . $e->getMessage(),
                'workout_test_error',
                [
                    'performance_metrics' => $this->getPerformanceMetrics($start_time),
                    'error_trace' => $e->getTraceAsString(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine()
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