<?php

namespace FitCopilot\Modules\Core;

/**
 * Module Manager - Central coordinator for all business modules
 * 
 * Implements Strangler Fig pattern to gradually replace monolithic code
 * with modular architecture while maintaining backward compatibility.
 */
class ModuleManager {
    
    private array $modules = [];
    private array $capabilities = [];
    private bool $initialized = false;
    
    private static ?ModuleManager $instance = null;
    
    /**
     * Singleton instance
     */
    public static function getInstance(): ModuleManager {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Private constructor for singleton
    }
    
    /**
     * Initialize the module system
     */
    public function init(): void {
        error_log('[ModuleManager] Initializing module system...');
        
        if ($this->initialized) {
            error_log('[ModuleManager] Module system already initialized');
            return;
        }
        
        // Register core modules
        error_log('[ModuleManager] Registering core modules...');
        $this->registerCoreModules();
        
        // Boot all modules
        error_log('[ModuleManager] Booting modules...');
        $this->bootModules();
        
        // Register module routes
        error_log('[ModuleManager] Registering module routes...');
        $this->registerModuleRoutes();
        
        // Register module assets
        add_action('wp_enqueue_scripts', [$this, 'enqueueModuleAssets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueModuleAssets']);
        
        // Register debug endpoint
        add_action('wp_ajax_fitcopilot_debug_module_status', [$this, 'handleModuleStatusDebug']);
        
        // Register delegation test endpoints (Sprint 2 - Phase 1)
        add_action('wp_ajax_fitcopilot_test_profile_delegation', [$this, 'testProfileDelegation']);
        add_action('wp_ajax_fitcopilot_test_muscle_delegation', [$this, 'testMuscleDelegation']);
        
        // Register communication test endpoints (Sprint 2 - Phase 3)
        add_action('wp_ajax_fitcopilot_simulate_profile_change', [$this, 'simulateProfileChange']);
        add_action('wp_ajax_fitcopilot_get_event_log', [$this, 'getEventLog']);
        
        $this->initialized = true;
        
        error_log('[ModuleManager] Module system initialization completed');
        do_action('fitcopilot_modules_initialized', $this);
    }
    
    /**
     * Register a module
     */
    public function registerModule(string $name, ModuleInterface $module): void {
        $this->modules[$name] = $module;
        $this->capabilities[$name] = $module->getCapabilities();
        
        error_log("[ModuleManager] Registered module: {$name} with capabilities: " . implode(', ', $module->getCapabilities()));
    }
    
    /**
     * Get a module by name
     */
    public function getModule(string $name): ?ModuleInterface {
        return $this->modules[$name] ?? null;
    }
    
    /**
     * Check if a module exists
     */
    public function hasModule(string $name): bool {
        return isset($this->modules[$name]);
    }
    
