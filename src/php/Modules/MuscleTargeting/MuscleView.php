<?php

namespace FitCopilot\Modules\MuscleTargeting;

/**
 * Muscle View
 * 
 * Handles rendering of muscle targeting UI components
 * extracted from the monolithic PromptBuilderView
 */
class MuscleView {
    
    /**
     * Render complete muscle targeting form section
     */
    public function renderMuscleTargetingForm(array $data = []): string {
        ob_start();
        ?>
        <div class="muscle-module-container">
            <div class="form-group muscle-targeting">
                <h4>🎯 Target Muscles</h4>
                <div class="muscle-selection-container">
                    <?php echo $this->renderMuscleGroupsSection(); ?>
                    <?php echo $this->renderMuscleActionsSection(); ?>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render muscle groups grid section
     */
    private function renderMuscleGroupsSection(): string {
        $muscle_groups = $this->getMuscleGroupsData();
        
        ob_start();
        ?>
        <div class="muscle-groups-section">
            <label class="muscle-section-label">Primary Muscle Groups (select up to 3):</label>
            <div class="muscle-groups-grid">
                <?php foreach ($muscle_groups as $group_id => $group_data): ?>
                    <div class="muscle-group-item">
                        <label class="muscle-group-label">
                            <input type="checkbox" name="targetMuscleGroups[]" value="<?php echo esc_attr($group_id); ?>" onchange="toggleMuscleGroup('<?php echo esc_js($group_id); ?>')">
                            <span class="muscle-icon"><?php echo esc_html($group_data['icon']); ?></span> <?php echo esc_html($group_data['display']); ?>
                            <span class="expand-indicator">▼</span>
                        </label>
                        <div class="muscle-detail-grid" id="muscle-detail-<?php echo esc_attr($group_id); ?>" style="display: none;">
                            <div class="muscle-options-grid">
                                <?php foreach ($group_data['muscles'] as $muscle): ?>
                                    <label>
                                        <input type="checkbox" name="specificMuscles[<?php echo esc_attr($group_id); ?>][]" value="<?php echo esc_attr($muscle); ?>">
                                        <?php echo esc_html($muscle); ?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render muscle actions section
     */
    private function renderMuscleActionsSection(): string {
        return '
        <div class="muscle-actions-section">
            <div class="muscle-actions">
                <button type="button" id="load-muscle-suggestions" class="button button-secondary">💡 Get Suggestions</button>
                <button type="button" id="load-saved-muscles" class="button button-secondary">📥 Load Saved</button>
                <button type="button" id="clear-muscle-selection" class="button button-secondary">🧹 Clear All</button>
            </div>
            <div class="muscle-selection-summary" id="muscle-selection-summary">
                <span class="empty">No muscle groups selected</span>
            </div>
        </div>';
    }
    
    /**
     * Get muscle groups data structure
     */
    private function getMuscleGroupsData(): array {
        return [
            'back' => [
                'display' => 'Back',
                'icon' => '🏋️',
                'muscles' => ['Lats', 'Rhomboids', 'Middle Traps', 'Lower Traps', 'Rear Delts']
            ],
            'chest' => [
                'display' => 'Chest',
                'icon' => '💪',
                'muscles' => ['Upper Chest', 'Middle Chest', 'Lower Chest']
            ],
            'arms' => [
                'display' => 'Arms',
                'icon' => '💪',
                'muscles' => ['Biceps', 'Triceps', 'Forearms']
            ],
            'shoulders' => [
                'display' => 'Shoulders',
                'icon' => '🤸',
                'muscles' => ['Front Delts', 'Side Delts', 'Rear Delts']
            ],
            'core' => [
                'display' => 'Core',
                'icon' => '🧘',
                'muscles' => ['Upper Abs', 'Lower Abs', 'Obliques', 'Transverse Abdominis']
            ],
            'legs' => [
                'display' => 'Legs',
                'icon' => '🦵',
                'muscles' => ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
            ]
        ];
    }
    
    /**
     * Render muscle selection summary
     */
    public function renderMuscleSelectionSummary(array $selection): string {
        if (empty($selection['selectedGroups'])) {
            return '<span class="empty">No muscle groups selected</span>';
        }
        
        $group_count = count($selection['selectedGroups']);
        $muscle_count = 0;
        
        if (is_array($selection['selectedMuscles'])) {
            $muscle_count = array_sum(array_map('count', $selection['selectedMuscles']));
        }
        
        $summary = "{$group_count} muscle group" . ($group_count > 1 ? 's' : '') . " selected: ";
        
        $group_summaries = [];
        foreach ($selection['selectedGroups'] as $group) {
            $specific_count = isset($selection['selectedMuscles'][$group]) ? count($selection['selectedMuscles'][$group]) : 0;
            $group_summaries[] = ucfirst($group) . ($specific_count > 0 ? "⚡{$specific_count}" : '');
        }
        
        $summary .= implode(', ', $group_summaries);
        
        if ($muscle_count > 0) {
            $summary .= " ({$muscle_count} specific muscles)";
        }
        
        return $summary;
    }
    
    /**
     * Render muscle suggestions modal
     */
    public function renderMuscleSuggestionsModal(): string {
        return '
        <div id="muscle-suggestions-modal" class="muscle-modal" style="display: none;">
            <div class="muscle-modal-content">
                <div class="muscle-modal-header">
                    <h3>💡 Muscle Suggestions</h3>
                    <button type="button" class="muscle-modal-close">&times;</button>
                </div>
                <div class="muscle-modal-body">
                    <div id="muscle-suggestions-content">
                        <div class="loading-spinner">🔄 Generating suggestions...</div>
                    </div>
                </div>
                <div class="muscle-modal-footer">
                    <button type="button" id="apply-muscle-suggestions" class="button button-primary">✅ Apply Suggestions</button>
                    <button type="button" class="muscle-modal-close button">❌ Cancel</button>
                </div>
            </div>
        </div>';
    }
    
    /**
     * Get muscle targeting CSS for styling
     */
    public function getMuscleTargetingCSS(): string {
        return '
        .muscle-selection-container {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
        }
        
        .muscle-groups-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .muscle-group-item {
            background: white;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            padding: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .muscle-group-item:hover {
            border-color: #0073aa;
            box-shadow: 0 2px 8px rgba(0,115,170,0.1);
        }
        
        .muscle-group-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            cursor: pointer;
            margin: 0;
            font-size: 16px;
        }
        
        .muscle-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }
        
        .muscle-selection-summary {
            background: #f0f8ff;
            border: 1px solid #b3d9ff;
            border-radius: 6px;
            padding: 12px;
            font-size: 14px;
            color: #333;
        }';
    }
    
    /**
     * Get muscle targeting JavaScript
     */
    public function getMuscleTargetingJS(): string {
        return '
        let selectedMuscles = {};
        
        function toggleMuscleGroup(group) {
            const checkbox = document.querySelector(`input[name="targetMuscleGroups[]"][value="${group}"]`);
            const detailGrid = document.getElementById(`muscle-detail-${group}`);
            const groupItem = checkbox.closest(\'.muscle-group-item\');
            
            if (checkbox.checked) {
                detailGrid.style.display = \'block\';
                groupItem.classList.add(\'expanded\');
                if (!selectedMuscles[group]) {
                    selectedMuscles[group] = [];
                }
            } else {
                detailGrid.style.display = \'none\';
                groupItem.classList.remove(\'expanded\');
                document.querySelectorAll(`input[name="specificMuscles[${group}][]"]`).forEach(input => {
                    input.checked = false;
                });
                delete selectedMuscles[group];
            }
            
            updateMuscleSelectionSummary();
        }
        
        function updateMuscleSelectionSummary() {
            const summaryEl = document.getElementById(\'muscle-selection-summary\');
            const selectedGroups = document.querySelectorAll(\'input[name="targetMuscleGroups[]"]:checked\');
            
            if (selectedGroups.length === 0) {
                summaryEl.innerHTML = \'<span class="empty">No muscle groups selected</span>\';
                return;
            }
            
            let summaryText = `${selectedGroups.length} muscle group${selectedGroups.length > 1 ? \'s\' : \'\'} selected`;
            summaryEl.innerHTML = summaryText;
        }';
    }
} 