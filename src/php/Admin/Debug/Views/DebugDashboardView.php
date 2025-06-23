<?php
/**
 * DebugDashboardView - Renders the main debug dashboard
 */

namespace FitCopilot\Admin\Debug\Views;

if (!defined('ABSPATH')) {
    exit;
}

class DebugDashboardView {
    
    public function render(): void {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">
                <span class="dashicons dashicons-search"></span>
                Debug Dashboard
            </h1>
            
            <div class="debug-dashboard-grid">
                <div class="debug-card">
                    <h2><span class="dashicons dashicons-flask"></span> Testing Lab</h2>
                    <p>Test workout generation, prompt building, and system functionality.</p>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-testing-lab'); ?>" class="button button-primary">
                        Open Testing Lab
                    </a>
                </div>
                
                <div class="debug-card">
                    <h2><span class="dashicons dashicons-list-view"></span> System Logs</h2>
                    <p>View and manage system logs and error messages.</p>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-system-logs'); ?>" class="button button-secondary">
                        View System Logs
                    </a>
                </div>
                
                <div class="debug-card">
                    <h2><span class="dashicons dashicons-performance"></span> Performance Monitor</h2>
                    <p>Monitor system performance and response times.</p>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-performance'); ?>" class="button button-secondary">
                        View Performance
                    </a>
                </div>
                
                <div class="debug-card">
                    <h2><span class="dashicons dashicons-analytics"></span> Response Analyzer</h2>
                    <p>Analyze API responses and data structures.</p>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-response-analyzer'); ?>" class="button button-secondary">
                        Open Analyzer
                    </a>
                </div>
            </div>
            
            <div class="system-status">
                <h2>System Status</h2>
                <div class="status-grid">
                    <div class="status-item">
                        <strong>Memory Usage:</strong> <?php echo round(memory_get_usage(true) / 1024 / 1024, 2); ?>MB
                    </div>
                    <div class="status-item">
                        <strong>Peak Memory:</strong> <?php echo round(memory_get_peak_usage(true) / 1024 / 1024, 2); ?>MB
                    </div>
                    <div class="status-item">
                        <strong>WordPress Version:</strong> <?php echo get_bloginfo('version'); ?>
                    </div>
                    <div class="status-item">
                        <strong>PHP Version:</strong> <?php echo PHP_VERSION; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Debug Dashboard styles now in assets/css/prompt-builder/components/debug-dashboard.css -->
        <?php
    }
} 