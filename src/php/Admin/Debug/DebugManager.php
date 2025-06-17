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
        error_log('[FitCopilot Debug] DebugManager::init() called');
        error_log('[FitCopilot Debug] is_admin(): ' . (is_admin() ? 'true' : 'false'));
        
        // Always register AJAX handlers, only register admin hooks if in admin
        $this->registerAjaxHandlers();
        error_log('[FitCopilot Debug] AJAX handlers registered');
        
        if (is_admin()) {
            $this->registerAdminHooks();
            error_log('[FitCopilot Debug] Admin hooks registered');
        } else {
            error_log('[FitCopilot Debug] Not in admin context, admin hooks skipped');
        }
    }
    
    /**
     * Register AJAX handlers
     * 
     * Always called to ensure AJAX works regardless of context
     *
     * @return void
     */
    private function registerAjaxHandlers(): void {
        // Register AJAX handlers through controllers
        foreach ($this->controllers as $controller) {
            if (method_exists($controller, 'registerAjaxHandlers')) {
                $controller->registerAjaxHandlers();
            }
        }
    }
    
    /**
     * Register admin-only hooks
     * 
     * Only called in admin context
     *
     * @return void
     */
    private function registerAdminHooks(): void {
        // Register hooks only if WordPress functions are available
        if (function_exists('add_action')) {
            add_action('admin_menu', [$this, 'registerAdminMenus']);
            add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
            error_log('[FitCopilot Debug] admin_menu and admin_enqueue_scripts hooks added');
        } else {
            error_log('[FitCopilot Debug] add_action function not available');
        }
    }
    
    /**
     * Register admin menu pages
     *
     * @return void
     */
    public function registerAdminMenus(): void {
        // Skip menu registration - AdminMenu.php handles all menu registration
        // This prevents conflicts and duplicate menu entries
        error_log('[FitCopilot Debug] Skipping menu registration - handled by AdminMenu.php');
        return;
        
        /*
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
        */
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
        // Debug: Log when this method is called
        error_log("DebugManager::enqueueAdminAssets called with hook: {$hook_suffix}");
        
        // More specific hook matching for Testing Lab page
        $is_debug_page = (
            strpos($hook_suffix, 'fitcopilot-debug') !== false ||
            strpos($hook_suffix, 'testing-lab') !== false ||
            strpos($hook_suffix, 'fitcopilot_page_fitcopilot-testing-lab') !== false
        );
        
        if (!$is_debug_page) {
            error_log("DebugManager: Hook condition NOT matched, skipping asset loading");
            return;
        }
        
        error_log("DebugManager: Hook condition matched, proceeding with asset loading");
        
        // Let each controller handle its own assets
        foreach ($this->controllers as $name => $controller) {
            if (method_exists($controller, 'enqueueAssets')) {
                error_log("DebugManager: Calling enqueueAssets on controller: {$name}");
                $controller->enqueueAssets($hook_suffix);
            } else {
                error_log("DebugManager: Controller {$name} does not have enqueueAssets method");
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