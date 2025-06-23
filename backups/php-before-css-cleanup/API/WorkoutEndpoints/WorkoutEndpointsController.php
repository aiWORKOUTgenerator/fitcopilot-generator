<?php
/**
 * Workout Endpoints Controller
 *
 * Handles loading and initialization of all workout endpoint classes
 */

namespace FitCopilot\API\WorkoutEndpoints;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Workout Endpoints Controller class
 */
class WorkoutEndpointsController {
    
    /**
     * Endpoint instances
     */
    private $endpoints = [];
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', [$this, 'load_endpoints']);
        
        // Execute immediately if already fired
        if (did_action('init')) {
            $this->load_endpoints();
        }
        
        error_log('FitCopilot WorkoutEndpointsController initialized');
    }
    
    /**
     * Load all endpoint classes
     */
    public function load_endpoints() {
        // Common utilities
        require_once dirname(__FILE__) . '/Utilities.php';
        
        // Load endpoints
        $endpoints = [
            'GenerateEndpoint',
            'WorkoutRetrievalEndpoint',
            'WorkoutUpdateEndpoint',
            'WorkoutCompletionEndpoint',
            'VersionHistoryEndpoint',
            'CompareVersionsEndpoint'
            // DISABLED: 'DebugEndpoints' - Causing class name collision with Admin\DebugEndpoints
        ];
        
        // Initialize each endpoint class
        foreach ($endpoints as $endpoint) {
            $class_name = 'FitCopilot\\API\\WorkoutEndpoints\\' . $endpoint;
            
            if (class_exists($class_name)) {
                $this->endpoints[$endpoint] = new $class_name();
                error_log('Loaded endpoint: ' . $endpoint);
            } else {
                error_log('Failed to load endpoint: ' . $endpoint);
            }
        }
        
        error_log('FitCopilot loaded ' . count($this->endpoints) . ' endpoints');
    }
    
    /**
     * Get all loaded endpoints
     *
     * @return array Loaded endpoint instances
     */
    public function get_endpoints() {
        return $this->endpoints;
    }
} 