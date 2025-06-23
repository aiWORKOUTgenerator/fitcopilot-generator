<?php
/**
 * TestingLabView - Renders the Testing Lab page
 */

namespace FitCopilot\Admin\Debug\Views;

if (!defined('ABSPATH')) {
    exit;
}

class TestingLabView {
    
    /**
     * Get WordPress users for the dropdown
     */
    private function getUsers() {
        $users = get_users([
            'orderby' => 'display_name',
            'order' => 'ASC',
            'fields' => ['ID', 'display_name', 'user_email']
        ]);
        
        return $users;
    }
    
    public function render(): void {
        // Enqueue Testing Lab specific assets
        wp_enqueue_style(
            'fitcopilot-testing-lab',
            plugins_url('assets/css/admin-testing-lab.css', FITCOPILOT_FILE),
            [],
            FITCOPILOT_VERSION
        );
        
        wp_enqueue_script(
            'fitcopilot-testing-lab',
            plugins_url('assets/js/admin-testing-lab.js', FITCOPILOT_FILE),
            ['jquery', 'wp-util'],
            FITCOPILOT_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('fitcopilot-testing-lab', 'fitcopilotTestingLab', [
            'nonce' => wp_create_nonce('fitcopilot_admin_ajax'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'debug' => defined('WP_DEBUG') && WP_DEBUG
        ]);
        
        $users = $this->getUsers();
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">
                <span class="dashicons dashicons-flask"></span>
                Testing Lab
            </h1>
            
            <div class="testing-lab-container">
                <!-- Test Options Grid -->
                <div class="test-options-grid">
                    <div class="test-card">
                        <div class="test-card-icon">
                            <span class="dashicons dashicons-hammer"></span>
                        </div>
                        <div class="test-card-content">
                            <h3>Workout Generation Test</h3>
                            <p>Test the workout generation functionality with custom parameters.</p>
                            <button id="test-workout-generation" class="test-button test-button-primary" data-test-action="test-workout-generation">
                                <span class="dashicons dashicons-play"></span>
                                Test Workout Generation
                            </button>
                        </div>
                    </div>
                    
                    <div class="test-card">
                        <div class="test-card-icon">
                            <span class="dashicons dashicons-edit-page"></span>
                        </div>
                        <div class="test-card-content">
                            <h3>Prompt Building Test</h3>
                            <p>Test the prompt building functionality.</p>
                            <button id="test-prompt-building" class="test-button test-button-secondary" data-test-action="test-prompt-building">
                                <span class="dashicons dashicons-play"></span>
                                Test Prompt Building
                            </button>
                        </div>
                    </div>
                    
                    <div class="test-card">
                        <div class="test-card-icon">
                            <span class="dashicons dashicons-yes-alt"></span>
                        </div>
                        <div class="test-card-content">
                            <h3>Context Validation</h3>
                            <p>Validate context data structure and completeness.</p>
                            <button id="test-context-validation" class="test-button test-button-secondary" data-test-action="test-context-validation">
                                <span class="dashicons dashicons-play"></span>
                                Test Context Validation
                            </button>
                        </div>
                    </div>
                    
                    <div class="test-card">
                        <div class="test-card-icon">
                            <span class="dashicons dashicons-performance"></span>
                        </div>
                        <div class="test-card-content">
                            <h3>Performance Test</h3>
                            <p>Run performance benchmarks on the system.</p>
                            <button id="test-performance" class="test-button test-button-secondary" data-test-action="test-performance">
                                <span class="dashicons dashicons-play"></span>
                                Test Performance
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="test-results-section">
                    <h2>
                        <span class="dashicons dashicons-chart-area"></span>
                        Test Results
                    </h2>
                    <div id="test-results" class="test-results">
                        <div class="test-results-placeholder">
                            <span class="dashicons dashicons-info"></span>
                            <p>Click a test button above to see results here.</p>
                        </div>
                    </div>
                </div>

                <!-- WORKOUT TESTER FORM - Updated to use Profile Data Only -->
                <div class="wg-debug-section collapsible-section">
                    <div class="section-header" onclick="toggleSection('workout-tester-content')">
                        <h2>👤 Profile Data Only Testing</h2>
                        <button type="button" class="collapse-toggle" aria-label="Toggle section">
                            <span class="dashicons dashicons-arrow-down-alt2"></span>
                        </button>
                    </div>
                    
                    <div id="workout-tester-content" class="collapsible-content">
                        <p class="wg-description">
                            Test workout generation using <strong>only profile data</strong> (long-term user information) 
                            as collected by the Edit Profile Modal. This mirrors the basic profile-based data flow.
                        </p>
                        
                        <form id="workout-test-form" class="wg-debug-form">
                        
                            <!-- User Selection Section -->
                            <fieldset class="form-section user-selection-section">
                                <legend>👥 Select User for Testing</legend>
                                <p class="section-description">Choose a WordPress user to populate the form with their actual profile data</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="selectedUser">Select User:</label>
                                        <select id="selectedUser" name="selectedUser" onchange="loadUserProfile(this.value)">
                                            <option value="">Manual Entry (Default Values)</option>
                                            <?php foreach ($users as $user): ?>
                                                <option value="<?php echo esc_attr($user->ID); ?>" 
                                                        data-name="<?php echo esc_attr($user->display_name); ?>"
                                                        data-email="<?php echo esc_attr($user->user_email); ?>">
                                                    <?php echo esc_html($user->display_name); ?> (<?php echo esc_html($user->user_email); ?>)
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="form-field">
                                        <button type="button" id="load-user-btn" class="wg-button wg-button-secondary" disabled>
                                            📥 Load User Data
                                        </button>
                                    </div>
                                </div>
                                
                                <div id="user-load-status" class="user-load-status" style="display: none;">
                                    <!-- Status messages will be displayed here -->
                                </div>
                            </fieldset>

                            <!-- Step 1: Basic Information (BasicInfoStep) -->
                            <fieldset class="form-section">
                                <legend>👤 Basic Information</legend>
                                <p class="section-description">Personal details and fitness foundation</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="firstName">First Name:</label>
                                        <input type="text" id="firstName" name="firstName" value="Justin" placeholder="Enter first name">
                                    </div>
                                    <div class="form-field">
                                        <label for="lastName">Last Name:</label>
                                        <input type="text" id="lastName" name="lastName" value="Fassio" placeholder="Enter last name">
                                    </div>
                                </div>
                                
                                <div class="form-field">
                                    <label for="fitnessLevel">Fitness Level:</label>
                                    <select id="fitnessLevel" name="fitnessLevel">
                                        <option value="beginner">Beginner - New to exercise</option>
                                        <option value="intermediate" selected>Intermediate - Regular exercise routine</option>
                                        <option value="advanced">Advanced - Experienced with intense training</option>
                                    </select>
                                </div>
                                
                                <div class="form-field">
                                    <label for="goals">Fitness Goals:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" name="goals[]" value="weight_loss"> Weight Loss</label>
                                        <label><input type="checkbox" name="goals[]" value="muscle_building" checked> Muscle Building</label>
                                        <label><input type="checkbox" name="goals[]" value="strength" checked> Strength</label>
                                        <label><input type="checkbox" name="goals[]" value="endurance"> Endurance</label>
                                        <label><input type="checkbox" name="goals[]" value="flexibility"> Flexibility</label>
                                        <label><input type="checkbox" name="goals[]" value="general_fitness"> General Fitness</label>
                                    </div>
                                </div>
                            </fieldset>

                            <!-- Step 2: Body Metrics (BodyMetricsStep) -->
                            <fieldset class="form-section">
                                <legend>📏 Body Metrics</legend>
                                <p class="section-description">Physical characteristics for personalized recommendations</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="age">Age:</label>
                                        <input type="number" id="age" name="age" value="48" min="16" max="100">
                                    </div>
                                    <div class="form-field">
                                        <label for="gender">Gender:</label>
                                        <select id="gender" name="gender">
                                            <option value="">Not specified</option>
                                            <option value="male" selected>Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="weight">Weight:</label>
                                        <div class="input-with-unit">
                                            <input type="number" id="weight" name="weight" value="200" min="50" max="500">
                                            <select name="weightUnit">
                                                <option value="lbs" selected>lbs</option>
                                                <option value="kg">kg</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-field">
                                        <label for="height">Height:</label>
                                        <div class="height-feet-inches">
                                            <div class="feet-inches-inputs">
                                                <div class="feet-input">
                                                    <input type="number" id="height-feet" name="height-feet" value="6" min="0" max="8" title="Feet">
                                                    <span class="input-label">ft</span>
                                                </div>
                                                <div class="inches-input">
                                                    <input type="number" id="height-inches" name="height-inches" value="0" min="0" max="11" title="Inches">
                                                    <span class="input-label">in</span>
                                                </div>
                                            </div>
                                            <select name="heightUnit">
                                                <option value="ft" selected>ft/in</option>
                                                <option value="cm">cm</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <!-- Step 3: Equipment & Location (EquipmentStep) -->
                            <fieldset class="form-section">
                                <legend>🏠 Equipment & Location</legend>
                                <p class="section-description">Available equipment and workout environment</p>
                                
                                <div class="form-field">
                                    <label for="availableEquipment">Available Equipment:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" name="availableEquipment[]" value="none"> None/Bodyweight only</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="dumbbells" checked> Dumbbells</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="kettlebells"> Kettlebells</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="resistance_bands" checked> Resistance Bands</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="pull_up_bar"> Pull-up Bar</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="yoga_mat" checked> Yoga Mat</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="bench"> Bench</label>
                                        <label><input type="checkbox" name="availableEquipment[]" value="barbell"> Barbell</label>
                                    </div>
                                </div>
                                
                                <div class="form-field">
                                    <label for="preferredLocation">Preferred Location:</label>
                                    <select id="preferredLocation" name="preferredLocation">
                                        <option value="home" selected>Home</option>
                                        <option value="gym">Gym</option>
                                        <option value="outdoors">Outdoors</option>
                                        <option value="office">Office</option>
                                        <option value="hotel">Hotel/Travel</option>
                                    </select>
                                </div>
                            </fieldset>

                            <!-- Step 4: Health Considerations (HealthStep) -->
                            <fieldset class="form-section">
                                <legend>🏥 Health Considerations</legend>
                                <p class="section-description">Physical limitations and health restrictions</p>
                                
                                <div class="form-field">
                                    <label for="limitations">Physical Limitations:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" name="limitations[]" value="none"> No limitations</label>
                                        <label><input type="checkbox" name="limitations[]" value="knee" checked> Knee issues</label>
                                        <label><input type="checkbox" name="limitations[]" value="back"> Back problems</label>
                                        <label><input type="checkbox" name="limitations[]" value="shoulder"> Shoulder issues</label>
                                        <label><input type="checkbox" name="limitations[]" value="wrist"> Wrist problems</label>
                                        <label><input type="checkbox" name="limitations[]" value="ankle"> Ankle issues</label>
                                        <label><input type="checkbox" name="limitations[]" value="neck"> Neck problems</label>
                                    </div>
                                </div>
                                
                                <div class="form-field">
                                    <label for="limitationNotes">Limitation Details:</label>
                                    <textarea id="limitationNotes" name="limitationNotes" rows="3" placeholder="Describe any specific limitations or modifications needed">Left knee pain, avoid high-impact exercises</textarea>
                                </div>
                                
                                <div class="form-field">
                                    <label for="medicalConditions">Medical Conditions:</label>
                                    <textarea id="medicalConditions" name="medicalConditions" rows="2" placeholder="Any relevant medical conditions (optional)"></textarea>
                                </div>
                            </fieldset>

                            <!-- Step 5: Workout Preferences (PreferencesStep) -->
                            <fieldset class="form-section">
                                <legend>⚙️ Workout Preferences</legend>
                                <p class="section-description">General workout preferences and habits</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="workoutFrequency">Workout Frequency:</label>
                                        <select id="workoutFrequency" name="workoutFrequency">
                                            <option value="1-2">1-2 times per week</option>
                                            <option value="3-4" selected>3-4 times per week</option>
                                            <option value="5-6">5-6 times per week</option>
                                            <option value="daily">Daily</option>
                                        </select>
                                    </div>
                                    <div class="form-field">
                                        <label for="preferredWorkoutDuration">Preferred Duration:</label>
                                        <select id="preferredWorkoutDuration" name="preferredWorkoutDuration">
                                            <option value="15">15 minutes</option>
                                            <option value="30" selected>30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                            <option value="90">90 minutes</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-field">
                                    <label for="favoriteExercises">Favorite Exercises:</label>
                                    <textarea id="favoriteExercises" name="favoriteExercises" rows="2" placeholder="List exercises you enjoy (optional)">Push-ups, squats, deadlifts</textarea>
                                </div>
                                
                                <div class="form-field">
                                    <label for="dislikedExercises">Exercises to Avoid:</label>
                                    <textarea id="dislikedExercises" name="dislikedExercises" rows="2" placeholder="List exercises you want to avoid (optional)">Running, jumping exercises</textarea>
                                </div>
                            </fieldset>
                            
                            <!-- Test Configuration -->
                            <fieldset class="form-section">
                                <legend>🧪 Test Configuration</legend>
                                <p class="section-description">Test-specific parameters (not part of profile data)</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="test_duration">Test Workout Duration:</label>
                                        <select id="test_duration" name="test_duration">
                                            <option value="15">15 minutes</option>
                                            <option value="30" selected>30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                        </select>
                                    </div>
                                    <div class="form-field">
                                        <label for="test_focus">Today's Focus:</label>
                                        <select id="test_focus" name="test_focus">
                                            <option value="strength" selected>Strength Training</option>
                                            <option value="cardio">Cardio</option>
                                            <option value="flexibility">Flexibility</option>
                                            <option value="full_body">Full Body</option>
                                            <option value="upper_body">Upper Body</option>
                                            <option value="lower_body">Lower Body</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="form-actions">
                                <button type="button" id="test-profile-workout-btn" class="wg-button wg-button-primary">
                                    🧪 Test Profile-Based Workout Generation
                                </button>
                                <button type="button" id="clear-form-btn" class="wg-button wg-button-secondary">
                                    🗑️ Clear Form
                                </button>
                            </div>
                        </form>

                        <!-- Results Section -->
                        <div id="workout-test-results" class="wg-results-section">
                            <h3>Test Results</h3>
                            <div id="profile-test-output">
                                <div class="wg-debug-placeholder">
                                    <p>🧪 Ready to test profile-based workout generation</p>
                                    <p>Fill in the profile data above and click "Test Profile-Based Workout Generation"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- WORKOUTGENERATORGRID TESTER FORM - Profile + Grid Data -->
                <div class="wg-debug-section collapsible-section">
                    <div class="section-header" onclick="toggleSection('grid-tester-content')">
                        <h2>🏋️ Profile + WorkoutGeneratorGrid Testing</h2>
                        <button type="button" class="collapse-toggle" aria-label="Toggle section">
                            <span class="dashicons dashicons-arrow-down-alt2"></span>
                        </button>
                    </div>
                    
                    <div id="grid-tester-content" class="collapsible-content">
                        <p class="wg-description">
                            Test workout generation using <strong>profile data + WorkoutGeneratorGrid selections</strong> 
                            (long-term user information + session-specific daily choices). This mirrors the complete frontend data flow 
                            with all 11 modular cards. <strong>Duration is required</strong> for this test mode.
                        </p>
                        
                        <form id="grid-test-form" class="wg-debug-form">
                        
                            <!-- User Selection Section -->
                            <fieldset class="form-section user-selection-section">
                                <legend>👥 Select User for Profile Data</legend>
                                <p class="section-description">Choose a WordPress user to populate profile data (same as Profile Only test)</p>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <label for="gridSelectedUser">Select User:</label>
                                        <select id="gridSelectedUser" name="gridSelectedUser" onchange="loadGridUserProfile(this.value)">
                                            <option value="">Manual Entry (Default Values)</option>
                                            <?php foreach ($users as $user): ?>
                                                <option value="<?php echo esc_attr($user->ID); ?>" 
                                                        data-name="<?php echo esc_attr($user->display_name); ?>"
                                                        data-email="<?php echo esc_attr($user->user_email); ?>">
                                                    <?php echo esc_html($user->display_name); ?> (<?php echo esc_html($user->user_email); ?>)
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="form-field">
                                        <button type="button" id="grid-load-user-btn" class="wg-button wg-button-secondary" disabled>
                                            📥 Load User Data
                                        </button>
                                    </div>
                                </div>
                                
                                <div id="grid-user-load-status" class="user-load-status" style="display: none;">
                                    <!-- Status messages will be displayed here -->
                                </div>
                            </fieldset>

                            <!-- WorkoutGeneratorGrid Cards Section -->
                            <fieldset class="form-section workoutgrid-section">
                                <legend>🎯 WorkoutGeneratorGrid Modular Cards</legend>
                                <p class="section-description">Session-specific daily workout selections (11 modular cards)</p>
                                
                                <!-- Row 1: Core Workout Setup -->
                                <div class="grid-cards-row">
                                    <h4>Core Workout Setup</h4>
                                    
                                    <!-- Focus Card -->
                                    <div class="form-field">
                                        <label for="todaysFocus">Today's Focus: <span class="required">*</span></label>
                                        <select id="todaysFocus" name="todaysFocus" required>
                                            <option value="">Select focus...</option>
                                            <option value="fat-burning">🔥 Fat Burning</option>
                                            <option value="muscle-building" selected>💪 Muscle Building</option>
                                            <option value="endurance">🏃 Endurance</option>
                                            <option value="strength">🏋️ Strength</option>
                                            <option value="flexibility">🧘 Flexibility</option>
                                            <option value="general-fitness">⚡ General Fitness</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Intensity Card -->
                                    <div class="form-field">
                                        <label for="dailyIntensityLevel">Intensity Level (1-6):</label>
                                        <select id="dailyIntensityLevel" name="dailyIntensityLevel">
                                            <option value="">Select intensity...</option>
                                            <option value="1">1 - Light 🚶</option>
                                            <option value="2">2 - Easy 🏃‍♀️</option>
                                            <option value="3">3 - Moderate 💪</option>
                                            <option value="4" selected>4 - Hard 🔥</option>
                                            <option value="5">5 - Very Hard 💥</option>
                                            <option value="6">6 - Extreme ⚡</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Duration Card -->
                                    <div class="form-field">
                                        <label for="timeConstraintsToday">Duration (minutes): <span class="required">*</span></label>
                                        <select id="timeConstraintsToday" name="timeConstraintsToday" required>
                                            <option value="">Select duration...</option>
                                            <option value="10">10 minutes</option>
                                            <option value="15">15 minutes</option>
                                            <option value="20">20 minutes</option>
                                            <option value="30" selected>30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Row 2: Equipment & Targeting -->
                                <div class="grid-cards-row">
                                    <h4>Equipment & Targeting</h4>
                                    
                                    <!-- Equipment Card -->
                                    <div class="form-field">
                                        <label for="equipmentAvailableToday">Available Equipment:</label>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="none"> None/Bodyweight</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="dumbbells" checked> Dumbbells</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="kettlebells"> Kettlebells</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="resistance_bands" checked> Resistance Bands</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="pull_up_bar"> Pull-up Bar</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="yoga_mat"> Yoga Mat</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="bench"> Bench</label>
                                            <label><input type="checkbox" name="equipmentAvailableToday[]" value="barbell"> Barbell</label>
                                        </div>
                                    </div>
                                    
                                    <!-- Target Muscles Card -->
                                    <div class="form-field">
                                        <label for="focusArea">Target Muscle Groups:</label>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" name="focusArea[]" value="chest" checked> Chest</label>
                                            <label><input type="checkbox" name="focusArea[]" value="back"> Back</label>
                                            <label><input type="checkbox" name="focusArea[]" value="shoulders" checked> Shoulders</label>
                                            <label><input type="checkbox" name="focusArea[]" value="arms"> Arms</label>
                                            <label><input type="checkbox" name="focusArea[]" value="legs"> Legs</label>
                                            <label><input type="checkbox" name="focusArea[]" value="glutes"> Glutes</label>
                                            <label><input type="checkbox" name="focusArea[]" value="core"> Core</label>
                                            <label><input type="checkbox" name="focusArea[]" value="full_body"> Full Body</label>
                                        </div>
                                    </div>
                                    
                                    <!-- Restrictions Card -->
                                    <div class="form-field">
                                        <label for="healthRestrictionsToday">Health Restrictions Today:</label>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="none"> No restrictions</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="knee" checked> Knee issues</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="back"> Back problems</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="shoulder"> Shoulder issues</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="wrist"> Wrist problems</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="ankle"> Ankle issues</label>
                                            <label><input type="checkbox" name="healthRestrictionsToday[]" value="neck"> Neck problems</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Row 3: Environment & Daily State -->
                                <div class="grid-cards-row">
                                    <h4>Environment & Daily State</h4>
                                    
                                    <!-- Location Card -->
                                    <div class="form-field">
                                        <label for="locationToday">Workout Location:</label>
                                        <select id="locationToday" name="locationToday">
                                            <option value="">Select location...</option>
                                            <option value="home" selected>🏠 Home</option>
                                            <option value="gym">🏋️ Gym</option>
                                            <option value="outdoors">🌳 Outdoors</option>
                                            <option value="travel">✈️ Travel</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Stress/Mood Card -->
                                    <div class="form-field">
                                        <label for="moodLevel">Stress Level (1-6):</label>
                                        <select id="moodLevel" name="moodLevel">
                                            <option value="">Select stress level...</option>
                                            <option value="1">1 - Very Low 🟢</option>
                                            <option value="2" selected>2 - Low 🔵</option>
                                            <option value="3">3 - Moderate 🟡</option>
                                            <option value="4">4 - High 🟠</option>
                                            <option value="5">5 - Very High 🔴</option>
                                            <option value="6">6 - Extreme 🟣</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Energy Card -->
                                    <div class="form-field">
                                        <label for="energyLevel">Energy Level (1-6):</label>
                                        <select id="energyLevel" name="energyLevel">
                                            <option value="">Select energy level...</option>
                                            <option value="1">1 - Very Low 🟢</option>
                                            <option value="2">2 - Low 🔵</option>
                                            <option value="3">3 - Moderate 🟡</option>
                                            <option value="4" selected>4 - High 🟠</option>
                                            <option value="5">5 - Very High 🔴</option>
                                            <option value="6">6 - Extreme 🟣</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Sleep Card -->
                                    <div class="form-field">
                                        <label for="sleepQuality">Sleep Quality (1-6):</label>
                                        <select id="sleepQuality" name="sleepQuality">
                                            <option value="">Select sleep quality...</option>
                                            <option value="1">1 - Very Poor 🟢</option>
                                            <option value="2">2 - Poor 🔵</option>
                                            <option value="3" selected>3 - Fair 🟡</option>
                                            <option value="4">4 - Good 🟠</option>
                                            <option value="5">5 - Great 🔴</option>
                                            <option value="6">6 - Excellent 🟣</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Row 4: Customization -->
                                <div class="grid-cards-row">
                                    <h4>Workout Customization</h4>
                                    
                                    <!-- Customization Card -->
                                    <div class="form-field">
                                        <label for="workoutCustomization">Custom Notes (optional):</label>
                                        <textarea id="workoutCustomization" name="workoutCustomization" rows="3" 
                                                  placeholder="Any specific requests, preferences, or modifications for today's workout..."
                                                  maxlength="500">Focus on compound movements, avoid isolation exercises</textarea>
                                        <div class="character-count">
                                            <span id="customization-count">67</span>/500 characters
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="form-actions">
                                <button type="button" id="test-grid-workout-btn" class="wg-button wg-button-primary">
                                    🧪 Test Profile + Grid Workout Generation
                                </button>
                                <button type="button" id="clear-grid-form-btn" class="wg-button wg-button-secondary">
                                    🗑️ Clear Grid Form
                                </button>
                            </div>
                        </form>

                        <!-- Grid Results Section -->
                        <div id="grid-test-results" class="wg-results-section">
                            <h3>Test Results</h3>
                            <div id="grid-test-output">
                                <div class="wg-debug-placeholder">
                                    <p>🧪 Ready to test profile + WorkoutGeneratorGrid generation</p>
                                    <p>Fill in the profile data and select WorkoutGeneratorGrid options above, then click "Test Profile + Grid Workout Generation"</p>
                                    <p><strong>Note:</strong> Duration is required for this test mode</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Testing Lab styles now in assets/css/prompt-builder/components/testing-lab.css -->
        
        <script>
        function toggleSection(contentId) {
            const content = document.getElementById(contentId);
            const header = content.previousElementSibling;
            const toggle = header.querySelector('.collapse-toggle .dashicons');
            
            if (content.classList.contains('collapsed')) {
                // Expand
                content.classList.remove('collapsed');
                header.classList.remove('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // Remove max-height after animation completes
                setTimeout(() => {
                    if (!content.classList.contains('collapsed')) {
                        content.style.maxHeight = 'none';
                    }
                }, 300);
            } else {
                // Collapse
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // Force reflow
                content.offsetHeight;
                
                content.classList.add('collapsed');
                header.classList.add('collapsed');
                content.style.maxHeight = '0';
            }
        }
        
        // Initialize collapsed state if needed
        document.addEventListener('DOMContentLoaded', function() {
            // You can set initial collapsed state here if desired
            // toggleSection('workout-tester-content');
        });
        </script>
        <?php
    }
} 