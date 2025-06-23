<?php
/**
 * SleepQuality View
 * 
 * UI rendering layer for sleep quality functionality.
 * Handles HTML generation for sleep quality selection forms and cards.
 */

namespace FitCopilot\Modules\SleepQuality;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SleepQuality View Class
 * 
 * Handles UI rendering for sleep quality functionality
 */
class SleepQualityView {
    
    /**
     * Sleep quality service instance
     *
     * @var SleepQualityService
     */
    private $service;
    
    /**
     * Constructor
     *
     * @param SleepQualityService $service Service instance
     */
    public function __construct(SleepQualityService $service) {
        $this->service = $service;
    }
    
    /**
     * Render sleep quality selection form for PromptBuilder
     *
     * @param array $data Form data and options
     * @return string Rendered HTML
     */
    public function renderSleepQualitySelection(array $data = []): string {
        $current_quality = $data['current_quality'] ?? null;
        $form_id = $data['form_id'] ?? 'sleep-quality-form';
        
        $levels = $this->service->getSleepQualityLevels();
        
        ob_start();
        ?>
        <div class="form-group sleep-quality-group">
            <label class="form-label">Sleep Quality</label>
            <p class="form-description">How was your sleep last night?</p>
            
            <div class="sleep-quality-options">
                <?php foreach ($levels as $level => $info): ?>
                    <div class="sleep-quality-option">
                        <input type="radio" 
                               id="sleepQuality<?php echo $level; ?>" 
                               name="sleepQuality" 
                               value="<?php echo $level; ?>"
                               <?php checked($current_quality, $level); ?>
                               class="sleep-quality-input">
                        
                        <label for="sleepQuality<?php echo $level; ?>" class="sleep-quality-label">
                            <span class="sleep-icon"><?php echo $info['icon']; ?></span>
                            <span class="sleep-content">
                                <span class="sleep-name"><?php echo esc_html($info['label']); ?></span>
                                <span class="sleep-desc"><?php echo esc_html($info['description']); ?></span>
                            </span>
                            <span class="sleep-level"><?php echo $level; ?>/5</span>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Render sleep quality card for WorkoutGeneratorGrid
     *
     * @param array $data Card data
     * @return string Rendered HTML
     */
    public function renderSleepQualityCard(array $data = []): string {
        $current_quality = $data['current_quality'] ?? null;
        $card_id = $data['card_id'] ?? 'sleep-quality-card';
        
        $levels = $this->service->getSleepQualityLevels();
        
        ob_start();
        ?>
        <div class="modular-card sleep-quality-card" data-card="sleep-quality" id="<?php echo esc_attr($card_id); ?>">
            
            <div class="card-header">
                <div class="card-title">
                    <span class="card-icon">😴</span>
                    <span>Sleep Quality</span>
                </div>
                
                <?php if ($current_quality): ?>
                    <div class="card-badge selected">
                        <?php echo esc_html($levels[$current_quality]['icon'] . ' ' . $levels[$current_quality]['label']); ?>
                    </div>
                <?php else: ?>
                    <div class="card-badge">
                        Select Quality
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="card-content">
                <div class="sleep-options">
                    <?php foreach ($levels as $level => $info): ?>
                        <button type="button" 
                                class="sleep-option <?php echo $current_quality == $level ? 'selected' : ''; ?>"
                                data-level="<?php echo esc_attr($level); ?>"
                                data-label="<?php echo esc_attr($info['label']); ?>"
                                data-adaptation="<?php echo esc_attr($info['adaptation']); ?>">
                            <span class="option-icon"><?php echo $info['icon']; ?></span>
                            <span class="option-content">
                                <span class="option-label"><?php echo esc_html($info['label']); ?></span>
                                <span class="option-level"><?php echo $level; ?>/5</span>
                            </span>
                        </button>
                    <?php endforeach; ?>
                </div>
                
                <div class="card-summary" style="<?php echo $current_quality ? '' : 'display: none;'; ?>">
                    <div class="summary-text">
                        <span class="summary-icon" id="sleep-summary-icon">
                            <?php echo $current_quality ? $levels[$current_quality]['icon'] : ''; ?>
                        </span>
                        <span class="summary-label" id="sleep-summary-label">
                            <?php echo $current_quality ? $levels[$current_quality]['adaptation'] : ''; ?>
                        </span>
                    </div>
                </div>
            </div>
            
            <input type="hidden" name="sleep_quality" id="sleep-quality-input" value="<?php echo esc_attr($current_quality ?? ''); ?>">
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Render sleep quality summary widget
     *
     * @param array $data Widget data
     * @return string Rendered HTML
     */
    public function renderSleepQualitySummary(array $data = []): string {
        $user_id = $data['user_id'] ?? get_current_user_id();
        $days = $data['days'] ?? 7;
        
        $stats = $this->service->getSleepQualityStats($user_id, $days);
        
        if (!$stats['success']) {
            return '<div class="sleep-summary-error">No sleep quality data available</div>';
        }
        
        $stats_data = $stats['data'];
        
        ob_start();
        ?>
        <div class="sleep-quality-summary">
            <div class="summary-header">
                <h4>Sleep Quality Summary (<?php echo $days; ?> days)</h4>
            </div>
            
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-value"><?php echo esc_html($stats_data['average_sleep_quality']); ?>/5</div>
                    <div class="stat-label">Average Quality</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value"><?php echo esc_html($stats_data['total_entries']); ?></div>
                    <div class="stat-label">Days Tracked</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value"><?php echo esc_html(ucfirst($stats_data['trend'])); ?></div>
                    <div class="stat-label">Trend</div>
                </div>
            </div>
            
            <?php if (!empty($stats_data['recommendations'])): ?>
                <div class="summary-recommendations">
                    <h5>Recommendations</h5>
                    <ul>
                        <?php foreach ($stats_data['recommendations'] as $recommendation): ?>
                            <li><?php echo esc_html($recommendation); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Sleep Quality styles now in assets/css/prompt-builder/components/sleep-quality.css -->
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Get sleep quality card JavaScript
     *
     * @return string JavaScript code
     */
    public function getSleepQualityCardScript(): string {
        return "
        document.addEventListener('DOMContentLoaded', function() {
            const sleepCards = document.querySelectorAll('.sleep-quality-card');
            
            sleepCards.forEach(function(card) {
                const options = card.querySelectorAll('.sleep-option');
                const hiddenInput = card.querySelector('input[name=\"sleep_quality\"]');
                const summaryIcon = card.querySelector('#sleep-summary-icon');
                const summaryLabel = card.querySelector('#sleep-summary-label');
                const cardSummary = card.querySelector('.card-summary');
                
                options.forEach(function(option) {
                    option.addEventListener('click', function() {
                        // Remove selected class from all options
                        options.forEach(opt => opt.classList.remove('selected'));
                        
                        // Add selected class to clicked option
                        this.classList.add('selected');
                        
                        // Update hidden input
                        const level = this.dataset.level;
                        hiddenInput.value = level;
                        
                        // Update card appearance
                        card.classList.add('has-selection');
                        
                        // Update summary
                        if (summaryIcon && summaryLabel && cardSummary) {
                            const icon = this.querySelector('.option-icon').textContent;
                            const adaptation = this.dataset.adaptation || 'Selection recorded';
                            
                            summaryIcon.textContent = icon;
                            summaryLabel.textContent = adaptation;
                            cardSummary.style.display = 'block';
                        }
                        
                        // Trigger custom event
                        card.dispatchEvent(new CustomEvent('sleepQualityChanged', {
                            detail: {
                                level: parseInt(level),
                                label: this.dataset.label,
                                description: this.dataset.description
                            }
                        }));
                    });
                });
            });
        });
        ";
    }
} 