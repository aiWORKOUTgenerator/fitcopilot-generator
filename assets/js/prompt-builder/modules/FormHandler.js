/**
 * PromptBuilder - FormHandler Module
 * 
 * Handles form data collection, validation, and profile management
 * Extracted from monolithic index.js for performance optimization
 */

(function($, window) {
    'use strict';
    
    // Ensure jQuery is available for this module
    if (typeof $ === 'undefined') {
        throw new Error('FormHandler: jQuery is required but not available');
    }
    
    /**
     * FormHandler Module
     * Manages form data collection, validation, and profile population
     */
    class FormHandler {
        constructor(config, utils) {
            this.config = config;
            this.utils = utils;
            this.form = null;
            this.currentFormData = {};
            this.formChangeTimeout = null;
            
            // Bind methods
            this.handleFormChange = this.handleFormChange.bind(this);
            this.collectFormData = this.collectFormData.bind(this);
            this.populateFormWithProfile = this.populateFormWithProfile.bind(this);
            this.validateFormData = this.validateFormData.bind(this);
        }
        
        /**
         * Initialize form handler
         */
        initialize() {
            this.form = $('#prompt-builder-form');
            
            if (!this.form.length) {
                throw new Error('PromptBuilder form not found');
            }
            
            // Setup form change listeners
            this.form.on('change input', this.handleFormChange);
            
            console.log('[FormHandler] Initialized successfully');
        }
        
        /**
         * Handle form changes with debouncing
         */
        handleFormChange() {
            // Debounce form changes to avoid excessive API calls
            clearTimeout(this.formChangeTimeout);
            this.formChangeTimeout = setTimeout(() => {
                this.currentFormData = this.collectFormData();
                
                // Trigger custom event for other modules
                $(document).trigger('formDataChanged', [this.currentFormData]);
                
                console.log('[FormHandler] Form data updated:', this.currentFormData);
            }, this.config.get('debounceDelay', 300));
        }
        
        /**
         * Collect comprehensive form data
         */
        collectFormData() {
            const formData = {
                basic_info: {
                    name: $('#basic_name').val(),
                    first_name: $('#firstName').val(),
                    last_name: $('#lastName').val(),
                    age: parseInt($('#age').val()) || 0,
                    gender: $('#gender').val(),
                    fitness_level: $('#fitnessLevel').val(),
                    weight: parseFloat($('#weight').val()) || 0,
                    weight_unit: $('#weightUnit').val(),
                    height: this.calculateHeight(),
                    height_unit: $('#heightUnit').val()
                },
                goals: {
                    primary_goal: $('#primary-goal').val(),
                    secondary_goals: this.getCheckedValues('goals[secondary_goals][]'),
                    target_areas: this.getCheckedValues('goals[target_areas][]')
                },
                equipment: this.getCheckedValues('availableEquipment[]'),
                session_params: {
                    duration: parseInt($('#testDuration').val()) || 30,
                    focus: $('#testFocus').val(),
                    energy_level: parseInt($('#energyLevel').val()) || 3,
                    stress_level: parseInt($('#stressLevel').val()) || 3,
                    sleep_quality: parseInt($('#sleepQuality').val()) || 3,
                    frequency: $('#workoutFrequency').val()
                },
                limitations: {
                    physical_limitations: this.getCheckedValues('limitations[]'),
                    medical_conditions: $('#medicalConditions').val(),
                    injuries: $('#injuries').val(),
                    limitation_notes: $('#limitationNotes').val()
                },
                location: {
                    preferred_location: $('#preferredLocation').val()
                },
                exercise_preferences: {
                    favorite_exercises: $('#favoriteExercises').val(),
                    disliked_exercises: $('#dislikedExercises').val()
                },
                custom_instructions: $('#customNotes').val(),
                muscle_selection: this.collectMuscleSelectionData()
            };
            
            return formData;
        }
        
        /**
         * Calculate height based on unit selection
         */
        calculateHeight() {
            const unit = $('#heightUnit').val();
            
            if (unit === 'ft') {
                const feet = parseInt($('#heightFeet').val()) || 0;
                const inches = parseInt($('#heightInches').val()) || 0;
                return (feet * 12) + inches; // Convert to total inches
            } else {
                return parseFloat($('#heightCm').val()) || 0;
            }
        }
        
        /**
         * Collect muscle selection data
         */
        collectMuscleSelectionData() {
            const selectedGroups = this.getCheckedValues('targetMuscleGroups[]');
            const selectedMuscles = {};
            
            // Collect specific muscles for each selected group
            selectedGroups.forEach(group => {
                const groupMuscles = this.getCheckedValues(`specificMuscles[${group}][]`);
                if (groupMuscles.length > 0) {
                    selectedMuscles[group] = groupMuscles;
                }
            });
            
            return {
                selectedGroups: selectedGroups,
                selectedMuscles: selectedMuscles,
                summary: this.generateMuscleSelectionSummary(selectedGroups, selectedMuscles)
            };
        }
        
        /**
         * Generate muscle selection summary
         */
        generateMuscleSelectionSummary(groups, muscles) {
            if (groups.length === 0) {
                return 'No muscle groups selected';
            }
            
            const specificCount = Object.values(muscles).reduce((total, groupMuscles) => {
                return total + (Array.isArray(groupMuscles) ? groupMuscles.length : 0);
            }, 0);
            
            let summary = `${groups.length} muscle group${groups.length > 1 ? 's' : ''} selected`;
            
            if (specificCount > 0) {
                summary += ` (${specificCount} specific muscle${specificCount > 1 ? 's' : ''})`;
            }
            
            return summary;
        }
        
        /**
         * Get checked checkbox values
         */
        getCheckedValues(name) {
            return $(`input[name="${name}"]:checked`).map(function() {
                return $(this).val();
            }).get();
        }
        
        /**
         * Populate form with profile data
         */
        populateFormWithProfile(profileData) {
            console.log('[FormHandler] Populating form with profile data:', profileData);
            
            try {
                // Handle different possible data structures
                let userData = profileData;
                
                // If profileData has a nested structure, extract the user data
                if (profileData.profile_data) {
                    userData = profileData.profile_data;
                } else if (profileData.user_data) {
                    userData = profileData.user_data;
                }
                
                // Basic info - comprehensive field mapping
                this.populateBasicInfo(userData);
                
                // Goals - map to correct checkbox names
                if (userData.goals) {
                    this.setCheckboxValues('goals[]', userData.goals);
                }
                
                // Equipment - map to correct checkbox names  
                if (userData.equipment || userData.availableEquipment) {
                    const equipment = userData.equipment || userData.availableEquipment;
                    this.setCheckboxValues('availableEquipment[]', equipment);
                }
                
                // Session params
                this.populateSessionParams(userData);
                
                // Physical limitations
                this.populateLimitations(userData);
                
                // Exercise preferences
                this.populateExercisePreferences(userData);
                
                // Muscle selection
                this.populateMuscleSelection(userData);
                
                // Custom instructions
                if (userData.custom_notes || userData.custom_instructions) {
                    $('#customNotes').val(userData.custom_notes || userData.custom_instructions);
                }
                
                // Trigger form change to update data
                this.handleFormChange();
                
                console.log('[FormHandler] Form populated successfully');
                
            } catch (error) {
                console.error('[FormHandler] Error populating form:', error);
                throw new Error('Error populating form fields: ' + error.message);
            }
        }
        
        /**
         * Populate basic information fields
         */
        populateBasicInfo(userData) {
            // Handle nested basic_info structure
            const basicInfo = userData.basic_info || userData;
            
            // Name fields
            if (basicInfo.first_name) $('#firstName').val(basicInfo.first_name);
            if (basicInfo.last_name) $('#lastName').val(basicInfo.last_name);
            
            // Physical attributes
            if (basicInfo.age) $('#age').val(basicInfo.age);
            if (basicInfo.gender) $('#gender').val(basicInfo.gender);
            if (basicInfo.fitness_level) $('#fitnessLevel').val(basicInfo.fitness_level);
            if (basicInfo.weight) $('#weight').val(basicInfo.weight);
            if (basicInfo.weight_unit) $('#weightUnit').val(basicInfo.weight_unit);
            
            // Handle height with proper conversion
            this.populateHeightFields(basicInfo);
        }
        
        /**
         * Populate height fields with unit conversion
         */
        populateHeightFields(basicInfo) {
            if (basicInfo.height && basicInfo.height_unit) {
                $('#heightUnit').val(basicInfo.height_unit);
                
                if (basicInfo.height_unit === 'ft') {
                    // Convert total inches to feet and inches
                    const totalInches = parseInt(basicInfo.height);
                    const feet = Math.floor(totalInches / 12);
                    const inches = totalInches % 12;
                    $('#heightFeet').val(feet);
                    $('#heightInches').val(inches);
                    $('#height-imperial').show();
                    $('#height-metric').hide();
                } else {
                    // Use cm directly
                    $('#heightCm').val(basicInfo.height);
                    $('#height-imperial').hide();
                    $('#height-metric').show();
                }
            }
        }
        
        /**
         * Populate session parameters
         */
        populateSessionParams(userData) {
            const sessionParams = userData.session_params || userData;
            
            if (sessionParams.duration || userData.preferred_workout_duration) {
                $('#testDuration').val(sessionParams.duration || userData.preferred_workout_duration);
            }
            if (sessionParams.frequency || userData.workout_frequency) {
                $('#workoutFrequency').val(sessionParams.frequency || userData.workout_frequency);
            }
            if (sessionParams.focus) $('#testFocus').val(sessionParams.focus);
            if (sessionParams.energy_level) $('#energyLevel').val(sessionParams.energy_level);
            if (sessionParams.stress_level) $('#stressLevel').val(sessionParams.stress_level);
            if (sessionParams.sleep_quality) $('#sleepQuality').val(sessionParams.sleep_quality);
        }
        
        /**
         * Populate limitations fields
         */
        populateLimitations(userData) {
            if (userData.limitations) {
                const limitations = userData.limitations;
                
                // Handle array of physical limitations
                if (limitations.physical_limitations) {
                    this.setCheckboxValues('limitations[]', limitations.physical_limitations);
                }
                
                // Handle text fields
                if (limitations.limitation_notes) $('#limitationNotes').val(limitations.limitation_notes);
                if (limitations.medical_conditions) $('#medicalConditions').val(limitations.medical_conditions);
                if (limitations.injuries) $('#injuries').val(limitations.injuries);
            }
            
            // Handle flat structure
            if (userData.medical_conditions) $('#medicalConditions').val(userData.medical_conditions);
            if (userData.limitation_notes) $('#limitationNotes').val(userData.limitation_notes);
        }
        
        /**
         * Populate exercise preferences
         */
        populateExercisePreferences(userData) {
            if (userData.exercise_preferences) {
                const prefs = userData.exercise_preferences;
                if (prefs.favorite_exercises) $('#favoriteExercises').val(prefs.favorite_exercises);
                if (prefs.disliked_exercises) $('#dislikedExercises').val(prefs.disliked_exercises);
            }
            
            // Handle flat structure
            if (userData.favorite_exercises) $('#favoriteExercises').val(userData.favorite_exercises);
            if (userData.disliked_exercises) $('#dislikedExercises').val(userData.disliked_exercises);
        }
        
        /**
         * Populate muscle selection
         */
        populateMuscleSelection(userData) {
            const muscleData = userData.muscle_selection || userData.target_muscles;
            
            if (muscleData) {
                // Clear existing selections
                $('input[name="targetMuscleGroups[]"]').prop('checked', false);
                $('.muscle-detail-grid').hide();
                $('.muscle-group-item').removeClass('expanded');
                $('input[name^="specificMuscles"]').prop('checked', false);
                
                // Populate muscle groups
                if (muscleData.selectedGroups && Array.isArray(muscleData.selectedGroups)) {
                    muscleData.selectedGroups.forEach(group => {
                        const checkbox = $(`input[name="targetMuscleGroups[]"][value="${group}"]`);
                        if (checkbox.length) {
                            checkbox.prop('checked', true);
                            
                            // Show detail grid
                            const detailGrid = $(`#muscle-detail-${group}`);
                            const groupItem = checkbox.closest('.muscle-group-item');
                            
                            detailGrid.show();
                            groupItem.addClass('expanded');
                        }
                    });
                }
                
                // Populate specific muscles
                if (muscleData.selectedMuscles) {
                    Object.entries(muscleData.selectedMuscles).forEach(([group, muscles]) => {
                        if (Array.isArray(muscles)) {
                            muscles.forEach(muscle => {
                                const checkbox = $(`input[name="specificMuscles[${group}][]"][value="${muscle}"]`);
                                if (checkbox.length) {
                                    checkbox.prop('checked', true);
                                }
                            });
                        }
                    });
                }
                
                // Update muscle selection summary if function exists
                if (typeof updateMuscleSelectionSummary === 'function') {
                    updateMuscleSelectionSummary();
                }
            }
        }
        
        /**
         * Set checkbox values helper
         */
        setCheckboxValues(name, values) {
            $(`input[name="${name}"]`).prop('checked', false);
            if (values && Array.isArray(values)) {
                values.forEach(value => {
                    $(`input[name="${name}"][value="${value}"]`).prop('checked', true);
                });
            }
        }
        
        /**
         * Validate form data
         */
        validateFormData(formData) {
            const errors = [];
            const requiredFields = this.config.get('requiredFields', []);
            
            requiredFields.forEach(fieldPath => {
                const value = this.utils.getNestedValue(formData, fieldPath);
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    errors.push(`Field ${fieldPath} is required`);
                }
            });
            
            // Additional validation
            if (formData.basic_info) {
                const basicInfo = formData.basic_info;
                
                if (basicInfo.age && (basicInfo.age < this.config.get('minAge', 13) || basicInfo.age > this.config.get('maxAge', 100))) {
                    errors.push('Age must be between 13 and 100');
                }
                
                if (formData.session_params) {
                    const duration = formData.session_params.duration;
                    if (duration && (duration < this.config.get('minDuration', 10) || duration > this.config.get('maxDuration', 180))) {
                        errors.push('Duration must be between 10 and 180 minutes');
                    }
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
        
        /**
         * Reset form to default state
         */
        resetForm() {
            if (this.form) {
                this.form[0].reset();
                this.currentFormData = {};
                
                // Reset sliders
                $('#energyLevel, #stressLevel, #sleepQuality').val(3);
                
                // Clear muscle selections
                $('input[name="targetMuscleGroups[]"]').prop('checked', false);
                $('.muscle-detail-grid').hide();
                $('.muscle-group-item').removeClass('expanded');
                $('input[name^="specificMuscles"]').prop('checked', false);
                
                // Update displays
                if (typeof updateMuscleSelectionSummary === 'function') {
                    updateMuscleSelectionSummary();
                }
                
                // Trigger reset event
                $(document).trigger('formReset');
                
                console.log('[FormHandler] Form reset completed');
            }
        }
        
        /**
         * Get current form data
         */
        getCurrentFormData() {
            return this.currentFormData;
        }
        
        /**
         * Get form element
         */
        getFormElement() {
            return this.form;
        }
        
        /**
         * Destroy form handler
         */
        destroy() {
            if (this.form) {
                this.form.off('change input', this.handleFormChange);
            }
            
            clearTimeout(this.formChangeTimeout);
            
            console.log('[FormHandler] Destroyed');
        }
    }
    
    // Export to global scope
    window.PromptBuilderFormHandler = FormHandler;
    
})(jQuery, window); 