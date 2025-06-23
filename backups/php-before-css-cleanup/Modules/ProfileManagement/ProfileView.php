<?php

namespace FitCopilot\Modules\ProfileManagement;

/**
 * Profile View
 * 
 * Handles rendering of profile-related UI components
 * extracted from the monolithic PromptBuilderView
 */
class ProfileView {
    
    /**
     * Render complete profile form section
     */
    public function renderProfileForm(array $data = []): string {
        ob_start();
        ?>
        <div class="profile-module-container">
            <!-- User Profile Selection -->
            <div class="builder-section profile-selection">
                <h3>👤 Test Profile</h3>
                <div class="profile-controls">
                    <select id="user-selector" class="user-select">
                        <option value="">Select a user profile...</option>
                        <?php if (!empty($data['users'])): ?>
                            <?php foreach ($data['users'] as $user): ?>
                                <option value="<?php echo intval($user['id']); ?>">
                                    <?php echo esc_html($user['name']); ?> (<?php echo esc_html($user['email']); ?>)
                                </option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </select>
                    <button id="load-profile" class="button button-secondary" disabled>
                        📥 Load Profile
                    </button>
                </div>
            </div>
            
            <!-- Profile Form -->
            <div class="builder-section profile-form">
                <h3>📝 Profile Data</h3>
                <form id="profile-form" class="profile-form">
                    
                    <?php echo $this->renderBasicInfoSection(); ?>
                    <?php echo $this->renderGoalsSection(); ?>
                    <?php echo $this->renderEquipmentSection(); ?>
                    <?php echo $this->renderPreferencesSection(); ?>
                    <?php echo $this->renderHealthSection(); ?>
                    <?php echo $this->renderExercisePreferencesSection(); ?>
                    
                    <!-- Profile Actions -->
                    <div class="profile-actions">
                        <button type="button" id="save-profile" class="button button-primary">
                            💾 Save Profile
                        </button>
                        <button type="button" id="validate-profile" class="button button-secondary">
                            ✅ Validate
                        </button>
                        <button type="reset" class="button">
                            🧹 Clear Form
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Profile Stats -->
            <div class="builder-section profile-stats" style="display: none;">
                <h3>📊 Profile Statistics</h3>
                <div id="profile-stats-content">
                    <!-- Stats will be populated by JavaScript -->
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render basic information section
     */
    private function renderBasicInfoSection(): string {
        return '
        <div class="form-group">
            <h4>Basic Information</h4>
            <div class="form-row">
                <input type="text" id="firstName" name="firstName" placeholder="First Name" class="form-input" required>
                <input type="text" id="lastName" name="lastName" placeholder="Last Name" class="form-input" required>
            </div>
            <div class="form-row">
                <select id="fitnessLevel" name="fitnessLevel" class="form-select" required>
                    <option value="">Fitness Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                </select>
                <select id="gender" name="gender" class="form-select">
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>
            <div class="form-row">
                <input type="number" id="age" name="age" placeholder="Age" class="form-input" min="13" max="120">
                <input type="number" id="weight" name="weight" placeholder="Weight" class="form-input" min="44" max="660">
                <select id="weightUnit" name="weightUnit" class="form-select">
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                </select>
            </div>
            ' . $this->renderHeightFields() . '
        </div>';
    }
    
    /**
     * Render height fields with unit conversion
     */
    private function renderHeightFields(): string {
        return '
        <div class="form-row">
            <div id="height-imperial" class="height-input-group" style="display: flex; gap: 5px; flex: 1;">
                <input type="number" id="heightFeet" name="heightFeet" placeholder="Feet" class="form-input" min="3" max="8" style="flex: 1;">
                <span class="height-separator">ft</span>
                <input type="number" id="heightInches" name="heightInches" placeholder="Inches" class="form-input" min="0" max="11" style="flex: 1;">
                <span class="height-separator">in</span>
            </div>
            <div id="height-metric" class="height-input-group" style="display: none; flex: 1;">
                <input type="number" id="heightCm" name="heightCm" placeholder="Height in cm" class="form-input" min="90" max="250">
            </div>
            <select id="heightUnit" name="heightUnit" class="form-select">
                <option value="ft">ft/in</option>
                <option value="cm">cm</option>
            </select>
        </div>';
    }
    
    /**
     * Render goals section
     */
    private function renderGoalsSection(): string {
        return '
        <div class="form-group">
            <h4>Fitness Goals</h4>
            <div class="checkbox-grid">
                <label><input type="checkbox" name="goals[]" value="weight_loss"> Weight Loss</label>
                <label><input type="checkbox" name="goals[]" value="muscle_building"> Muscle Building</label>
                <label><input type="checkbox" name="goals[]" value="strength"> Strength</label>
                <label><input type="checkbox" name="goals[]" value="endurance"> Endurance</label>
                <label><input type="checkbox" name="goals[]" value="flexibility"> Flexibility</label>
                <label><input type="checkbox" name="goals[]" value="general_fitness"> General Fitness</label>
                <label><input type="checkbox" name="goals[]" value="athletic_performance"> Athletic Performance</label>
                <label><input type="checkbox" name="goals[]" value="stress_relief"> Stress Relief</label>
            </div>
            <textarea id="customGoal" name="customGoal" placeholder="Custom fitness goal (optional)..." class="form-textarea" rows="2" maxlength="500"></textarea>
        </div>';
    }
    
    /**
     * Render equipment section
     */
    private function renderEquipmentSection(): string {
        return '
        <div class="form-group">
            <h4>Available Equipment</h4>
            <div class="checkbox-grid">
                <label><input type="checkbox" name="availableEquipment[]" value="bodyweight"> Bodyweight</label>
                <label><input type="checkbox" name="availableEquipment[]" value="dumbbells"> Dumbbells</label>
                <label><input type="checkbox" name="availableEquipment[]" value="barbell"> Barbell</label>
                <label><input type="checkbox" name="availableEquipment[]" value="resistance_bands"> Resistance Bands</label>
                <label><input type="checkbox" name="availableEquipment[]" value="pull_up_bar"> Pull-up Bar</label>
                <label><input type="checkbox" name="availableEquipment[]" value="kettlebells"> Kettlebells</label>
                <label><input type="checkbox" name="availableEquipment[]" value="cable_machine"> Cable Machine</label>
                <label><input type="checkbox" name="availableEquipment[]" value="treadmill"> Treadmill</label>
                <label><input type="checkbox" name="availableEquipment[]" value="stationary_bike"> Stationary Bike</label>
                <label><input type="checkbox" name="availableEquipment[]" value="yoga_mat"> Yoga Mat</label>
            </div>
        </div>';
    }
    
    /**
     * Render preferences section
     */
    private function renderPreferencesSection(): string {
        return '
        <div class="form-group">
            <h4>Workout Preferences</h4>
            <div class="form-row">
                <select id="preferredLocation" name="preferredLocation" class="form-select">
                    <option value="">Preferred Location</option>
                    <option value="home">Home</option>
                    <option value="gym">Gym</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="travel">Travel/Hotel</option>
                    <option value="office">Office</option>
                    <option value="studio">Studio</option>
                </select>
                <select id="workoutFrequency" name="workoutFrequency" class="form-select">
                    <option value="">Workout Frequency</option>
                    <option value="1-2">1-2 times/week</option>
                    <option value="2-3">2-3 times/week</option>
                    <option value="3-4">3-4 times/week</option>
                    <option value="4-5">4-5 times/week</option>
                    <option value="5-6">5-6 times/week</option>
                    <option value="daily">Daily</option>
                </select>
            </div>
            <div class="form-row">
                <label class="form-label">Preferred Workout Duration:</label>
                <select id="preferredWorkoutDuration" name="preferredWorkoutDuration" class="form-select">
                    <option value="">Select Duration</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="75">75 minutes</option>
                    <option value="90">90 minutes</option>
                </select>
            </div>
        </div>';
    }
    
    /**
     * Render health considerations section
     */
    private function renderHealthSection(): string {
        return '
        <div class="form-group">
            <h4>Health Considerations</h4>
            <div class="form-subgroup">
                <label class="form-label">Physical Limitations:</label>
                <div class="checkbox-grid">
                    <label><input type="checkbox" name="limitations[]" value="lower_back"> Lower Back</label>
                    <label><input type="checkbox" name="limitations[]" value="knee"> Knee</label>
                    <label><input type="checkbox" name="limitations[]" value="shoulder"> Shoulder</label>
                    <label><input type="checkbox" name="limitations[]" value="wrist"> Wrist</label>
                    <label><input type="checkbox" name="limitations[]" value="ankle"> Ankle</label>
                    <label><input type="checkbox" name="limitations[]" value="neck"> Neck</label>
                    <label><input type="checkbox" name="limitations[]" value="hip"> Hip</label>
                    <label><input type="checkbox" name="limitations[]" value="elbow"> Elbow</label>
                </div>
            </div>
            <textarea id="medicalConditions" name="medicalConditions" placeholder="Medical conditions to consider..." class="form-textarea" rows="2" maxlength="1000"></textarea>
            <textarea id="injuries" name="injuries" placeholder="Previous or current injuries..." class="form-textarea" rows="2" maxlength="1000"></textarea>
            <textarea id="limitationNotes" name="limitationNotes" placeholder="Additional limitation notes..." class="form-textarea" rows="2" maxlength="500"></textarea>
        </div>';
    }
    
    /**
     * Render exercise preferences section
     */
    private function renderExercisePreferencesSection(): string {
        return '
        <div class="form-group">
            <h4>Exercise Preferences</h4>
            <textarea id="favoriteExercises" name="favoriteExercises" placeholder="Exercises you enjoy or prefer..." class="form-textarea" rows="2" maxlength="500"></textarea>
            <textarea id="dislikedExercises" name="dislikedExercises" placeholder="Exercises to avoid or dislike..." class="form-textarea" rows="2" maxlength="500"></textarea>
        </div>';
    }
    
    /**
     * Render profile stats widget
     */
    public function renderProfileStats(array $stats): string {
        return '
        <div class="profile-stats-widget">
            <div class="stat-item">
                <span class="stat-value">' . intval($stats['completion_percentage'] ?? 0) . '%</span>
                <span class="stat-label">Complete</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">' . intval($stats['completed_fields'] ?? 0) . '</span>
                <span class="stat-label">Fields</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">' . intval($stats['validation_score'] ?? 0) . '</span>
                <span class="stat-label">Score</span>
            </div>
        </div>';
    }
    
    /**
     * Render profile summary card
     */
    public function renderProfileSummary(array $summary): string {
        ob_start();
        ?>
        <div class="profile-summary-card">
            <div class="profile-header">
                <h4><?php echo esc_html($summary['name'] ?? 'Unknown User'); ?></h4>
                <span class="fitness-level-badge <?php echo esc_attr($summary['fitness_level'] ?? 'beginner'); ?>">
                    <?php echo esc_html(ucfirst($summary['fitness_level'] ?? 'Beginner')); ?>
                </span>
            </div>
            <div class="profile-goals">
                <?php if (!empty($summary['primary_goals'])): ?>
                    <label>Goals:</label>
                    <div class="goals-list">
                        <?php foreach ($summary['primary_goals'] as $goal): ?>
                            <span class="goal-tag"><?php echo esc_html(str_replace('_', ' ', ucfirst($goal))); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
            <div class="profile-meta">
                <div class="completion-bar">
                    <div class="completion-fill" style="width: <?php echo intval($summary['completion'] ?? 0); ?>%"></div>
                </div>
                <span class="last-updated">Updated: <?php echo esc_html($summary['last_updated'] ?? 'Unknown'); ?></span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render validation errors
     */
    public function renderValidationErrors(array $errors): string {
        if (empty($errors)) {
            return '';
        }
        
        ob_start();
        ?>
        <div class="profile-validation-errors">
            <h4>⚠️ Validation Errors</h4>
            <ul>
                <?php foreach ($errors as $field => $error): ?>
                    <li data-field="<?php echo esc_attr($field); ?>">
                        <strong><?php echo esc_html(ucfirst(str_replace('_', ' ', $field))); ?>:</strong>
                        <?php echo esc_html($error); ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render validation warnings
     */
    public function renderValidationWarnings(array $warnings): string {
        if (empty($warnings)) {
            return '';
        }
        
        ob_start();
        ?>
        <div class="profile-validation-warnings">
            <h4>⚡ Recommendations</h4>
            <ul>
                <?php foreach ($warnings as $field => $warning): ?>
                    <li data-field="<?php echo esc_attr($field); ?>">
                        <?php echo esc_html($warning); ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php
        return ob_get_clean();
    }
} 