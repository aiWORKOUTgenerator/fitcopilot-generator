<?php

namespace FitCopilot\Admin\Debug\Views\Components;

/**
 * ProfileForm Component
 * 
 * Extracted from monolithic PromptBuilderView.php for better maintainability
 * Handles the profile form interface rendering
 */
class ProfileForm {
    
    private array $users;
    private array $formData;
    
    public function __construct(array $users = [], array $formData = []) {
        $this->users = $users;
        $this->formData = $formData;
    }
    
    /**
     * Render the complete profile form section
     */
    public function render(): string {
        ob_start();
        ?>
        <!-- User Profile Selection Component -->
        <div class="builder-section">
            <h3>👤 Test Profile</h3>
            <div class="profile-controls">
                <select id="user-selector" class="user-select">
                    <option value="">Select a user profile...</option>
                    <?php foreach ($this->users as $user): ?>
                        <option value="<?php echo intval($user['id']); ?>">
                            <?php echo esc_html($user['name']); ?> (<?php echo esc_html($user['email']); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
                <button id="load-profile" class="button button-secondary" disabled>
                    📥 Load Profile
                </button>
            </div>
        </div>
        
        <!-- Profile Form Component -->
        <div class="builder-section">
            <h3>📝 Profile Data</h3>
            <form id="prompt-builder-form" class="prompt-form">
                
                <?php echo $this->renderBasicInfo(); ?>
                <?php echo $this->renderGoalsSection(); ?>
                <?php echo $this->renderEquipmentSection(); ?>
                <?php echo $this->renderSessionParams(); ?>
                <?php echo $this->renderLocationSection(); ?>
                <?php echo $this->renderTargetMuscles(); ?>
                <?php echo $this->renderLimitations(); ?>
                <?php echo $this->renderExercisePreferences(); ?>
                <?php echo $this->renderCustomInstructions(); ?>
                
            </form>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render basic information section
     */
    private function renderBasicInfo(): string {
        ob_start();
        ?>
        <!-- Basic Information -->
        <div class="form-group">
            <h4>Basic Information</h4>
            <div class="form-row">
                <input type="text" id="firstName" name="firstName" placeholder="First Name" class="form-input" 
                       value="<?php echo esc_attr($this->formData['firstName'] ?? ''); ?>">
                <input type="text" id="lastName" name="lastName" placeholder="Last Name" class="form-input"
                       value="<?php echo esc_attr($this->formData['lastName'] ?? ''); ?>">
            </div>
            <div class="form-row">
                <select id="fitnessLevel" name="fitnessLevel" class="form-select">
                    <option value="">Fitness Level</option>
                    <option value="beginner" <?php selected($this->formData['fitnessLevel'] ?? '', 'beginner'); ?>>Beginner</option>
                    <option value="intermediate" <?php selected($this->formData['fitnessLevel'] ?? '', 'intermediate'); ?>>Intermediate</option>
                    <option value="advanced" <?php selected($this->formData['fitnessLevel'] ?? '', 'advanced'); ?>>Advanced</option>
                    <option value="expert" <?php selected($this->formData['fitnessLevel'] ?? '', 'expert'); ?>>Expert</option>
                </select>
                <select id="gender" name="gender" class="form-select">
                    <option value="">Gender</option>
                    <option value="male" <?php selected($this->formData['gender'] ?? '', 'male'); ?>>Male</option>
                    <option value="female" <?php selected($this->formData['gender'] ?? '', 'female'); ?>>Female</option>
                    <option value="other" <?php selected($this->formData['gender'] ?? '', 'other'); ?>>Other</option>
                </select>
            </div>
            <div class="form-row">
                <input type="number" id="age" name="age" placeholder="Age" class="form-input" min="16" max="100"
                       value="<?php echo esc_attr($this->formData['age'] ?? ''); ?>">
                <input type="number" id="weight" name="weight" placeholder="Weight" class="form-input" min="50" max="500"
                       value="<?php echo esc_attr($this->formData['weight'] ?? ''); ?>">
                <select id="weightUnit" name="weightUnit" class="form-select">
                    <option value="lbs" <?php selected($this->formData['weightUnit'] ?? 'lbs', 'lbs'); ?>>lbs</option>
                    <option value="kg" <?php selected($this->formData['weightUnit'] ?? 'lbs', 'kg'); ?>>kg</option>
                </select>
            </div>
            <?php echo $this->renderHeightFields(); ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render height fields with unit conversion
     */
    private function renderHeightFields(): string {
        $heightUnit = $this->formData['heightUnit'] ?? 'ft';
        $heightFeet = $this->formData['heightFeet'] ?? '';
        $heightInches = $this->formData['heightInches'] ?? '';
        $heightCm = $this->formData['heightCm'] ?? '';
        
        ob_start();
        ?>
        <div class="form-row">
            <!-- Height fields that change based on unit selection -->
            <div id="height-imperial" class="height-input-group" style="display: <?php echo $heightUnit === 'ft' ? 'flex' : 'none'; ?>; gap: 5px; flex: 1;">
                <input type="number" id="heightFeet" name="heightFeet" placeholder="Feet" class="form-input" min="3" max="8" style="flex: 1;"
                       value="<?php echo esc_attr($heightFeet); ?>">
                <span class="height-separator">ft</span>
                <input type="number" id="heightInches" name="heightInches" placeholder="Inches" class="form-input" min="0" max="11" style="flex: 1;"
                       value="<?php echo esc_attr($heightInches); ?>">
                <span class="height-separator">in</span>
            </div>
            <div id="height-metric" class="height-input-group" style="display: <?php echo $heightUnit === 'cm' ? 'flex' : 'none'; ?>; flex: 1;">
                <input type="number" id="heightCm" name="heightCm" placeholder="Height in cm" class="form-input" min="90" max="250"
                       value="<?php echo esc_attr($heightCm); ?>">
            </div>
            <select id="heightUnit" name="heightUnit" class="form-select" onchange="toggleHeightFields(this.value)">
                <option value="ft" <?php selected($heightUnit, 'ft'); ?>>ft/in</option>
                <option value="cm" <?php selected($heightUnit, 'cm'); ?>>cm</option>
            </select>
        </div>
        
        <script>
        function toggleHeightFields(unit) {
            const imperial = document.getElementById('height-imperial');
            const metric = document.getElementById('height-metric');
            
            if (unit === 'ft') {
                imperial.style.display = 'flex';
                metric.style.display = 'none';
            } else {
                imperial.style.display = 'none';
                metric.style.display = 'flex';
            }
        }
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render goals section
     */
    private function renderGoalsSection(): string {
        $goalOptions = [
            'weight_loss' => 'Weight Loss',
            'muscle_building' => 'Muscle Building',
            'strength' => 'Strength Training',
            'endurance' => 'Endurance & Cardio',
            'flexibility' => 'Flexibility & Mobility',
            'general_fitness' => 'General Fitness',
            'sport_specific' => 'Sport-Specific'
        ];
        
        $focusOptions = [
            'upper_body' => 'Upper Body',
            'lower_body' => 'Lower Body',
            'full_body' => 'Full Body',
            'core' => 'Core',
            'cardio' => 'Cardio'
        ];
        
        ob_start();
        ?>
        <!-- Goals & Focus -->
        <div class="form-group">
            <h4>Goals & Focus</h4>
            <div class="form-row">
                <select id="primary-goal" name="primary-goal" class="form-select">
                    <option value="">Primary Goal</option>
                    <?php foreach ($goalOptions as $value => $label): ?>
                        <option value="<?php echo esc_attr($value); ?>" <?php selected($this->formData['primary-goal'] ?? '', $value); ?>>
                            <?php echo esc_html($label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <select id="workout-focus" name="workout-focus" class="form-select">
                    <option value="">Today's Focus</option>
                    <?php foreach ($focusOptions as $value => $label): ?>
                        <option value="<?php echo esc_attr($value); ?>" <?php selected($this->formData['workout-focus'] ?? '', $value); ?>>
                            <?php echo esc_html($label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render equipment section
     */
    private function renderEquipmentSection(): string {
        $equipmentOptions = [
            'dumbbells' => 'Dumbbells',
            'barbell' => 'Barbell',
            'resistance_bands' => 'Resistance Bands',
            'kettlebell' => 'Kettlebell',
            'pull_up_bar' => 'Pull-up Bar',
            'yoga_mat' => 'Yoga Mat',
            'treadmill' => 'Treadmill',
            'stationary_bike' => 'Stationary Bike',
            'bodyweight' => 'Bodyweight Only'
        ];
        
        ob_start();
        ?>
        <!-- Available Equipment -->
        <div class="form-group">
            <h4>Available Equipment</h4>
            <div class="checkbox-grid">
                <?php foreach ($equipmentOptions as $value => $label): ?>
                    <label>
                        <input type="checkbox" name="availableEquipment[]" value="<?php echo esc_attr($value); ?>"
                               <?php checked(in_array($value, $this->formData['availableEquipment'] ?? [])); ?>>
                        <?php echo esc_html($label); ?>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render session parameters
     */
    private function renderSessionParams(): string {
        ob_start();
        ?>
        <!-- Today's Session Parameters -->
        <div class="form-group">
            <h4>Today's Session Parameters</h4>
            <div class="form-row">
                <select id="testDuration" name="testDuration" class="form-select">
                    <option value="">Duration</option>
                    <option value="15" <?php selected($this->formData['testDuration'] ?? '', '15'); ?>>15 minutes</option>
                    <option value="30" <?php selected($this->formData['testDuration'] ?? '', '30'); ?>>30 minutes</option>
                    <option value="45" <?php selected($this->formData['testDuration'] ?? '', '45'); ?>>45 minutes</option>
                    <option value="60" <?php selected($this->formData['testDuration'] ?? '', '60'); ?>>60 minutes</option>
                    <option value="90" <?php selected($this->formData['testDuration'] ?? '', '90'); ?>>90 minutes</option>
                </select>
                <select id="workoutFrequency" name="workoutFrequency" class="form-select">
                    <option value="">Frequency</option>
                    <option value="1" <?php selected($this->formData['workoutFrequency'] ?? '', '1'); ?>>1x per week</option>
                    <option value="2" <?php selected($this->formData['workoutFrequency'] ?? '', '2'); ?>>2x per week</option>
                    <option value="3" <?php selected($this->formData['workoutFrequency'] ?? '', '3'); ?>>3x per week</option>
                    <option value="4" <?php selected($this->formData['workoutFrequency'] ?? '', '4'); ?>>4x per week</option>
                    <option value="5" <?php selected($this->formData['workoutFrequency'] ?? '', '5'); ?>>5x per week</option>
                </select>
            </div>
            
            <!-- Energy, Stress, Sleep Quality Sliders -->
            <div class="slider-group">
                <div class="slider-item">
                    <label for="energyLevel">Energy Level: <span id="energy-value"><?php echo esc_html($this->formData['energyLevel'] ?? '3'); ?></span></label>
                    <input type="range" id="energyLevel" name="energyLevel" min="1" max="5" 
                           value="<?php echo esc_attr($this->formData['energyLevel'] ?? '3'); ?>" class="slider">
                </div>
                <div class="slider-item">
                    <label for="stressLevel">Stress Level: <span id="stress-value"><?php echo esc_html($this->formData['stressLevel'] ?? '3'); ?></span></label>
                    <input type="range" id="stressLevel" name="stressLevel" min="1" max="5" 
                           value="<?php echo esc_attr($this->formData['stressLevel'] ?? '3'); ?>" class="slider">
                </div>
                <div class="slider-item">
                    <label for="sleepQuality">Sleep Quality: <span id="sleep-value"><?php echo esc_html($this->formData['sleepQuality'] ?? '3'); ?></span></label>
                    <input type="range" id="sleepQuality" name="sleepQuality" min="1" max="5" 
                           value="<?php echo esc_attr($this->formData['sleepQuality'] ?? '3'); ?>" class="slider">
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render location section
     */
    private function renderLocationSection(): string {
        $locationOptions = [
            'home' => 'Home',
            'gym' => 'Gym',
            'outdoor' => 'Outdoor',
            'office' => 'Office'
        ];
        
        ob_start();
        ?>
        <!-- Location & Preferences -->
        <div class="form-group">
            <h4>Location & Preferences</h4>
            <div class="form-row">
                <select id="preferredLocation" name="preferredLocation" class="form-select">
                    <option value="">Preferred Location</option>
                    <?php foreach ($locationOptions as $value => $label): ?>
                        <option value="<?php echo esc_attr($value); ?>" <?php selected($this->formData['preferredLocation'] ?? '', $value); ?>>
                            <?php echo esc_html($label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render target muscles section (simplified version)
     */
    private function renderTargetMuscles(): string {
        $muscleGroups = [
            'chest' => 'Chest',
            'back' => 'Back',
            'shoulders' => 'Shoulders',
            'arms' => 'Arms',
            'core' => 'Core',
            'legs' => 'Legs'
        ];
        
        ob_start();
        ?>
        <!-- Target Muscles -->
        <div class="form-group">
            <h4>Target Muscles</h4>
            <div class="checkbox-grid">
                <?php foreach ($muscleGroups as $value => $label): ?>
                    <label>
                        <input type="checkbox" name="targetMuscleGroups[]" value="<?php echo esc_attr($value); ?>"
                               <?php checked(in_array($value, $this->formData['targetMuscleGroups'] ?? [])); ?>>
                        <?php echo esc_html($label); ?>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render limitations section
     */
    private function renderLimitations(): string {
        $limitationOptions = [
            'knee_injury' => 'Knee Injury',
            'back_pain' => 'Back Pain',
            'shoulder_issue' => 'Shoulder Issue',
            'ankle_problem' => 'Ankle Problem',
            'wrist_pain' => 'Wrist Pain',
            'neck_issue' => 'Neck Issue'
        ];
        
        ob_start();
        ?>
        <!-- Health Considerations -->
        <div class="form-group">
            <h4>Health Considerations</h4>
            <div class="checkbox-grid">
                <?php foreach ($limitationOptions as $value => $label): ?>
                    <label>
                        <input type="checkbox" name="limitations[]" value="<?php echo esc_attr($value); ?>"
                               <?php checked(in_array($value, $this->formData['limitations'] ?? [])); ?>>
                        <?php echo esc_html($label); ?>
                    </label>
                <?php endforeach; ?>
            </div>
            <div class="form-row">
                <textarea id="medicalConditions" name="medicalConditions" placeholder="Medical conditions or additional health notes..." 
                          class="form-textarea" rows="3"><?php echo esc_textarea($this->formData['medicalConditions'] ?? ''); ?></textarea>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render exercise preferences section
     */
    private function renderExercisePreferences(): string {
        ob_start();
        ?>
        <!-- Exercise Preferences -->
        <div class="form-group">
            <h4>Exercise Preferences</h4>
            <div class="form-row">
                <textarea id="favoriteExercises" name="favoriteExercises" placeholder="Favorite exercises..." 
                          class="form-textarea" rows="2"><?php echo esc_textarea($this->formData['favoriteExercises'] ?? ''); ?></textarea>
                <textarea id="dislikedExercises" name="dislikedExercises" placeholder="Exercises to avoid..." 
                          class="form-textarea" rows="2"><?php echo esc_textarea($this->formData['dislikedExercises'] ?? ''); ?></textarea>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render custom instructions section
     */
    private function renderCustomInstructions(): string {
        ob_start();
        ?>
        <!-- Custom Instructions -->
        <div class="form-group">
            <h4>Custom Instructions</h4>
            <div class="form-row">
                <textarea id="customNotes" name="customNotes" placeholder="Any additional instructions or preferences..." 
                          class="form-textarea" rows="4"><?php echo esc_textarea($this->formData['customNotes'] ?? ''); ?></textarea>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Set users data
     */
    public function setUsers(array $users): self {
        $this->users = $users;
        return $this;
    }
    
    /**
     * Set form data
     */
    public function setFormData(array $formData): self {
        $this->formData = $formData;
        return $this;
    }
    
    /**
     * Get users data
     */
    public function getUsers(): array {
        return $this->users;
    }
    
    /**
     * Get form data
     */
    public function getFormData(): array {
        return $this->formData;
    }
} 