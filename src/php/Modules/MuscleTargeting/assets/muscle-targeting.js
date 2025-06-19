/**
 * Muscle Targeting Module JavaScript
 * 
 * Provides all the JavaScript functionality for nested muscle group selection
 * including toggle functions, summary updates, and API integration.
 */

(function($) {
    'use strict';
    
    // Global muscle selection state
    let selectedMuscles = {};
    
    /**
     * Initialize muscle targeting functionality
     */
    function initMuscleTargeting() {
        console.log('[MuscleTargeting] Initializing muscle targeting module...');
        
        // Bind event listeners
        bindMuscleEventListeners();
        
        // Initialize summary
        updateMuscleSelectionSummary();
        
        console.log('[MuscleTargeting] Module initialized successfully');
    }
    
    /**
     * Bind all muscle targeting event listeners
     */
    function bindMuscleEventListeners() {
        // Bind action buttons
        $(document).on('click', '#load-muscle-suggestions', loadMuscleSuggestions);
        $(document).on('click', '#load-saved-muscles', loadMuscleSelections);
        $(document).on('click', '#clear-muscle-selection', clearMuscleSelection);
        
        // Bind specific muscle checkboxes to update summary
        $(document).on('change', 'input[name^="specificMuscles"]', function() {
            updateMuscleSelectionSummary();
        });
        
        console.log('[MuscleTargeting] Event listeners bound successfully');
    }
    
    /**
     * Toggle muscle group display and functionality
     */
    window.toggleMuscleGroup = function(group) {
        const checkbox = document.querySelector(`input[name="targetMuscleGroups[]"][value="${group}"]`);
        const detailGrid = document.getElementById(`muscle-detail-${group}`);
        const groupItem = checkbox.closest('.muscle-group-item');
        
        if (!checkbox || !detailGrid || !groupItem) {
            console.error('[MuscleTargeting] Missing elements for group:', group);
            return;
        }
        
        if (checkbox.checked) {
            detailGrid.style.display = 'block';
            groupItem.classList.add('expanded');
            if (!selectedMuscles[group]) {
                selectedMuscles[group] = [];
            }
        } else {
            detailGrid.style.display = 'none';
            groupItem.classList.remove('expanded');
            document.querySelectorAll(`input[name="specificMuscles[${group}][]"]`).forEach(input => {
                input.checked = false;
            });
            delete selectedMuscles[group];
        }
        
        updateMuscleSelectionSummary();
    };
    
    /**
     * Update the muscle selection summary display
     */
    window.updateMuscleSelectionSummary = function() {
        const summaryEl = document.getElementById('muscle-selection-summary');
        if (!summaryEl) return;
        
        const selectedGroups = document.querySelectorAll('input[name="targetMuscleGroups[]"]:checked');
        
        if (selectedGroups.length === 0) {
            summaryEl.innerHTML = '<span class="empty">No muscle groups selected</span>';
            summaryEl.className = 'muscle-selection-summary empty';
            return;
        }
        
        let totalMuscles = 0;
        let groupSummaries = [];
        
        selectedGroups.forEach(groupCheckbox => {
            const group = groupCheckbox.value;
            const specificMuscles = document.querySelectorAll(`input[name="specificMuscles[${group}][]"]:checked`);
            const muscleCount = specificMuscles.length;
            totalMuscles += muscleCount;
            
            const groupName = group.charAt(0).toUpperCase() + group.slice(1);
            groupSummaries.push(muscleCount > 0 ? `${groupName}⚡${muscleCount}` : groupName);
        });
        
        let summaryText = `${selectedGroups.length} muscle group${selectedGroups.length > 1 ? 's' : ''} selected: ${groupSummaries.join(', ')}`;
        
        if (totalMuscles > 0) {
            summaryText += ` (${totalMuscles} specific muscles)`;
        }
        
        summaryEl.innerHTML = summaryText;
        summaryEl.className = 'muscle-selection-summary';
    };
    
    /**
     * Clear all muscle selections
     */
    window.clearMuscleSelection = function() {
        document.querySelectorAll('input[name="targetMuscleGroups[]"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('input[name^="specificMuscles"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.muscle-detail-grid').forEach(grid => {
            grid.style.display = 'none';
        });
        
        document.querySelectorAll('.muscle-group-item').forEach(item => {
            item.classList.remove('expanded');
        });
        
        selectedMuscles = {};
        updateMuscleSelectionSummary();
        
        console.log('[MuscleTargeting] All muscle selections cleared');
    };
    
    /**
     * Populate nested muscle fields with data
     */
    window.populateNestedMuscleFields = function(muscleData) {
        if (!muscleData) return;
        
        console.log('[MuscleTargeting] Populating nested muscle fields:', muscleData);
        
        // Clear existing selections first
        clearMuscleSelection();
        
        // Populate muscle groups
        if (muscleData.selectedGroups && Array.isArray(muscleData.selectedGroups)) {
            muscleData.selectedGroups.forEach(group => {
                const checkbox = document.querySelector(`input[name="targetMuscleGroups[]"][value="${group}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    // Trigger the toggle to show detail grid
                    toggleMuscleGroup(group);
                }
            });
        }
        
        // Populate specific muscles
        if (muscleData.selectedMuscles && typeof muscleData.selectedMuscles === 'object') {
            Object.entries(muscleData.selectedMuscles).forEach(([group, muscles]) => {
                if (Array.isArray(muscles)) {
                    muscles.forEach(muscle => {
                        const checkbox = document.querySelector(`input[name="specificMuscles[${group}][]"][value="${muscle}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
            });
        }
        
        // Update summary
        updateMuscleSelectionSummary();
    };
    
    /**
     * Collect nested muscle selection data
     */
    window.collectNestedMuscleSelectionData = function() {
        const selectedGroups = [];
        const selectedMuscles = {};
        
        // Collect selected groups
        document.querySelectorAll('input[name="targetMuscleGroups[]"]:checked').forEach(checkbox => {
            const group = checkbox.value;
            selectedGroups.push(group);
            
            // Collect specific muscles for this group
            const groupMuscles = [];
            document.querySelectorAll(`input[name="specificMuscles[${group}][]"]:checked`).forEach(muscleCheckbox => {
                groupMuscles.push(muscleCheckbox.value);
            });
            
            if (groupMuscles.length > 0) {
                selectedMuscles[group] = groupMuscles;
            }
        });
        
        return {
            selectedGroups,
            selectedMuscles,
            timestamp: new Date().toISOString()
        };
    };
    
    /**
     * Load muscle selections from saved data
     */
    function loadMuscleSelections() {
        const userId = $('#user-selector').val();
        if (!userId) {
            showMessage('Please select a user first', 'warning');
            return;
        }
        
        console.log('[MuscleTargeting] Loading muscle selections for user:', userId);
        
        $.post(muscleModule.ajaxUrl, {
            action: 'fitcopilot_load_muscle_selection',
            nonce: muscleModule.nonce,
            user_id: userId
        })
        .done(response => {
            if (response.success && response.data.selection_data) {
                populateNestedMuscleFields(response.data.selection_data);
                showMessage('Muscle selections loaded successfully', 'success');
            } else {
                showMessage('No saved muscle selections found', 'info');
            }
        })
        .fail(() => {
            showMessage('Error loading muscle selections', 'error');
        });
    }
    
    /**
     * Load muscle suggestions based on profile
     */
    function loadMuscleSuggestions() {
        const userId = $('#user-selector').val();
        if (!userId) {
            showMessage('Please select a user first', 'warning');
            return;
        }
        
        console.log('[MuscleTargeting] Loading muscle suggestions for user:', userId);
        
        // Get profile data from form if available
        const profileData = window.PromptBuilder ? window.PromptBuilder.collectFormData() : {};
        
        $.post(muscleModule.ajaxUrl, {
            action: 'fitcopilot_muscle_suggestions',
            nonce: muscleModule.nonce,
            user_id: userId,
            profile_data: JSON.stringify(profileData)
        })
        .done(response => {
            if (response.success && response.data.suggestions) {
                applyNestedSuggestions(response.data.suggestions);
                showMessage('Muscle suggestions applied', 'success');
            } else {
                showMessage('No muscle suggestions available', 'info');
            }
        })
        .fail(() => {
            showMessage('Error loading muscle suggestions', 'error');
        });
    }
    
    /**
     * Apply nested muscle suggestions
     */
    window.applyNestedSuggestions = function(suggestions) {
        if (!suggestions || !suggestions.recommended_groups) return;
        
        console.log('[MuscleTargeting] Applying muscle suggestions:', suggestions);
        
        // Clear current selections
        clearMuscleSelection();
        
        // Apply recommended groups
        if (Array.isArray(suggestions.recommended_groups)) {
            suggestions.recommended_groups.forEach(group => {
                const checkbox = document.querySelector(`input[name="targetMuscleGroups[]"][value="${group}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    toggleMuscleGroup(group);
                }
            });
        }
        
        // Apply specific muscle suggestions if available
        if (suggestions.specific_muscles) {
            Object.entries(suggestions.specific_muscles).forEach(([group, muscles]) => {
                if (Array.isArray(muscles)) {
                    muscles.forEach(muscle => {
                        const checkbox = document.querySelector(`input[name="specificMuscles[${group}][]"][value="${muscle}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
            });
        }
        
        updateMuscleSelectionSummary();
    };
    
    /**
     * Show message to user
     */
    function showMessage(message, type = 'info') {
        // Try to use PromptBuilder's message system if available
        if (window.PromptBuilder && typeof window.PromptBuilder.showMessage === 'function') {
            window.PromptBuilder.showMessage(message, type);
        } else {
            // Fallback to console
            console.log(`[MuscleTargeting] ${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Initialize when DOM is ready
     */
    $(document).ready(function() {
        // Wait a bit for other modules to load
        setTimeout(initMuscleTargeting, 100);
    });
    
})(jQuery); 