    /**
     * Check if a capability is available
     */
    public function hasCapability(string $capability): bool {
        foreach ($this->capabilities as $module_caps) {
            if (in_array($capability, $module_caps)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get module that provides a capability
     */
    public function getModuleForCapability(string $capability): ?ModuleInterface {
        foreach ($this->capabilities as $module_name => $module_caps) {
            if (in_array($capability, $module_caps)) {
                return $this->modules[$module_name];
            }
        }
        return null;
    }
    
    /**
     * Delegate functionality to appropriate module (Strangler Fig pattern)
     */
    public function delegate(string $capability, string $method, array $args = []) {
        $module = $this->getModuleForCapability($capability);
        
        if ($module && method_exists($module, $method)) {
            error_log("[ModuleManager] Delegating {$capability}::{$method} to module");
            return call_user_func_array([$module, $method], $args);
        }
        
        error_log("[ModuleManager] No module found for capability: {$capability}");
        return null;
    }
    
    /**
     * Register core modules
     */
    private function registerCoreModules(): void {
        error_log('[ModuleManager] Starting core module registration...');
        
        try {
            // Register ProfileManagement Module
            $profileModulePath = FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileModule.php';
            error_log('[ModuleManager] Loading ProfileModule from: ' . $profileModulePath);
            
            if (file_exists($profileModulePath)) {
                require_once $profileModulePath;
                
                // Load dependencies
                require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileRepository.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileValidator.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileView.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileService.php';
                
                $profileModule = new \FitCopilot\Modules\ProfileManagement\ProfileModule();
                $this->registerModule('profile', $profileModule);
                error_log('[ModuleManager] ProfileModule registered successfully');
            } else {
                error_log('[ModuleManager] ProfileModule file not found: ' . $profileModulePath);
            }
        } catch (\Exception $e) {
            error_log('[ModuleManager] Failed to register ProfileModule: ' . $e->getMessage());
        }
        
        try {
            // Register MuscleTargeting Module
            $muscleModulePath = FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleModule.php';
            error_log('[ModuleManager] Loading MuscleModule from: ' . $muscleModulePath);
            
            if (file_exists($muscleModulePath)) {
                require_once $muscleModulePath;
                
                // Load dependencies
                require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleRepository.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleService.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleView.php';
                
                $muscleModule = new \FitCopilot\Modules\MuscleTargeting\MuscleModule();
                $this->registerModule('muscle', $muscleModule);
                error_log('[ModuleManager] MuscleModule registered successfully');
            } else {
                error_log('[ModuleManager] MuscleModule file not found: ' . $muscleModulePath);
            }
        } catch (\Exception $e) {
            error_log('[ModuleManager] Failed to register MuscleModule: ' . $e->getMessage());
        }
        
        try {
            // Register SleepQuality Module
            $sleepModulePath = FITCOPILOT_DIR . 'src/php/Modules/SleepQuality/SleepQualityModule.php';
            error_log('[ModuleManager] Loading SleepQualityModule from: ' . $sleepModulePath);
            
            if (file_exists($sleepModulePath)) {
                require_once $sleepModulePath;
                
                // Load dependencies
                require_once FITCOPILOT_DIR . 'src/php/Modules/SleepQuality/SleepQualityRepository.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/SleepQuality/SleepQualityValidator.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/SleepQuality/SleepQualityView.php';
                require_once FITCOPILOT_DIR . 'src/php/Modules/SleepQuality/SleepQualityService.php';
                
                $sleepModule = new \FitCopilot\Modules\SleepQuality\SleepQualityModule();
                $this->registerModule('sleep_quality', $sleepModule);
                error_log('[ModuleManager] SleepQualityModule registered successfully');
            } else {
                error_log('[ModuleManager] SleepQualityModule file not found: ' . $sleepModulePath);
            }
        } catch (\Exception $e) {
            error_log('[ModuleManager] Failed to register SleepQualityModule: ' . $e->getMessage());
        }
        
        // Allow other modules to be registered
        do_action('fitcopilot_register_modules', $this);
        
        error_log('[ModuleManager] Core module registration completed. Total modules: ' . count($this->modules));
    }
    
    /**
     * Boot all registered modules
     */
    private function bootModules(): void {
        foreach ($this->modules as $name => $module) {
            try {
                $module->boot();
                error_log("[ModuleManager] Booted module: {$name}");
            } catch (\Exception $e) {
                error_log("[ModuleManager] Failed to boot module {$name}: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Register routes for all modules
     */
    private function registerModuleRoutes(): void {
        add_action('rest_api_init', function() {
            foreach ($this->modules as $name => $module) {
                try {
                    $module->registerRoutes();
                    error_log("[ModuleManager] Registered routes for module: {$name}");
                } catch (\Exception $e) {
                    error_log("[ModuleManager] Failed to register routes for module {$name}: " . $e->getMessage());
                }
            }
        });
    }
    
    /**
     * Enqueue assets for all modules
     */
    public function enqueueModuleAssets(): void {
        foreach ($this->modules as $name => $module) {
            try {
                $module->registerAssets();
            } catch (\Exception $e) {
                error_log("[ModuleManager] Failed to register assets for module {$name}: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Get all registered modules
     */
    public function getModules(): array {
        return $this->modules;
    }
    
    /**
     * Get all available capabilities
     */
    public function getAllCapabilities(): array {
        $all_capabilities = [];
        foreach ($this->capabilities as $module_caps) {
            $all_capabilities = array_merge($all_capabilities, $module_caps);
        }
        return array_unique($all_capabilities);
    }
    
    /**
     * Event log for communication testing
     */
    private array $eventLog = [];
    
    /**
     * Module communication - publish event
     */
    public function publishEvent(string $event, array $data = []): void {
        do_action("fitcopilot_module_event_{$event}", $data, $this);
        error_log("[ModuleManager] Published event: {$event} with data: " . json_encode($data));
        
        // Store event for debugging (Sprint 2 - Phase 3)
        $this->eventLog[] = [
            'event' => $event,
            'data' => $data,
            'timestamp' => current_time('mysql')
        ];
    }
    
    /**
     * Module communication - subscribe to event
     */
    public function subscribeToEvent(string $event, callable $handler, int $priority = 10): void {
        add_action("fitcopilot_module_event_{$event}", $handler, $priority, 2);
        error_log("[ModuleManager] Subscribed to event: {$event}");
    }
    
    /**
     * Get module status for debugging
     */
    public function getModuleStatus(): array {
        $status = [];
        foreach ($this->modules as $name => $module) {
            $status[$name] = [
                'class' => get_class($module),
                'capabilities' => $this->capabilities[$name] ?? [],
                'loaded' => true
            ];
        }
        return $status;
    }
    
    /**
     * Handle AJAX debug request for module status
     */
    public function handleModuleStatusDebug(): void {
        wp_send_json_success([
            'initialized' => $this->initialized,
            'modules_count' => count($this->modules),
            'modules' => $this->getModuleStatus(),
            'capabilities' => $this->getAllCapabilities(),
            'timestamp' => current_time('mysql')
        ]);
    }
    
    /**
     * Test Profile Module delegation (Sprint 2 - Phase 1)
     */
    public function testProfileDelegation(): void {
        error_log('[ModuleManager] Testing profile delegation...');
        
        $result = $this->delegate('profile_form_rendering', 'renderProfileForm', []);
        
        wp_send_json_success([
            'delegated' => $result !== null,
            'module_found' => $this->hasCapability('profile_form_rendering'),
            'result_type' => gettype($result),
            'capability_tested' => 'profile_form_rendering',
            'method_tested' => 'renderProfileForm'
        ]);
    }
    
    /**
     * Test Muscle Module delegation (Sprint 2 - Phase 1)
     */
    public function testMuscleDelegation(): void {
        error_log('[ModuleManager] Testing muscle delegation...');
        
        $result = $this->delegate('muscle_group_selection', 'renderMuscleForm', []);
        
        wp_send_json_success([
            'delegated' => $result !== null,
            'module_found' => $this->hasCapability('muscle_group_selection'),
            'result_type' => gettype($result),
            'capability_tested' => 'muscle_group_selection',
            'method_tested' => 'renderMuscleForm'
        ]);
    }
    
    /**
     * Simulate profile change event (Sprint 2 - Phase 3)
     */
    public function simulateProfileChange(): void {
        error_log('[ModuleManager] Simulating profile change event...');
        
        $profileData = json_decode(stripslashes($_POST['profile_data'] ?? '{}'), true);
        
        // Publish the profile change event
        $this->publishEvent('profile_changed', $profileData);
        
        wp_send_json_success([
            'event_published' => true,
            'event_name' => 'profile_changed',
            'data_sent' => $profileData,
            'timestamp' => current_time('mysql')
        ]);
    }
    
    /**
     * Get event log for communication testing (Sprint 2 - Phase 3)
     */
    public function getEventLog(): void {
        wp_send_json_success([
            'events' => $this->eventLog,
            'total_events' => count($this->eventLog),
            'timestamp' => current_time('mysql')
        ]);
    }
} 