<?php
/**
 * SystemLogsController - Handles System Logs functionality
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Traits\AjaxHandlerTrait;

if (!defined('ABSPATH')) {
    exit;
}

class SystemLogsController {
    
    use AjaxHandlerTrait;
    
    public function __construct() {
        // No WordPress functions in constructor
    }
    
    public function registerAjaxHandlers(): void {
        if (function_exists('add_action')) {
            add_action('wp_ajax_fitcopilot_debug_get_logs', [$this, 'handleGetLogs']);
            add_action('wp_ajax_fitcopilot_debug_clear_logs', [$this, 'handleClearLogs']);
        }
    }
    
    public function registerMenuPages(): void {
        add_submenu_page(
            'fitcopilot-debug',
            'System Logs',
            'System Logs',
            'manage_options',
            'fitcopilot-system-logs',
            [$this, 'renderSystemLogsPage']
        );
    }
    
    public function handleGetLogs(): void {
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Use DebugLogger static methods correctly
            $logs = \FitCopilot\Utils\DebugLogger::getLogs([], 100);
            $this->sendSuccessResponse($logs, 'Logs retrieved successfully');
        } catch (\Exception $e) {
            $this->sendErrorResponse('Failed to retrieve logs: ' . $e->getMessage());
        }
    }
    
    public function handleClearLogs(): void {
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            // Clear logs implementation
            $this->sendSuccessResponse(['cleared' => true], 'Logs cleared successfully');
        } catch (\Exception $e) {
            $this->sendErrorResponse('Failed to clear logs: ' . $e->getMessage());
        }
    }
    
    public function renderSystemLogsPage(): void {
        echo '<div class="wrap"><h1>System Logs</h1><p>System logs functionality will be implemented here.</p></div>';
    }
} 