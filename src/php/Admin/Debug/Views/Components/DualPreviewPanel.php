<?php

namespace FitCopilot\Admin\Debug\Views\Components;

/**
 * DualPreviewPanel Component
 * 
 * Extracted from monolithic PromptBuilderView.php for better maintainability
 * Handles the dual preview system for prompt and workout testing
 */
class DualPreviewPanel {
    
    private array $config;
    
    public function __construct(array $config = []) {
        $this->config = array_merge([
            'show_analytics' => true,
            'show_performance_metrics' => true,
            'enable_export' => true
        ], $config);
    }
    
    /**
     * Render the complete dual preview panel system
     */
    public function render(): string {
        ob_start();
        ?>
        <!-- Dual Preview System Component -->
        <div class="prompt-builder-right">
            
            <!-- Live Prompt Preview -->
            <div class="builder-section">
                <div class="section-header-controls">
                    <h3>🔬 Live Prompt Preview</h3>
                    <div class="prompt-controls">
                        <button id="generate-prompt" class="button button-primary">
                            ✨ Generate Live Prompt
                        </button>
                        <?php if ($this->config['enable_export']): ?>
                        <button id="export-prompt" class="button button-secondary" style="display: none;">
                            📤 Export
                        </button>
                        <button id="copy-prompt" class="button button-secondary" style="display: none;">
                            📋 Copy
                        </button>
                        <button id="clear-prompt" class="button button-secondary" style="display: none;">
                            🗑️ Clear
                        </button>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div id="prompt-preview" class="prompt-preview">
                    <div class="prompt-placeholder">
                        <p>🎯 Ready to generate live prompts</p>
                        <p>Fill in the profile data and click "Generate Live Prompt" to see the AI prompt in real-time.</p>
                    </div>
                </div>
                
                <?php if ($this->config['show_performance_metrics']): ?>
                <!-- Prompt Statistics -->
                <div id="prompt-stats" class="prompt-stats" style="display: none;">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value" id="prompt-characters">0</span>
                            <span class="stat-label">Characters</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="prompt-words">0</span>
                            <span class="stat-label">Words</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="prompt-tokens">0</span>
                            <span class="stat-label">Est. Tokens</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="prompt-lines">0</span>
                            <span class="stat-label">Lines</span>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            
            <!-- Context Inspector -->
            <div class="builder-section">
                <div class="section-header-controls">
                    <h3>🔍 Context Inspector</h3>
                    <div class="context-controls">
                        <button id="inspect-context" class="button button-primary">
                            🔍 View Context Data
                        </button>
                        <input type="text" id="context-search" placeholder="Search context..." class="context-search" style="display: none;">
                        <button id="toggle-compact-view" class="button button-secondary" style="display: none;">
                            📦 Compact
                        </button>
                        <button id="expand-all-context" class="button button-secondary" style="display: none;">
                            📂 Expand All
                        </button>
                    </div>
                </div>
                
                <div id="context-inspector" class="context-inspector">
                    <div class="context-placeholder">
                        <p>🔍 Ready to inspect context data</p>
                        <p>Click "View Context Data" to see how your profile data is processed and mapped for AI consumption.</p>
                    </div>
                </div>
            </div>
            
            <!-- Test Workout Generation -->
            <div class="builder-section">
                <div class="section-header-controls">
                    <h3>🧪 Test Workout Generation</h3>
                    <div class="workout-controls">
                        <button id="test-workout" class="button button-primary">
                            🧪 Test Workout Generation
                        </button>
                        <?php if ($this->config['enable_export']): ?>
                        <button id="export-workout" class="button button-secondary" style="display: none;">
                            📤 Export
                        </button>
                        <button id="save-workout" class="button button-secondary" style="display: none;">
                            💾 Save
                        </button>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div id="workout-test-preview" class="workout-test-preview">
                    <div class="workout-placeholder">
                        <p>🧪 Ready to test workout generation</p>
                        <p>Fill in the profile data and click "Test Workout Generation" to see the complete AI workflow in action.</p>
                    </div>
                </div>
                
                <?php if ($this->config['show_performance_metrics']): ?>
                <!-- Workout Performance Metrics -->
                <div id="workout-performance" class="workout-performance" style="display: none;">
                    <div class="performance-grid">
                        <div class="perf-item">
                            <span class="perf-label">Generation Time:</span>
                            <span class="perf-value" id="workout-time">0ms</span>
                        </div>
                        <div class="perf-item">
                            <span class="perf-label">Match Score:</span>
                            <span class="perf-value" id="workout-match">0%</span>
                        </div>
                        <div class="perf-item">
                            <span class="perf-label">Est. Cost:</span>
                            <span class="perf-value" id="workout-cost">$0.0000</span>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            
            <?php if ($this->config['show_analytics']): ?>
            <!-- Analytics Dashboard -->
            <div class="builder-section">
                <div class="section-header-controls">
                    <h3>📊 Analytics Dashboard</h3>
                    <div class="analytics-controls">
                        <button id="refresh-analytics" class="button button-secondary">
                            🔄 Refresh
                        </button>
                        <button id="toggle-auto-refresh" class="button button-secondary">
                            ⏱️ Auto-Refresh: <span id="auto-refresh-status">Off</span>
                        </button>
                    </div>
                </div>
                
                <div id="analytics-dashboard" class="analytics-dashboard-embed">
                    <!-- Analytics content will be loaded here -->
                    <div class="analytics-placeholder">
                        <p>📊 Analytics dashboard will load here</p>
                        <p>Performance metrics, quality analysis, and trends will appear once you start generating prompts.</p>
                    </div>
                </div>
            </div>
            <?php endif; ?>
            
        </div>
        
        <!-- Action Buttons -->
        <div class="main-actions">
            <button id="reset-form-btn" class="button button-secondary">
                🔄 Reset Form
            </button>
            <button id="save-template-btn" class="button button-secondary">
                💾 Save as Template
            </button>
        </div>
        
        <?php echo $this->renderSaveTemplateModal(); ?>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render the save template modal
     */
    private function renderSaveTemplateModal(): string {
        ob_start();
        ?>
        <!-- Save Template Modal -->
        <div id="save-template-modal" class="prompt-builder-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💾 Save Prompt Template</h3>
                    <button id="close-save-modal" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="save-template-form">
                        <div class="form-group">
                            <label for="template_name">Template Name *</label>
                            <input type="text" id="template_name" name="template_name" required class="form-input"
                                   placeholder="e.g., Advanced Strength Training">
                        </div>
                        <div class="form-group">
                            <label for="template_description">Description</label>
                            <textarea id="template_description" name="template_description" class="form-textarea" rows="3"
                                      placeholder="Brief description of this template..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="template_tags">Tags (comma-separated)</label>
                            <input type="text" id="template_tags" name="template_tags" class="form-input"
                                   placeholder="strength, advanced, muscle-building">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="cancel-save-template" class="button button-secondary">Cancel</button>
                    <button id="confirm-save-template" class="button button-primary">Save Template</button>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render prompt preview only
     */
    public function renderPromptPreview(): string {
        ob_start();
        ?>
        <div class="builder-section">
            <div class="section-header-controls">
                <h3>🔬 Live Prompt Preview</h3>
                <div class="prompt-controls">
                    <button id="generate-prompt" class="button button-primary">
                        ✨ Generate Live Prompt
                    </button>
                </div>
            </div>
            
            <div id="prompt-preview" class="prompt-preview">
                <div class="prompt-placeholder">
                    <p>🎯 Ready to generate live prompts</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render context inspector only
     */
    public function renderContextInspector(): string {
        ob_start();
        ?>
        <div class="builder-section">
            <div class="section-header-controls">
                <h3>🔍 Context Inspector</h3>
                <div class="context-controls">
                    <button id="inspect-context" class="button button-primary">
                        🔍 View Context Data
                    </button>
                </div>
            </div>
            
            <div id="context-inspector" class="context-inspector">
                <div class="context-placeholder">
                    <p>🔍 Ready to inspect context data</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render workout tester only
     */
    public function renderWorkoutTester(): string {
        ob_start();
        ?>
        <div class="builder-section">
            <div class="section-header-controls">
                <h3>🧪 Test Workout Generation</h3>
                <div class="workout-controls">
                    <button id="test-workout" class="button button-primary">
                        🧪 Test Workout Generation
                    </button>
                </div>
            </div>
            
            <div id="workout-test-preview" class="workout-test-preview">
                <div class="workout-placeholder">
                    <p>🧪 Ready to test workout generation</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Set configuration
     */
    public function setConfig(array $config): self {
        $this->config = array_merge($this->config, $config);
        return $this;
    }
    
    /**
     * Get configuration
     */
    public function getConfig(): array {
        return $this->config;
    }
    
    /**
     * Enable/disable analytics
     */
    public function setAnalyticsEnabled(bool $enabled): self {
        $this->config['show_analytics'] = $enabled;
        return $this;
    }
    
    /**
     * Enable/disable performance metrics
     */
    public function setPerformanceMetricsEnabled(bool $enabled): self {
        $this->config['show_performance_metrics'] = $enabled;
        return $this;
    }
    
    /**
     * Enable/disable export functionality
     */
    public function setExportEnabled(bool $enabled): self {
        $this->config['enable_export'] = $enabled;
        return $this;
    }
} 