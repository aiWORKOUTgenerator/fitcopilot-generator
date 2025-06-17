<?php
/**
 * DebugBootstrap - Initialize the modular debug system
 * 
 * Properly initializes the debug system without causing 500 errors
 */

namespace FitCopilot\Admin\Debug;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * DebugBootstrap Class
 * 
 * Handles proper initialization of the debug system
 */
class DebugBootstrap {
    
    /**
     * Debug manager instance
     *
     * @var DebugManager
     */
    private static $debug_manager = null;
    
    /**
     * Initialize the debug system
     * 
     * Call this from WordPress init hook
     *
     * @return void
     */
    public static function init(): void {
        // Only initialize once
        if (self::$debug_manager !== null) {
            return;
        }
        
        // Always initialize to ensure AJAX handlers are registered
        // Context checks will be handled by individual controllers
        
        try {
            // Debug logging
            error_log('[FitCopilot Debug] DebugBootstrap::init() called');
            error_log('[FitCopilot Debug] is_admin(): ' . (is_admin() ? 'true' : 'false'));
            
            // Create debug manager
            self::$debug_manager = new DebugManager();
            error_log('[FitCopilot Debug] DebugManager created successfully');
            
            // Initialize the manager (this will register hooks)
            self::$debug_manager->init();
            error_log('[FitCopilot Debug] DebugManager::init() called successfully');
            
        } catch (\Exception $e) {
            // Log error but don't break the site
            error_log('[FitCopilot Debug] Failed to initialize debug system: ' . $e->getMessage());
            error_log('[FitCopilot Debug] Exception trace: ' . $e->getTraceAsString());
        }
    }
    
    /**
     * Get debug manager instance
     *
     * @return DebugManager|null
     */
    public static function getDebugManager(): ?DebugManager {
        return self::$debug_manager;
    }
    
    /**
     * Check if debug system is available
     *
     * @return bool
     */
    public static function isAvailable(): bool {
        return self::$debug_manager !== null && self::$debug_manager->isHealthy();
    }
    
    /**
     * Get debug system status
     *
     * @return array
     */
    public static function getStatus(): array {
        if (self::$debug_manager === null) {
            return [
                'initialized' => false,
                'healthy' => false,
                'error' => 'Debug manager not initialized'
            ];
        }
        
        return array_merge(
            ['initialized' => true],
            self::$debug_manager->getStatus()
        );
    }
} 