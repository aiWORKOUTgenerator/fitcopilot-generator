<?php
/**
 * ResponseAnalysisController - Handles Response Analysis functionality
 */

namespace FitCopilot\Admin\Debug\Controllers;

use FitCopilot\Admin\Debug\Traits\AjaxHandlerTrait;

if (!defined('ABSPATH')) {
    exit;
}

class ResponseAnalysisController {
    
    use AjaxHandlerTrait;
    
    public function __construct() {
        // No WordPress functions in constructor
    }
    
    public function registerAjaxHandlers(): void {
        if (function_exists('add_action')) {
            add_action('wp_ajax_fitcopilot_debug_response', [$this, 'handleResponseAnalysis']);
        }
    }
    
    public function registerMenuPages(): void {
        add_submenu_page(
            'fitcopilot-debug',
            'Response Analyzer',
            'Response Analyzer',
            'manage_options',
            'fitcopilot-response-analyzer',
            [$this, 'renderResponseAnalyzerPage']
        );
    }
    
    public function handleResponseAnalysis(): void {
        if (!$this->validateAjaxRequest()) {
            return;
        }
        
        try {
            $response_json = stripslashes($_POST['response'] ?? '');
            $analysis = [
                'valid_json' => json_decode($response_json) !== null,
                'length' => strlen($response_json),
                'structure' => 'analyzed'
            ];
            
            $this->sendSuccessResponse($analysis, 'Response analysis completed successfully');
        } catch (\Exception $e) {
            $this->sendErrorResponse('Failed to analyze response: ' . $e->getMessage());
        }
    }
    
    public function renderResponseAnalyzerPage(): void {
        echo '<div class="wrap"><h1>Response Analyzer</h1><p>Response analysis functionality will be implemented here.</p></div>';
    }
} 