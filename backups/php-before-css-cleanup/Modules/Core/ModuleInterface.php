<?php

namespace FitCopilot\Modules\Core;

/**
 * Module Interface
 * 
 * Defines the contract that all FitCopilot modules must implement
 * for consistent module management and communication
 */
interface ModuleInterface {
    
    /**
     * Boot the module
     * Initialize hooks, actions, and filters
     * 
     * @return void
     */
    public function boot(): void;
    
    /**
     * Register module routes
     * Register REST API routes and WordPress routes
     * 
     * @return void
     */
    public function registerRoutes(): void;
    
    /**
     * Register module assets
     * Register and enqueue CSS/JS assets
     * 
     * @return void
     */
    public function registerAssets(): void;
    
    /**
     * Get module capabilities
     * Return array of capabilities this module provides
     * 
     * @return array
     */
    public function getCapabilities(): array;
} 