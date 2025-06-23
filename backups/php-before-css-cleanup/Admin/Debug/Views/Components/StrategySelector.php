<?php

namespace FitCopilot\Admin\Debug\Views\Components;

/**
 * StrategySelector Component
 * 
 * Extracted from monolithic PromptBuilderView.php for better maintainability
 * Handles the strategy selection interface rendering
 */
class StrategySelector {
    
    private array $strategies;
    private string $currentStrategy;
    
    public function __construct(array $strategies = [], string $currentStrategy = 'SingleWorkoutStrategy') {
        $this->strategies = $strategies;
        $this->currentStrategy = $currentStrategy;
    }
    
    /**
     * Render the strategy selection section
     */
    public function render(): string {
        ob_start();
        ?>
        <!-- Strategy Selection Component -->
        <div class="builder-section">
            <h3>🎯 Strategy Selection</h3>
            <div class="strategy-controls">
                <select id="strategy-selector" class="strategy-select">
                    <?php foreach ($this->strategies as $key => $strategy): ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $this->currentStrategy); ?>>
                            <?php echo esc_html($strategy['name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <button id="view-strategy-code" class="button button-secondary">
                    📋 View Code
                </button>
            </div>
            <div class="strategy-description">
                <?php 
                $currentStrategyData = $this->strategies[$this->currentStrategy] ?? [];
                echo esc_html($currentStrategyData['description'] ?? 'No description available');
                ?>
            </div>
            
            <!-- Strategy Code Viewer -->
            <div id="strategy-code-display" class="strategy-code-section" style="display: none;">
                <div class="section-header-controls">
                    <h4>📋 Strategy Code Inspector</h4>
                    <div class="code-controls">
                        <button id="copy-strategy-code" class="button button-secondary">
                            📋 Copy Code
                        </button>
                        <button id="toggle-line-numbers" class="button button-secondary">
                            🔢 Toggle Lines
                        </button>
                    </div>
                </div>
                <div id="strategy-code-viewer" class="strategy-code-viewer">
                    <div class="code-placeholder">
                        <p>🔍 Select a strategy and click "View Code" to inspect the implementation</p>
                        <p>This shows the actual PHP code used to generate prompts for the selected strategy.</p>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get the strategies data
     */
    public function getStrategies(): array {
        return $this->strategies;
    }
    
    /**
     * Get the current strategy
     */
    public function getCurrentStrategy(): string {
        return $this->currentStrategy;
    }
    
    /**
     * Set strategies data
     */
    public function setStrategies(array $strategies): self {
        $this->strategies = $strategies;
        return $this;
    }
    
    /**
     * Set current strategy
     */
    public function setCurrentStrategy(string $strategy): self {
        $this->currentStrategy = $strategy;
        return $this;
    }
    
    /**
     * Get strategy options for JavaScript
     */
    public function getStrategyOptionsJson(): string {
        $options = [];
        foreach ($this->strategies as $key => $strategy) {
            $options[] = [
                'value' => $key,
                'name' => $strategy['name'],
                'description' => $strategy['description'] ?? ''
            ];
        }
        return json_encode($options);
    }
} 