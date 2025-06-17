<?php
/**
 * DebugManager - Main coordinator for debug functionality
 * 
 * Coordinates all debug-related functionality without the architectural issues
 * that caused 500 errors in the monolithic DebugEndpoints.php
 */

namespace FitCopilot\Admin\Debug;

use FitCopilot\Admin\Debug\Controllers\TestingLabController;
use FitCopilot\Admin\Debug\Controllers\SystemLogsController;
use FitCopilot\Admin\Debug\Controllers\PerformanceController;
use FitCopilot\Admin\Debug\Controllers\ResponseAnalysisController;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DebugManager Class
 * 
 * Main coordinator for debug functionality with proper separation of concerns
 */
class DebugManager {
    
    /**
     * Controllers
     *
     * @var array
     */
    private $controllers = [];
    
    /**
     * Initialize debug manager
     * 
     * Fixed: No longer calls WordPress functions in constructor
     */
    public function __construct() {
        // Only initialize controllers, don't register hooks in constructor
        $this->initializeControllers();
    }
    
    /**
     * Initialize controllers
     *
     * @return void
     */
    private function initializeControllers(): void {
        $this->controllers = [
            'testing_lab' => new TestingLabController(),
            'system_logs' => new SystemLogsController(),
            'performance' => new PerformanceController(),
            'response_analysis' => new ResponseAnalysisController()
        ];
    }
    
    /**
     * Initialize the debug system
     * 
     * Call this from WordPress init hook, not constructor
     *
     * @return void
     */
    public function init(): void {
        // Only register hooks after WordPress is fully loaded
        if (is_admin()) {
            $this->registerHooks();
        }
    }
    
    /**
     * Register WordPress hooks
     * 
     * Fixed: Only called after WordPress is fully initialized
     *
     * @return void
     */
    private function registerHooks(): void {
        // Register hooks only if WordPress functions are available
        if (function_exists('add_action')) {
            add_action('admin_menu', [$this, 'registerAdminMenus']);
            add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
            
            // Register AJAX handlers through controllers
            foreach ($this->controllers as $controller) {
                if (method_exists($controller, 'registerAjaxHandlers')) {
                    $controller->registerAjaxHandlers();
                }
            }
        }
    }
    
    /**
     * Register admin menu pages
     *
     * @return void
     */
    public function registerAdminMenus(): void {
        // Only register if we have proper permissions
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Main Debug Dashboard (only if not already registered by AdminMenu)
        if (!$this->isMenuPageRegistered('fitcopilot-debug')) {
            add_menu_page(
                'FitCopilot Debug Dashboard',
                'Debug Dashboard',
                'manage_options',
                'fitcopilot-debug',
                [$this, 'renderDebugDashboard'],
                'dashicons-search',
                58
            );
        }
        
        // Let each controller register its own sub-menu pages
        foreach ($this->controllers as $controller) {
            if (method_exists($controller, 'registerMenuPages')) {
                $controller->registerMenuPages();
            }
        }
    }
    
    /**
     * Check if a menu page is already registered
     *
     * @param string $menu_slug Menu slug to check
     * @return bool
     */
    private function isMenuPageRegistered(string $menu_slug): bool {
        global $admin_page_hooks;
        return isset($admin_page_hooks[$menu_slug]);
    }
    
    /**
     * Enqueue admin assets
     *
     * @param string $hook_suffix Current admin page
     * @return void
     */
    public function enqueueAdminAssets(string $hook_suffix): void {
        // Only load on debug pages
        if (strpos($hook_suffix, 'fitcopilot-debug') === false) {
            return;
        }
        
        // Let each controller handle its own assets
        foreach ($this->controllers as $controller) {
            if (method_exists($controller, 'enqueueAssets')) {
                $controller->enqueueAssets($hook_suffix);
            }
        }
    }
    
    /**
     * Render main debug dashboard
     *
     * @return void
     */
    public function renderDebugDashboard(): void {
        // Delegate to the appropriate view
        $view = new \FitCopilot\Admin\Debug\Views\DebugDashboardView();
        $view->render();
    }
    
    /**
     * Get controller by name
     *
     * @param string $name Controller name
     * @return object|null Controller instance or null if not found
     */
    public function getController(string $name): ?object {
        return $this->controllers[$name] ?? null;
    }
    
    /**
     * Check if debug system is healthy
     *
     * @return bool
     */
    public function isHealthy(): bool {
        try {
            // Basic health checks
            return is_admin() && 
                   current_user_can('manage_options') && 
                   !empty($this->controllers);
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Get debug system status
     *
     * @return array
     */
    public function getStatus(): array {
        return [
            'healthy' => $this->isHealthy(),
            'controllers_loaded' => count($this->controllers),
            'controllers' => array_keys($this->controllers),
            'memory_usage' => memory_get_usage(true),
            'timestamp' => time()
        ];
    }
} 