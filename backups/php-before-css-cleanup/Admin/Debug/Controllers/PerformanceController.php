<?php
/**
 * PerformanceController - Handles Performance Monitoring functionality
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Traits\AjaxHandlerTrait;

if (!defined('ABSPATH')) {
    exit;
}

class PerformanceController {
    
    use AjaxHandlerTrait;
    
    public function __construct() {
        // No WordPress functions in constructor
    }
    
    public function registerAjaxHandlers(): void {
        if (function_exists('add_action')) {
            add_action('wp_ajax_fitcopilot_debug_performance', [$this, 'handlePerformanceMetrics']);
        }
    }
    
    public function registerMenuPages(): void {
        add_submenu_page(
            'fitcopilot-debug',
            'Performance Monitor',
            'Performance',
            'manage_options',
            'fitcopilot-performance',
            [$this, 'renderPerformancePage']
        );
    }
    
    public function handlePerformanceMetrics(): void {
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            $metrics = [
                'avg_response_time' => 150,
                'peak_memory' => memory_get_peak_usage(true),
                'db_queries' => 0
            ];
            
            $this->sendSuccessResponse($metrics, 'Performance metrics retrieved successfully');
        } catch (\Exception $e) {
            $this->sendErrorResponse('Failed to retrieve performance metrics: ' . $e->getMessage());
        }
    }
    
    public function renderPerformancePage(): void {
        echo '<div class="wrap"><h1>Performance Monitor</h1><p>Performance monitoring functionality will be implemented here.</p></div>';
    }
} 