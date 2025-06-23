<?php
/**
 * SleepQuality Module
 * 
 * Manages sleep quality selection, data persistence, and UI rendering
 * for the WorkoutGeneratorGrid system.
 * 
 * Part of the modular architecture - handles all sleep quality related functionality
 * including user selection, data validation, storage, and form rendering.
 */

namespace FitCopilot\Modules\SleepQuality;

use FitCopilot\Modules\Core\ModuleInterface;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SleepQuality Module Class
 * 
 * Main module class that orchestrates sleep quality functionality
 */
class SleepQualityModule implements ModuleInterface {
    
    /**
     * Module name
     */
    const MODULE_NAME = 'sleep_quality';
    
    /**
     * Module version
     */
    const MODULE_VERSION = '1.0.0';
    
    /**
     * Sleep quality service instance
     *
     * @var SleepQualityService
     */
    private $service;
    
    /**
     * Sleep quality repository instance
     *
     * @var SleepQualityRepository
     */
    private $repository;
    
    /**
     * Sleep quality validator instance
     *
     * @var SleepQualityValidator
     */
    private $validator;
    
    /**
     * Sleep quality view instance
     *
     * @var SleepQualityView
     */
    private $view;
    
    /**
     * Module capabilities
     *
     * @var array
     */
    private $capabilities = [
        'sleep_quality_selection',
        'sleep_quality_persistence',
        'sleep_quality_validation',
        'sleep_quality_form_rendering',
        'workout_adaptation_context'
    ];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->repository = new SleepQualityRepository();
        $this->validator = new SleepQualityValidator();
        $this->service = new SleepQualityService($this->repository, $this->validator);
        $this->view = new SleepQualityView($this->service);
    }
    
    /**
     * Boot the module
     *
     * @return void
     */
    public function boot(): void {
        // Register WordPress hooks
        add_action('wp_ajax_fitcopilot_save_sleep_quality', [$this, 'handleSaveSleepQuality']);
        add_action('wp_ajax_fitcopilot_get_sleep_quality', [$this, 'handleGetSleepQuality']);
        add_action('wp_ajax_fitcopilot_get_sleep_recommendations', [$this, 'handleGetSleepRecommendations']);
        
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'registerRestEndpoints']);
        
        // Register assets
        add_action('wp_enqueue_scripts', [$this, 'registerAssets']);
        add_action('admin_enqueue_scripts', [$this, 'registerAssets']);
        
        error_log('[SleepQualityModule] Module booted successfully');
    }
    
    /**
     * Register module routes (required by ModuleInterface)
     *
     * @return void
     */
    public function registerRoutes(): void {
        $this->registerRestEndpoints();
    }
    
    /**
     * Register REST API endpoints
     *
     * @return void
     */
    public function registerRestEndpoints(): void {
        // Sleep quality selection endpoint
        register_rest_route('fitcopilot/v1', '/sleep-quality', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'saveSleepQuality'],
                'permission_callback' => function() {
                    return is_user_logged_in();
                }
            ],
            [
                'methods' => 'GET',
                'callback' => [$this, 'getSleepQuality'],
                'permission_callback' => function() {
                    return is_user_logged_in();
                }
            ]
        ]);
        
        // Sleep recommendations endpoint
        register_rest_route('fitcopilot/v1', '/sleep-recommendations', [
            'methods' => 'GET',
            'callback' => [$this, 'getSleepRecommendations'],
            'permission_callback' => function() {
                return is_user_logged_in();
            }
        ]);
    }
    
    /**
     * Register module assets
     *
     * @return void
     */
    public function registerAssets(): void {
        // Only register if we're on a page that needs sleep quality functionality
        if (!$this->shouldLoadAssets()) {
            return;
        }
        
        wp_enqueue_script(
            'fitcopilot-sleep-quality',
            plugins_url('assets/js/sleep-quality.js', __FILE__),
            ['jquery'],
            self::MODULE_VERSION,
            true
        );
        
        wp_enqueue_style(
            'fitcopilot-sleep-quality',
            plugins_url('assets/css/sleep-quality.css', __FILE__),
            [],
            self::MODULE_VERSION
        );
        
        // Localize script with AJAX data
        wp_localize_script('fitcopilot-sleep-quality', 'fitcopilotSleepQuality', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'rest_url' => rest_url('fitcopilot/v1/'),
            'nonce' => wp_create_nonce('fitcopilot_sleep_quality'),
            'levels' => $this->service->getSleepQualityLevels()
        ]);
    }
    
    /**
     * Check if assets should be loaded
     *
     * @return bool
     */
    private function shouldLoadAssets(): bool {
        global $pagenow, $post;
        
        // Load on admin pages - but exclude PromptBuilder page since it uses fallback HTML
        if (is_admin()) {
            // Don't load assets on PromptBuilder page (it has fallback HTML)
            if ($pagenow === 'admin.php' && 
                isset($_GET['page']) && 
                $_GET['page'] === 'fitcopilot-prompt-builder') {
                return false;
            }
            
            return in_array($pagenow, ['admin.php']) && 
                   isset($_GET['page']) && 
                   strpos($_GET['page'], 'fitcopilot') !== false;
        }
        
        // Load on frontend pages with workout generator
        return has_shortcode($post->post_content ?? '', 'workout_generator') ||
               has_shortcode($post->post_content ?? '', 'fitcopilot_dashboard');
    }
    
    /**
     * Get module capabilities
     *
     * @return array
     */
    public function getCapabilities(): array {
        return $this->capabilities;
    }
    
    /**
     * Check if module has specific capability
     *
     * @param string $capability Capability to check
     * @return bool
     */
    public function hasCapability(string $capability): bool {
        return in_array($capability, $this->capabilities);
    }
    
    /**
     * Render sleep quality selection form
     *
     * @param array $data Form data and options
     * @return string Rendered HTML
     */
    public function renderSleepQualityForm(array $data = []): string {
        return $this->view->renderSleepQualitySelection($data);
    }
    
    /**
     * Render sleep quality card for WorkoutGeneratorGrid
     *
     * @param array $data Card data
     * @return string Rendered HTML
     */
    public function renderSleepQualityCard(array $data = []): string {
        return $this->view->renderSleepQualityCard($data);
    }
    
    /**
     * Handle AJAX sleep quality save
     *
     * @return void
     */
    public function handleSaveSleepQuality(): void {
        check_ajax_referer('fitcopilot_sleep_quality');
        
        $sleep_quality = intval($_POST['sleep_quality'] ?? 0);
        $context = wp_unslash($_POST['context'] ?? []);
        
        $result = $this->service->saveSleepQuality(get_current_user_id(), $sleep_quality, $context);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Handle AJAX sleep quality get
     *
     * @return void
     */
    public function handleGetSleepQuality(): void {
        check_ajax_referer('fitcopilot_sleep_quality');
        
        $result = $this->service->getSleepQuality(get_current_user_id());
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * Handle AJAX sleep recommendations
     *
     * @return void
     */
    public function handleGetSleepRecommendations(): void {
        check_ajax_referer('fitcopilot_sleep_quality');
        
        $user_profile = wp_unslash($_POST['user_profile'] ?? []);
        
        $result = $this->service->getSleepRecommendations($user_profile);
        
        wp_send_json_success($result);
    }
    
    /**
     * REST API: Save sleep quality
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public function saveSleepQuality(\WP_REST_Request $request): \WP_REST_Response {
        $sleep_quality = intval($request->get_param('sleep_quality'));
        $context = $request->get_param('context') ?? [];
        
        $result = $this->service->saveSleepQuality(get_current_user_id(), $sleep_quality, $context);
        
        return new \WP_REST_Response($result, $result['success'] ? 200 : 400);
    }
    
    /**
     * REST API: Get sleep quality
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public function getSleepQuality(\WP_REST_Request $request): \WP_REST_Response {
        $result = $this->service->getSleepQuality(get_current_user_id());
        
        return new \WP_REST_Response($result, $result['success'] ? 200 : 404);
    }
    
    /**
     * REST API: Get sleep recommendations
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public function getSleepRecommendations(\WP_REST_Request $request): \WP_REST_Response {
        $user_profile = $request->get_param('user_profile') ?? [];
        
        $result = $this->service->getSleepRecommendations($user_profile);
        
        return new \WP_REST_Response($result, 200);
    }
    
    /**
     * Get the service instance
     *
     * @return SleepQualityService
     */
    public function getService(): SleepQualityService {
        return $this->service;
    }
    
    /**
     * Get the view instance
     *
     * @return SleepQualityView
     */
    public function getView(): SleepQualityView {
        return $this->view;
    }
    
    /**
     * Get module information
     *
     * @return array Module info
     */
    public function getModuleInfo(): array {
        return [
            'name' => self::MODULE_NAME,
            'version' => self::MODULE_VERSION,
            'capabilities' => $this->capabilities,
            'description' => 'Sleep Quality Management Module for WorkoutGeneratorGrid',
            'dependencies' => ['Core'],
            'status' => 'active'
        ];
    }
} 