<?php

namespace FitCopilot\Admin\Debug\Views;

use FitCopilot\Modules\Core\ModuleManager;

/**
 * PromptBuilder View
 * 
 * Renders the PromptBuilder admin interface
 * 
 * Implements Strangler Fig pattern - gradually delegates functionality to modules
 * while maintaining backward compatibility with legacy code.
 */
class PromptBuilderView {
    
    private ModuleManager $moduleManager;
    
    public function __construct() {
        $this->moduleManager = ModuleManager::getInstance();
    }
    
    /**
     * Render profile form section using Strangler Fig pattern
     * 
     * If ProfileModule is available, delegate to it. Otherwise use legacy code.
     */
    private function renderProfileFormSection(array $data = []): string {
        // Strangler Fig: Try module first
        if ($this->moduleManager->hasCapability('profile_form_rendering')) {
            try {
                $profileModule = $this->moduleManager->getModuleForCapability('profile_form_rendering');
                return $profileModule->renderProfileForm($data);
            } catch (\Exception $e) {
                error_log('[PromptBuilderView] Module delegation failed, falling back to legacy: ' . $e->getMessage());
            }
        }
        
        // Fallback to legacy implementation
        return $this->renderLegacyProfileForm($data);
    }
    
    /**
     * Legacy profile form rendering (will be gradually replaced)
     */
    private function renderLegacyProfileForm(array $data = []): string {
        // This is where the current form HTML would go
        // For now, we'll keep using the existing inline approach
        return '';
    }
    
    /**
     * Render the main PromptBuilder interface
     */
    public function render($data) {
        $strategies = $data['strategies'] ?? [];
        $systemInfo = $data['systemInfo'] ?? [];
        $users = $data['users'] ?? [];
        $currentStrategy = $data['currentStrategy'] ?? 'SingleWorkoutStrategy';
        
        ?>
        <div class="wrap">
            <!-- Dashboard Header with Controls -->
            <div class="dashboard-header">
                <div class="dashboard-header-content">
                    <h1>🧠 PromptBuilder - AI Prompt Engineering</h1>
                    <p class="description">Engineer and test AI prompts with live preview, strategy inspection, and data flow analysis.</p>
                </div>
                <div class="dashboard-controls">
                    <!-- Dark mode toggle will be inserted here by JavaScript -->
                </div>
            </div>
            
            <!-- System Status -->
            <div class="prompt-builder-status">
                <div class="status-item">
                    <span class="status-label">Modular System:</span>
                    <span class="status-value <?php echo $systemInfo['modular_system_active'] ? 'active' : 'inactive'; ?>">
                        <?php echo $systemInfo['modular_system_active'] ? 'Active' : 'Inactive'; ?>
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">AI Provider:</span>
                    <span class="status-value"><?php echo esc_html($systemInfo['ai_provider'] ?? 'Unknown'); ?></span>
                </div>
                <div class="status-item">
                    <span class="status-label">Strategies Available:</span>
                    <span class="status-value"><?php echo intval($systemInfo['strategies_available'] ?? 0); ?></span>
                </div>
            </div>
            
            <!-- Main Interface -->
            <div class="prompt-builder-container">
                
                <!-- Left Panel: Form & Controls -->
                <div class="prompt-builder-left">
                    
                    <!-- Strategy Selection -->
                    <div class="builder-section">
                        <h3>🎯 Strategy Selection</h3>
                        <div class="strategy-controls">
                            <select id="strategy-selector" class="strategy-select">
                                <?php foreach ($strategies as $key => $strategy): ?>
                                    <option value="<?php echo esc_attr($key); ?>" <?php selected($key, $currentStrategy); ?>>
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
                            $currentStrategyData = $strategies[$currentStrategy] ?? [];
                            echo esc_html($currentStrategyData['description'] ?? 'No description available');
                            ?>
                        </div>
                    </div>
                    
                    <!-- User Profile Selection -->
                    <div class="builder-section">
                        <h3>👤 Test Profile</h3>
                        <div class="profile-controls">
                            <select id="user-selector" class="user-select">
                                <option value="">Select a user profile...</option>
                                <?php foreach ($users as $user): ?>
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
                    
                    <!-- Profile Form -->
                    <div class="builder-section">
                        <h3>📝 Profile Data</h3>
                        <form id="prompt-builder-form" class="prompt-form">
                            
                            <!-- Basic Information -->
                            <div class="form-group">
                                <h4>Basic Information</h4>
                                <div class="form-row">
                                    <input type="text" id="firstName" name="firstName" placeholder="First Name" class="form-input">
                                    <input type="text" id="lastName" name="lastName" placeholder="Last Name" class="form-input">
                                </div>
                                <div class="form-row">
                                    <select id="fitnessLevel" name="fitnessLevel" class="form-select">
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
                                    </select>
                                </div>
                                <div class="form-row">
                                    <input type="number" id="age" name="age" placeholder="Age" class="form-input" min="16" max="100">
                                    <input type="number" id="weight" name="weight" placeholder="Weight" class="form-input" min="50" max="500">
                                    <select id="weightUnit" name="weightUnit" class="form-select">
                                        <option value="lbs">lbs</option>
                                        <option value="kg">kg</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <!-- Height fields that change based on unit selection -->
                                    <div id="height-imperial" class="height-input-group" style="display: flex; gap: 5px; flex: 1;">
                                        <input type="number" id="heightFeet" name="heightFeet" placeholder="Feet" class="form-input" min="3" max="8" style="flex: 1;">
                                        <span class="height-separator">ft</span>
                                        <input type="number" id="heightInches" name="heightInches" placeholder="Inches" class="form-input" min="0" max="11" style="flex: 1;">
                                        <span class="height-separator">in</span>
                                    </div>
                                    <div id="height-metric" class="height-input-group" style="display: none; flex: 1;">
                                        <input type="number" id="heightCm" name="heightCm" placeholder="Height in cm" class="form-input" min="90" max="250">
                                    </div>
                                    <select id="heightUnit" name="heightUnit" class="form-select" onchange="toggleHeightFields(this.value)">
                                        <option value="ft">ft/in</option>
                                        <option value="cm">cm</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Goals & Focus -->
                            <div class="form-group">
                                <h4>Goals & Focus</h4>
                                <div class="form-row">
                                    <select id="primary-goal" name="primary-goal" class="form-select">
                                        <option value="">Primary Goal</option>
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="muscle_building">Muscle Building</option>
                                        <option value="strength">Strength Training</option>
                                        <option value="endurance">Endurance & Cardio</option>
                                        <option value="flexibility">Flexibility & Mobility</option>
                                        <option value="general_fitness">General Fitness</option>
                                        <option value="sport_specific">Sport-Specific</option>
                                    </select>
                                    <select id="workout-focus" name="workout-focus" class="form-select">
                                        <option value="">Today's Focus</option>
                                        <option value="upper_body">Upper Body</option>
                                        <option value="lower_body">Lower Body</option>
                                        <option value="full_body">Full Body</option>
                                        <option value="core">Core</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="flexibility">Flexibility</option>
                                    </select>
                                </div>
                                <div class="checkbox-grid" id="secondary-goals">
                                    <label><input type="checkbox" name="secondary-goals[]" value="weight_loss"> Weight Loss</label>
                                    <label><input type="checkbox" name="secondary-goals[]" value="muscle_building"> Muscle Building</label>
                                    <label><input type="checkbox" name="secondary-goals[]" value="strength"> Strength</label>
                                    <label><input type="checkbox" name="secondary-goals[]" value="endurance"> Endurance</label>
                                    <label><input type="checkbox" name="secondary-goals[]" value="flexibility"> Flexibility</label>
                                    <label><input type="checkbox" name="secondary-goals[]" value="general_fitness"> General Fitness</label>
                                </div>
                            </div>
                            
                            <!-- Equipment -->
                            <div class="form-group">
                                <h4>Available Equipment</h4>
                                <div class="checkbox-grid">
                                    <label><input type="checkbox" name="availableEquipment[]" value="bodyweight"> Bodyweight</label>
                                    <label><input type="checkbox" name="availableEquipment[]" value="dumbbells"> Dumbbells</label>
                                    <label><input type="checkbox" name="availableEquipment[]" value="barbell"> Barbell</label>
                                    <label><input type="checkbox" name="availableEquipment[]" value="resistance_bands"> Resistance Bands</label>
                                    <label><input type="checkbox" name="availableEquipment[]" value="pull_up_bar"> Pull-up Bar</label>
                                    <label><input type="checkbox" name="availableEquipment[]" value="kettlebells"> Kettlebells</label>
                                </div>
                            </div>
                            
                            <!-- Location & Preferences -->
                            <div class="form-group">
                                <h4>Location & Preferences</h4>
                                <div class="form-row">
                                    <select id="preferredLocation" name="preferredLocation" class="form-select">
                                        <option value="">Preferred Location</option>
                                        <option value="home">Home</option>
                                        <option value="gym">Gym</option>
                                        <option value="outdoor">Outdoor</option>
                                        <option value="travel">Travel/Hotel</option>
                                    </select>
                                    <select id="workoutFrequency" name="workoutFrequency" class="form-select">
                                        <option value="">Workout Frequency</option>
                                        <option value="1-2">1-2 times/week</option>
                                        <option value="3-4">3-4 times/week</option>
                                        <option value="5-6">5-6 times/week</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Session Parameters -->
                            <div class="form-group">
                                <h4>Today's Session</h4>
                                <div class="form-row">
                                    <select id="testDuration" name="testDuration" class="form-select">
                                        <option value="">Duration</option>
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                    </select>
                                    <select id="testFocus" name="testFocus" class="form-select">
                                        <option value="">Focus</option>
                                        <option value="strength">Strength</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="flexibility">Flexibility</option>
                                        <option value="full_body">Full Body</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <select id="intensity-preference" name="intensity-preference" class="form-select">
                                        <option value="">Intensity Preference</option>
                                        <option value="1">Light (1/6)</option>
                                        <option value="2">Easy (2/6)</option>
                                        <option value="3">Moderate (3/6)</option>
                                        <option value="4">Hard (4/6)</option>
                                        <option value="5">Very Hard (5/6)</option>
                                        <option value="6">Extreme (6/6)</option>
                                    </select>
                                </div>
                                <div class="form-row">
                                    <select id="energyLevel" name="energyLevel" class="form-select">
                                        <option value="">Energy Level</option>
                                        <option value="1">Very Low (1/6)</option>
                                        <option value="2">Low (2/6)</option>
                                        <option value="3">Moderate (3/6)</option>
                                        <option value="4">Good (4/6)</option>
                                        <option value="5">High (5/6)</option>
                                        <option value="6">Very High (6/6)</option>
                                    </select>
                                    <select id="stressLevel" name="stressLevel" class="form-select">
                                        <option value="">Stress Level</option>
                                        <option value="1">Very Low (1/6)</option>
                                        <option value="2">Low (2/6)</option>
                                        <option value="3">Moderate (3/6)</option>
                                        <option value="4">High (4/6)</option>
                                        <option value="5">Very High (5/6)</option>
                                        <option value="6">Extreme (6/6)</option>
                                    </select>
                                </div>
                                
                                <!-- Sleep Quality Module Integration -->
                                <?php
                                try {
                                    // Initialize Sleep Quality Module
                                    $moduleManager = \FitCopilot\Modules\Core\ModuleManager::getInstance();
                                    if ($moduleManager->hasModule('sleep_quality')) {
                                        $sleepModule = $moduleManager->getModule('sleep_quality');
                                        $sleepView = $sleepModule->getView();
                                        
                                        // Render sleep quality selection
                                        echo $sleepView->renderSleepQualitySelection([
                                            'current_quality' => $data['sleepQuality'] ?? null,
                                            'form_id' => 'prompt-builder-sleep'
                                        ]);
                                    } else {
                                        // Fallback if module not available
                                        echo '<div class="form-row">';
                                        echo '<select id="sleepQuality" name="sleepQuality" class="form-select">';
                                        echo '<option value="">Sleep Quality</option>';
                                        echo '<option value="1">Poor (1/5)</option>';
                                        echo '<option value="2">Below Average (2/5)</option>';
                                        echo '<option value="3">Average (3/5)</option>';
                                        echo '<option value="4">Good (4/5)</option>';
                                        echo '<option value="5">Excellent (5/5)</option>';
                                        echo '</select>';
                                        echo '</div>';
                                    }
                                } catch (\Exception $e) {
                                    error_log('[PromptBuilderView] Sleep Quality module integration error: ' . $e->getMessage());
                                    // Fallback dropdown
                                    echo '<div class="form-row">';
                                    echo '<select id="sleepQuality" name="sleepQuality" class="form-select">';
                                    echo '<option value="">Sleep Quality</option>';
                                    echo '<option value="1">Poor (1/5)</option>';
                                    echo '<option value="2">Below Average (2/5)</option>';
                                    echo '<option value="3">Average (3/5)</option>';
                                    echo '<option value="4">Good (4/5)</option>';
                                    echo '<option value="5">Excellent (5/5)</option>';
                                    echo '</select>';
                                    echo '</div>';
                                }
                                ?>
                            </div>
                            
                            <!-- Health Considerations -->
                            <div class="form-group">
                                <h4>Health Considerations</h4>
                                <div class="checkbox-grid">
                                    <label><input type="checkbox" name="limitations[]" value="lower_back"> Lower Back</label>
                                    <label><input type="checkbox" name="limitations[]" value="knee"> Knee</label>
                                    <label><input type="checkbox" name="limitations[]" value="shoulder"> Shoulder</label>
                                    <label><input type="checkbox" name="limitations[]" value="wrist"> Wrist</label>
                                    <label><input type="checkbox" name="limitations[]" value="ankle"> Ankle</label>
                                    <label><input type="checkbox" name="limitations[]" value="neck"> Neck</label>
                                </div>
                                <textarea id="limitationNotes" name="limitationNotes" placeholder="Additional limitation notes..." class="form-textarea" rows="2"></textarea>
                                <textarea id="medicalConditions" name="medicalConditions" placeholder="Medical conditions to consider..." class="form-textarea" rows="2"></textarea>
                                <textarea id="injuries" name="injuries" placeholder="Previous or current injuries..." class="form-textarea" rows="2"></textarea>
                            </div>
                            
                            <!-- Target Muscles -->
                            <div class="form-group">
                                <h4>Target Muscles</h4>
                                <?php
                                // Delegate to MuscleModule if available, otherwise show basic fallback
                                if ($this->moduleManager->hasCapability('muscle_group_selection')) {
                                    try {
                                        $muscleModule = $this->moduleManager->getModuleForCapability('muscle_group_selection');
                                        echo $muscleModule->renderMuscleForm([
                                            'form_id' => 'prompt-builder-muscles',
                                            'current_selection' => $data['muscleSelection'] ?? null
                                        ]);
                                    } catch (\Exception $e) {
                                        error_log('[PromptBuilderView] Muscle module delegation failed: ' . $e->getMessage());
                                        // Fallback to basic muscle group selection
                                        echo $this->renderBasicMuscleSelection();
                                    }
                                } else {
                                    // Basic fallback if module not available
                                    echo $this->renderBasicMuscleSelection();
                                }
                                ?>
                            </div>
                            
                            <!-- Exercise Preferences -->
                            <div class="form-group">
                                <h4>Exercise Preferences</h4>
                                <textarea id="favoriteExercises" name="favoriteExercises" placeholder="Exercises you enjoy or prefer..." class="form-textarea" rows="2"></textarea>
                                <textarea id="dislikedExercises" name="dislikedExercises" placeholder="Exercises to avoid or dislike..." class="form-textarea" rows="2"></textarea>
                            </div>
                            
                            <!-- Custom Notes -->
                            <div class="form-group">
                                <h4>Custom Instructions</h4>
                                <textarea id="customNotes" name="customNotes" placeholder="Any specific workout preferences or instructions..." class="form-textarea" rows="3"></textarea>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="form-actions">
                                <button type="button" id="generate-prompt" class="button button-primary">
                                    🚀 Generate Live Prompt
                                </button>
                                <button type="button" id="inspect-context" class="button button-secondary">
                                    🔍 Inspect Context
                                </button>
                                <button type="button" id="test-workout" class="button button-secondary">
                                    🏋️ Test Workout Generation
                                </button>
                                <button type="reset" class="button">
                                    🧹 Clear Form
                                </button>
                            </div>
                        </form>
                    </div>
                    
                </div>
                
                <!-- Right Panel: Results & Analysis -->
                <div class="prompt-builder-right">
                    
                    <!-- Strategy Code Viewer -->
                    <div class="builder-section">
                        <div class="section-header-controls">
                            <h3>📋 Strategy Code</h3>
                            <div class="code-controls">
                                <button id="view-strategy-code" class="button button-secondary">
                                    📋 View Code
                                </button>
                                <button id="copy-strategy-code" class="button button-small" style="display: none;">
                                    📋 Copy
                                </button>
                                <button id="toggle-line-numbers" class="button button-small" style="display: none;">
                                    #️⃣ Lines
                                </button>
                            </div>
                        </div>
                        <div id="strategy-code-viewer" class="strategy-code-viewer">
                            <div class="code-placeholder">
                                <p>📋 Strategy code will appear here</p>
                                <p>Click "View Code" to see the actual PHP code that generates prompts.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Live Prompt Preview -->
                    <div class="builder-section">
                        <div class="section-header-controls">
                            <h3>📝 Live Prompt Preview</h3>
                            <div class="prompt-controls">
                                <button id="export-prompt" class="button button-small" style="display: none;">
                                    💾 Export
                                </button>
                                <button id="copy-prompt" class="button button-small" style="display: none;">
                                    📋 Copy
                                </button>
                                <button id="clear-prompt" class="button button-small" style="display: none;">
                                    🧹 Clear
                                </button>
                            </div>
                        </div>
                        <div id="prompt-preview" class="prompt-preview">
                            <div class="prompt-placeholder">
                                <p>🎯 Ready to generate live prompts</p>
                                <p>Fill in the profile data and click "Generate Live Prompt" to see the AI prompt in real-time.</p>
                            </div>
                        </div>
                        <div id="prompt-stats" class="prompt-stats" style="display: none;">
                            <div class="stat-item">
                                <span class="stat-value" id="prompt-characters">0</span>
                                <span class="stat-label">chars</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="prompt-words">0</span>
                                <span class="stat-label">words</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="prompt-tokens">0</span>
                                <span class="stat-label">~tokens</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="prompt-lines">0</span>
                                <span class="stat-label">lines</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Test Workout Generation -->
                    <div class="builder-section">
                        <div class="section-header-controls">
                            <h3>🧪 Test Workout Generation</h3>
                            <div class="workout-controls">
                                <button id="test-workout" class="button button-secondary">
                                    🏋️ Test Workout Generation
                                </button>
                                <button id="export-workout" class="button button-small" style="display: none;">
                                    💾 Export Workout
                                </button>
                                <button id="save-workout" class="button button-small" style="display: none;">
                                    💾 Save
                                </button>
                            </div>
                        </div>
                        <div id="workout-test-preview" class="workout-test-preview">
                            <div class="workout-placeholder">
                                <p>🏋️ Workout generation test results will appear here</p>
                                <p>Click "Test Workout Generation" to see the full workout generation flow with performance metrics.</p>
                            </div>
                        </div>
                        <div id="workout-performance" class="workout-performance" style="display: none;">
                            <div class="perf-item">
                                <span class="perf-label">⏱️ Generated in:</span>
                                <span class="perf-value" id="workout-time">0ms</span>
                            </div>
                            <div class="perf-item">
                                <span class="perf-label">🎯 Match Score:</span>
                                <span class="perf-value" id="workout-match">0%</span>
                            </div>
                            <div class="perf-item">
                                <span class="perf-label">💰 Est. Cost:</span>
                                <span class="perf-value" id="workout-cost">$0.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Context Inspector -->
                    <div class="builder-section">
                        <div class="section-header-controls">
                            <h3>🔍 Context Inspector</h3>
                            <div class="context-controls">
                                <input type="text" id="context-search" placeholder="Search fields..." class="context-search" style="display: none;">
                                <button id="toggle-compact-view" class="button button-small" style="display: none;">
                                    📦 Compact
                                </button>
                                <button id="expand-all-context" class="button button-small" style="display: none;">
                                    📂 Expand All
                                </button>
                            </div>
                        </div>
                        <div id="context-inspector" class="context-inspector">
                            <div class="context-placeholder">
                                <p>🔍 Context data will appear here</p>
                                <p>Click "Inspect Context" to see how your form data is processed and structured for AI generation.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dual Preview System -->
                    <div class="builder-section">
                        <div class="section-header-controls">
                            <h3>🔄 Dual Preview System</h3>
                            <div class="preview-controls">
                                <button id="refresh-previews" class="button button-secondary">
                                    🔄 Refresh Both
                                </button>
                                <button id="toggle-preview-layout" class="button button-small">
                                    📱 Layout
                                </button>
                            </div>
                        </div>
                        <div class="dual-preview-container">
                            <!-- Workout Preview -->
                            <div class="preview-panel">
                                <h4>🏋️ Workout Preview</h4>
                                <div id="workout-preview" class="preview-content">
                                    <div class="preview-placeholder">
                                        <p>🏋️ Workout preview will appear here</p>
                                        <p>Real-time workout generation preview based on current form data.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Strategy Preview -->
                            <div class="preview-panel">
                                <h4>🎯 Strategy Preview</h4>
                                <div id="strategy-preview" class="preview-content">
                                    <div class="preview-placeholder">
                                        <p>🎯 Strategy preview will appear here</p>
                                        <p>Real-time strategy analysis and prompt structure preview.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <!-- Status Messages -->
            <div id="prompt-builder-messages" class="prompt-builder-messages"></div>
            
        </div>
        
        <style>
        .prompt-builder-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .prompt-builder-status {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        
        .status-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .status-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        
        .status-value {
            font-weight: bold;
        }
        
        .status-value.active {
            color: #46b450;
        }
        
        .status-value.inactive {
            color: #dc3232;
        }
        
        .builder-section {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .builder-section h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .strategy-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .strategy-select, .user-select {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .strategy-description {
            font-size: 14px;
            color: #666;
            font-style: italic;
        }
        
        .profile-controls {
            display: flex;
            gap: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
        }
        
        .form-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .form-input, .form-select, .form-textarea {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .form-input, .form-select {
            flex: 1;
        }
        
        .form-textarea {
            width: 100%;
            resize: vertical;
        }
        
        .height-input-group {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .height-separator {
            font-size: 12px;
            color: #666;
            font-weight: bold;
            margin: 0 2px;
        }
        
        .muscle-selection-container {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            background: #f9f9f9;
        }
        
        .muscle-groups-section, .specific-muscles-section {
            margin-bottom: 15px;
        }
        
        .muscle-section-label {
            display: block;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        
        .muscle-groups-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .muscle-group-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #ffffff;
            transition: all 0.2s ease;
        }
        
        .muscle-group-item:hover {
            border-color: #3b82f6;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
        
        .muscle-group-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            cursor: pointer;
            font-weight: 500;
            user-select: none;
            transition: background-color 0.2s ease;
        }
        
        .muscle-group-label:hover {
            background-color: #f8fafc;
        }
        
        .muscle-group-label input[type="checkbox"] {
            margin-right: 8px;
            transform: scale(1.1);
        }
        
        .expand-indicator {
            font-size: 12px;
            color: #6b7280;
            transition: transform 0.2s ease;
            margin-left: auto;
        }
        
        .muscle-group-item.expanded .expand-indicator {
            transform: rotate(180deg);
        }
        
        .muscle-detail-grid {
            border-top: 1px solid #e5e7eb;
            padding: 16px;
            background: #f9fafb;
            animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
                padding-top: 0;
                padding-bottom: 0;
            }
            to {
                opacity: 1;
                max-height: 200px;
                padding-top: 16px;
                padding-bottom: 16px;
            }
        }
        
        .muscle-options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 8px;
        }
        
        .muscle-options-grid label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .muscle-options-grid label:hover {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
        
        .muscle-options-grid label input[type="checkbox"]:checked + span {
            color: #1e40af;
            font-weight: 600;
        }
        
        .muscle-options-grid label:has(input[type="checkbox"]:checked) {
            border-color: #3b82f6;
            background-color: #dbeafe;
        }
        
        .muscle-actions-section {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }
        
        .muscle-selection-summary {
            margin-top: 12px;
            padding: 12px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            font-size: 14px;
            color: #0c4a6e;
        }
        
        .muscle-selection-summary.empty {
            background: #f9fafb;
            border-color: #e5e7eb;
            color: #6b7280;
        }
        
        .muscle-count-badge {
            display: inline-block;
            background: #3b82f6;
            color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: 4px;
            font-weight: 600;
        }
        
        .prompt-preview, .context-inspector, .strategy-code-viewer, .workout-test-preview {
            min-height: 250px;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            background: #f9f9f9;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .strategy-code-viewer {
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .strategy-code-viewer.with-line-numbers {
            padding-left: 45px;
            position: relative;
        }
        
        .code-line-numbers {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 40px;
            background: #252526;
            border-right: 1px solid #3e3e42;
            color: #858585;
            font-size: 12px;
            line-height: 1.4;
            padding: 15px 5px;
            text-align: right;
        }
        
        .workout-test-preview {
            background: #fff;
            color: #333;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .workout-test-results .workout-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
            padding: 10px;
            background: #e3f2fd;
            border-radius: 4px;
            border-left: 3px solid #2196f3;
        }
        
        .workout-test-results .meta-item {
            display: flex;
            flex-direction: column;
        }
        
        .workout-test-results .meta-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        
        .workout-test-results .meta-value {
            font-weight: 600;
            color: #1976d2;
        }
        
        .workout-test-results .workout-content {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .workout-section {
            margin-bottom: 20px;
            border-left: 3px solid #3b82f6;
            padding-left: 15px;
        }
        
        .workout-section h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-weight: 600;
        }
        
        .exercise-item {
            margin-bottom: 8px;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
            border-left: 2px solid #10b981;
        }
        
        .prompt-placeholder, .context-placeholder, .code-placeholder, .workout-placeholder {
            text-align: center;
            color: #666;
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .prompt-stats {
            display: flex;
            justify-content: space-around;
            padding: 12px;
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
        }
        
        .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
        }
        
        .workout-performance {
            display: flex;
            justify-content: space-around;
            padding: 12px;
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        .perf-item {
            text-align: center;
        }
        
        .perf-label {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
        }
        
        .perf-value {
            font-size: 14px;
            font-weight: 600;
            color: #16a34a;
        }
        
        .context-search {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            width: 150px;
        }
        
        .context-tree {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .context-branch {
            margin-left: 20px;
            border-left: 1px dashed #ddd;
            padding-left: 15px;
            margin-bottom: 8px;
        }
        
        .context-field {
            padding: 4px 8px;
            margin-bottom: 4px;
            border-radius: 3px;
            background: #f8fafc;
        }
        
        .context-field.missing {
            background: #fef2f2;
            border-left: 3px solid #ef4444;
        }
        
        .context-field-name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .context-field-type {
            font-size: 10px;
            color: #6b7280;
            background: #e5e7eb;
            padding: 1px 4px;
            border-radius: 2px;
            margin-left: 5px;
        }
        
        .context-field-value {
            color: #059669;
            margin-left: 8px;
        }
        
        .prompt-builder-messages {
            position: fixed;
            top: 32px;
            right: 20px;
            z-index: 999999;
            max-width: 400px;
        }
        
        .prompt-message {
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .prompt-message.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .prompt-message.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .prompt-message.info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        
        .section-header-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .code-controls, .prompt-controls, .workout-controls, .context-controls {
            display: flex;
            gap: 10px;
        }
        
        .code-controls button, .prompt-controls button, .workout-controls button, .context-controls button {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        @media (max-width: 1200px) {
            .prompt-builder-container {
                grid-template-columns: 1fr;
            }
        }
        
        .muscle-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .muscle-icon {
            font-size: 16px;
        }
        
        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
        }
        
        .checkbox-grid label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
        }
        
        .form-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            const PromptBuilder = {
                init() {
                    this.bindEvents();
                    this.setupFormValidation();
                },
                
                bindEvents() {
                    // Original events
                    $('#strategy-selector').on('change', this.onStrategyChange.bind(this));
                    $('#user-selector').on('change', this.onUserSelectionChange.bind(this));
                    $('#load-profile').on('click', this.loadUserProfile.bind(this));
                    $('#generate-prompt').on('click', this.generateLivePrompt.bind(this));
                    $('#inspect-context').on('click', this.inspectContext.bind(this));
                    $('#view-strategy-code').on('click', this.viewStrategyCode.bind(this));
                    $('#test-workout').on('click', this.testWorkoutGeneration.bind(this));
                    
                    // New dual preview system events
                    $('#copy-strategy-code').on('click', this.copyStrategyCode.bind(this));
                    $('#toggle-line-numbers').on('click', this.toggleLineNumbers.bind(this));
                    $('#export-prompt').on('click', this.exportPrompt.bind(this));
                    $('#copy-prompt').on('click', this.copyPrompt.bind(this));
                    $('#clear-prompt').on('click', this.clearPrompt.bind(this));
                    $('#export-workout').on('click', this.exportWorkout.bind(this));
                    $('#save-workout').on('click', this.saveWorkout.bind(this));
                    $('#context-search').on('input', this.searchContext.bind(this));
                    $('#toggle-compact-view').on('click', this.toggleCompactView.bind(this));
                    $('#expand-all-context').on('click', this.expandAllContext.bind(this));
                },
                
                setupFormValidation() {
                    // Add real-time form validation here if needed
                },
                
                onStrategyChange() {
                    // Handle strategy selection change
                    this.clearResults();
                },
                
                onUserSelectionChange() {
                    const userId = $('#user-selector').val();
                    $('#load-profile').prop('disabled', !userId);
                },
                
                loadUserProfile() {
                    const userId = $('#user-selector').val();
                    if (!userId) return;
                    
                    this.showLoading('Loading user profile...');
                    
                    $.post(ajaxurl, {
                        action: 'fitcopilot_prompt_builder_load_profile',
                        nonce: '<?php echo wp_create_nonce('fitcopilot_prompt_builder'); ?>',
                        user_id: userId
                    })
                    .done(response => {
                        if (response.success) {
                            // Extract the actual profile data from the nested response
                            const profileData = response.data.data.profile_data;
                            this.populateForm(profileData);
                            this.showMessage('Profile loaded successfully', 'success');
                        } else {
                            this.showMessage('Failed to load profile: ' + response.data.message, 'error');
                        }
                    })
                    .fail(() => {
                        this.showMessage('Error loading profile', 'error');
                    })
                    .always(() => {
                        this.hideLoading();
                    });
                },
                
                generateLivePrompt() {
                    const formData = this.collectFormData();
                    const strategy = $('#strategy-selector').val();
                    
                    this.showLoading('Generating live prompt...');
                    
                    $.post(ajaxurl, {
                        action: 'fitcopilot_prompt_builder_generate',
                        nonce: '<?php echo wp_create_nonce('fitcopilot_prompt_builder'); ?>',
                        form_data: JSON.stringify(formData),
                        strategy: strategy
                    })
                    .done(response => {
                        if (response.success) {
                            this.displayPromptPreview(response.data);
                            this.showMessage('Prompt generated successfully', 'success');
                        } else {
                            this.showMessage('Failed to generate prompt: ' + response.data.message, 'error');
                        }
                    })
                    .fail(() => {
                        this.showMessage('Error generating prompt', 'error');
                    })
                    .always(() => {
                        this.hideLoading();
                    });
                },
                
                inspectContext() {
                    const formData = this.collectFormData();
                    
                    this.showLoading('Inspecting context data...');
                    
                    $.post(ajaxurl, {
                        action: 'fitcopilot_prompt_builder_get_context',
                        nonce: '<?php echo wp_create_nonce('fitcopilot_prompt_builder'); ?>',
                        form_data: JSON.stringify(formData)
                    })
                    .done(response => {
                        if (response.success) {
                            this.displayContextInspector(response.data);
                            this.showMessage('Context data loaded', 'success');
                        } else {
                            this.showMessage('Failed to inspect context: ' + response.data.message, 'error');
                        }
                    })
                    .fail(() => {
                        this.showMessage('Error inspecting context', 'error');
                    })
                    .always(() => {
                        this.hideLoading();
                    });
                },
                
                viewStrategyCode() {
                    const strategy = $('#strategy-selector').val() || 'single_workout';
                    
                    this.showLoading('Loading strategy code...');
                    
                    $.post(ajaxurl, {
                        action: 'fitcopilot_prompt_builder_view_code',
                        nonce: '<?php echo wp_create_nonce('fitcopilot_prompt_builder'); ?>',
                        strategy_name: strategy
                    })
                    .done(response => {
                        console.log('Strategy code response:', response);
                        if (response.success) {
                            this.displayStrategyCode(response.data);
                            this.showMessage('Strategy code loaded', 'success');
                        } else {
                            console.error('Strategy code error:', response);
                            this.showMessage('Failed to load strategy code: ' + (response.data?.message || response.message || 'Unknown error'), 'error');
                        }
                    })
                    .fail((xhr, status, error) => {
                        console.error('AJAX fail:', xhr.responseText, status, error);
                        this.showMessage('Error loading strategy code: ' + error, 'error');
                    })
                    .always(() => {
                        this.hideLoading();
                    });
                },
                
                testWorkoutGeneration() {
                    const formData = this.collectFormData();
                    
                    this.showLoading('Testing workout generation...');
                    
                    $.post(ajaxurl, {
                        action: 'fitcopilot_prompt_builder_test_workout',
                        nonce: '<?php echo wp_create_nonce('fitcopilot_prompt_builder'); ?>',
                        profile_data: JSON.stringify(formData)
                    })
                    .done(response => {
                        if (response.success) {
                            this.displayWorkoutTest(response.data);
                            this.showMessage('Workout test completed', 'success');
                        } else {
                            this.showMessage('Workout test failed: ' + response.data.message, 'error');
                        }
                    })
                    .fail(() => {
                        this.showMessage('Error testing workout generation', 'error');
                    })
                    .always(() => {
                        this.hideLoading();
                    });
                },
                
                // NEW DUAL PREVIEW SYSTEM FUNCTIONS
                
                copyStrategyCode() {
                    const codeContent = $('#strategy-code-viewer').text();
                    if (!codeContent || codeContent.includes('Strategy code will appear here')) {
                        this.showMessage('No code to copy', 'info');
                        return;
                    }
                    
                    this.copyToClipboard(codeContent).then(() => {
                        this.showMessage('Strategy code copied to clipboard', 'success');
                    }).catch(() => {
                        this.showMessage('Failed to copy strategy code', 'error');
                    });
                },
                
                toggleLineNumbers() {
                    const viewer = $('#strategy-code-viewer');
                    const button = $('#toggle-line-numbers');
                    
                    if (viewer.hasClass('with-line-numbers')) {
                        viewer.removeClass('with-line-numbers');
                        viewer.find('.code-line-numbers').remove();
                        button.text('#️⃣ Lines');
                    } else {
                        viewer.addClass('with-line-numbers');
                        this.addLineNumbers();
                        button.text('🔧 Hide Lines');
                    }
                },
                
                addLineNumbers() {
                    const viewer = $('#strategy-code-viewer');
                    const content = viewer.html();
                    const lines = content.split('\n');
                    let lineNumbers = '<div class="code-line-numbers">';
                    
                    for (let i = 1; i <= lines.length; i++) {
                        lineNumbers += i + '\n';
                    }
                    lineNumbers += '</div>';
                    
                    viewer.prepend(lineNumbers);
                },
                
                exportPrompt() {
                    const promptContent = $('#prompt-preview').text();
                    if (!promptContent || promptContent.includes('Ready to generate live prompts')) {
                        this.showMessage('No prompt to export', 'info');
                        return;
                    }
                    
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
                    const filename = `prompt_${timestamp}.txt`;
                    this.downloadAsFile(promptContent, filename);
                    this.showMessage('Prompt exported successfully', 'success');
                },
                
                copyPrompt() {
                    const promptContent = $('#prompt-preview').text();
                    if (!promptContent || promptContent.includes('Ready to generate live prompts')) {
                        this.showMessage('No prompt to copy', 'info');
                        return;
                    }
                    
                    this.copyToClipboard(promptContent).then(() => {
                        this.showMessage('Prompt copied to clipboard', 'success');
                    }).catch(() => {
                        this.showMessage('Failed to copy prompt', 'error');
                    });
                },
                
                clearPrompt() {
                    $('#prompt-preview').html(`
                        <div class="prompt-placeholder">
                            <p>🎯 Ready to generate live prompts</p>
                            <p>Fill in the profile data and click "Generate Live Prompt" to see the AI prompt in real-time.</p>
                        </div>
                    `);
                    $('#prompt-stats').hide();
                    $('.prompt-controls button').hide();
                    this.showMessage('Prompt cleared', 'info');
                },
                
                exportWorkout() {
                    const workoutContent = $('#workout-test-preview').text();
                    if (!workoutContent || workoutContent.includes('Workout generation test results will appear here')) {
                        this.showMessage('No workout to export', 'info');
                        return;
                    }
                    
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
                    const filename = `workout_${timestamp}.txt`;
                    this.downloadAsFile(workoutContent, filename);
                    this.showMessage('Workout exported successfully', 'success');
                },
                
                saveWorkout() {
                    const workoutContent = $('#workout-test-preview').html();
                    if (!workoutContent || workoutContent.includes('Workout generation test results will appear here')) {
                        this.showMessage('No workout to save', 'info');
                        return;
                    }
                    
                    // Here you would normally save to WordPress database
                    // For now, just show a message
                    this.showMessage('Workout save functionality coming soon!', 'info');
                },
                
                searchContext() {
                    const searchTerm = $('#context-search').val().toLowerCase();
                    const contextViewer = $('#context-inspector');
                    
                    if (!searchTerm) {
                        contextViewer.find('.context-field').show();
                        return;
                    }
                    
                    contextViewer.find('.context-field').each(function() {
                        const text = $(this).text().toLowerCase();
                        if (text.includes(searchTerm)) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                },
                
                toggleCompactView() {
                    const contextViewer = $('#context-inspector');
                    const button = $('#toggle-compact-view');
                    
                    if (contextViewer.hasClass('compact-view')) {
                        contextViewer.removeClass('compact-view');
                        button.text('📦 Compact');
                    } else {
                        contextViewer.addClass('compact-view');
                        button.text('📋 Expanded');
                    }
                },
                
                expandAllContext() {
                    $('#context-inspector .context-branch').removeClass('collapsed');
                    $('#expand-all-context').text('📁 Collapse All');
                },
                
                collectFormData() {
                    console.log('[PromptBuilder] Collecting form data...');
                    
                    // Collect flat form data first
                    const flatData = {};
                    $('#prompt-builder-form').serializeArray().forEach(item => {
                        if (flatData[item.name]) {
                            if (!Array.isArray(flatData[item.name])) {
                                flatData[item.name] = [flatData[item.name]];
                            }
                            flatData[item.name].push(item.value);
                        } else {
                            flatData[item.name] = item.value;
                        }
                    });
                    
                    console.log('[PromptBuilder] Flat form data:', flatData);
                    
                    // Structure the data as expected by backend
                    const structuredData = {
                        basic_info: {
                            name: (flatData.firstName || '') + ' ' + (flatData.lastName || ''),
                            age: parseInt(flatData.age) || 0,
                            gender: flatData.gender || undefined,
                            fitness_level: flatData.fitnessLevel || undefined,
                            weight: parseInt(flatData.weight) || 0,
                            height: parseInt(flatData.height) || 0
                        },
                        goals: {
                            primary_goal: flatData['goals[]'] || undefined,
                            secondary_goals: [],
                            target_areas: []
                        },
                        equipment: flatData['availableEquipment[]'] || [],
                        session_params: {
                            duration: parseInt(flatData.testDuration) || 30,
                            focus: flatData.testFocus || undefined,
                            energy_level: parseInt(flatData.energyLevel) || 3,
                            stress_level: parseInt(flatData.stressLevel) || 3,
                            sleep_quality: parseInt(flatData.sleepQuality) || 3
                        },
                        limitations: {
                            injuries: flatData.injuries || undefined,
                            restrictions: flatData.restrictions || undefined,
                            preferences: flatData['limitations[]'] || undefined
                        },
                        custom_instructions: flatData.customInstructions || undefined
                    };
                    
                    console.log('[PromptBuilder] Structured form data:', structuredData);
                    return structuredData;
                },
                
                populateForm(profileData) {
                    console.log('Populating form with profile data:', profileData);
                    
                    // Map nested profile data to form fields
                    if (profileData.basic_info) {
                        const basic = profileData.basic_info;
                        
                        // Split name into first/last if it's combined
                        if (basic.name) {
                            const nameParts = basic.name.split(' ');
                            $('#firstName').val(nameParts[0] || '');
                            $('#lastName').val(nameParts.slice(1).join(' ') || '');
                        }
                        
                        // Basic info fields
                        $('#age').val(basic.age || '');
                        $('#gender').val(basic.gender || '');
                        $('#fitnessLevel').val(basic.fitness_level || '');
                        $('#weight').val(basic.weight || '');
                        // Convert height from inches to feet/inches format if needed
                        if (basic.height) {
                            const totalInches = parseInt(basic.height);
                            const feet = Math.floor(totalInches / 12);
                            const inches = totalInches % 12;
                            $('#heightFeet').val(feet);
                            $('#heightInches').val(inches);
                        }
                    }
                    
                    // Handle goals
                    if (profileData.goals) {
                        // Set primary goal dropdown
                        if (profileData.goals.primary_goal && Array.isArray(profileData.goals.primary_goal) && profileData.goals.primary_goal.length > 0) {
                            $('#primary-goal').val(profileData.goals.primary_goal[0]);
                        }
                        
                        // Handle secondary goals (checkboxes)
                        if (profileData.goals.primary_goal) {
                        // Clear all goal checkboxes first
                            $('input[name="secondary-goals[]"]').prop('checked', false);
                        
                        // Check the goals from profile
                        profileData.goals.primary_goal.forEach(goal => {
                                $(`input[name="secondary-goals[]"][value="${goal}"]`).prop('checked', true);
                        });
                        }
                    }
                    
                    // Handle equipment (checkboxes)
                    if (profileData.equipment && Array.isArray(profileData.equipment)) {
                        // Clear all equipment checkboxes first
                        $('input[name="availableEquipment[]"]').prop('checked', false);
                        
                        // Check the equipment from profile
                        profileData.equipment.forEach(equip => {
                            $(`input[name="availableEquipment[]"][value="${equip}"]`).prop('checked', true);
                        });
                    }
                    
                    // Handle session parameters
                    if (profileData.session_params) {
                        const session = profileData.session_params;
                        $('#testDuration').val(session.duration || '');
                        $('#testFocus').val(session.focus || '');
                        $('#energyLevel').val(session.energy_level || '');
                        $('#stressLevel').val(session.stress_level || '');
                    }
                    
                    // Handle limitations (checkboxes)
                    if (profileData.limitations) {
                        // Clear all limitation checkboxes first
                        $('input[name="limitations[]"]').prop('checked', false);
                        
                        // Check limitations if they exist
                        if (profileData.limitations.preferences && Array.isArray(profileData.limitations.preferences)) {
                            profileData.limitations.preferences.forEach(pref => {
                                $(`input[name="limitations[]"][value="${pref}"]`).prop('checked', true);
                            });
                        }
                    }
                    
                    console.log('Form population completed');
                },
                
                displayPromptPreview(data) {
                    const html = `
                        <div class="prompt-stats">
                            <div class="stat-item">Characters: ${data.stats.characters}</div>
                            <div class="stat-item">Words: ${data.stats.words}</div>
                            <div class="stat-item">Lines: ${data.stats.lines}</div>
                            <div class="stat-item">Est. Tokens: ${data.stats.estimated_tokens}</div>
                        </div>
                        <div class="prompt-content">
                            <pre>${this.escapeHtml(data.prompt)}</pre>
                        </div>
                    `;
                    $('#prompt-preview').html(html);
                },
                
                displayContextInspector(data) {
                    const html = `
                        <div class="context-summary">
                            <h4>Context Summary</h4>
                            <div>Total Fields: ${data.total_fields}</div>
                            <div>Profile Fields: ${Object.keys(data.profile_context).length}</div>
                            <div>Session Fields: ${Object.keys(data.session_context).length}</div>
                        </div>
                        <div class="context-data">
                            <h4>Profile Context</h4>
                            <pre>${JSON.stringify(data.profile_context, null, 2)}</pre>
                            <h4>Session Context</h4>
                            <pre>${JSON.stringify(data.session_context, null, 2)}</pre>
                        </div>
                    `;
                    $('#context-inspector').html(html);
                },
                
                displayStrategyCode(data) {
                    const html = `
                        <div class="code-info">
                            <h4>${data.strategy_name || 'Unknown'} Strategy</h4>
                            <div>File: ${data.file_path}</div>
                            <div>Lines: ${data.class_info.lines}</div>
                            <div>Size: ${data.class_info.file_size} bytes</div>
                        </div>
                        <div class="code-content">
                            <h4>buildPrompt() Method</h4>
                            <div>Full code shown below</div>
                            <pre>${this.escapeHtml(data.code_content)}</pre>
                        </div>
                    `;
                    $('#strategy-code-viewer').html(html);
                },
                
                displayWorkoutTest(data) {
                    // Display workout test results in the correct container
                    const html = `
                        <div class="workout-test-results">
                            <h4>Workout Test Results</h4>
                            <div class="workout-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Generated:</span>
                                    <span class="meta-value">${new Date().toLocaleTimeString()}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Test ID:</span>
                                    <span class="meta-value">${data.test_id || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="workout-content">
                                <pre>${JSON.stringify(data, null, 2)}</pre>
                            </div>
                        </div>
                    `;
                    $('#workout-test-preview').html(html);
                    
                    // Show workout controls and performance metrics
                    $('.workout-controls #export-workout, .workout-controls #save-workout').show();
                    $('#workout-performance').show();
                },
                
                clearResults() {
                    $('#prompt-preview, #context-inspector, #strategy-code-viewer').html(`
                        <div class="prompt-placeholder">
                            <p>Results cleared</p>
                        </div>
                    `);
                },
                
                showLoading(message) {
                    this.showMessage(message, 'info');
                },
                
                hideLoading() {
                    // Loading messages will auto-hide
                },
                
                showMessage(message, type = 'info') {
                    const messageEl = $(`
                        <div class="prompt-message ${type}">
                            ${this.escapeHtml(message)}
                        </div>
                    `);
                    
                    $('#prompt-builder-messages').append(messageEl);
                    
                    setTimeout(() => {
                        messageEl.fadeOut(() => messageEl.remove());
                    }, type === 'error' ? 5000 : 3000);
                },
                
                escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                },
                
                copyToClipboard(text) {
                    if (navigator.clipboard && window.isSecureContext) {
                        return navigator.clipboard.writeText(text);
                    } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            return Promise.resolve();
                        } catch (err) {
                            document.body.removeChild(textArea);
                            return Promise.reject(err);
                        }
                    }
                },
                
                downloadAsFile(content, filename) {
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            };
            
            PromptBuilder.init();
        });
        
        // Height field toggle function
        function toggleHeightFields(unit) {
            const imperialFields = document.getElementById('height-imperial');
            const metricFields = document.getElementById('height-metric');
            
            if (unit === 'ft') {
                imperialFields.style.display = 'flex';
                metricFields.style.display = 'none';
            } else {
                imperialFields.style.display = 'none';
                metricFields.style.display = 'flex';
            }
        }
        
        // Height conversion utilities
        function convertHeightToInches(feet, inches) {
            return (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
        }
        
        function convertInchesToFeetInches(totalInches) {
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            return { feet, inches };
        }
        
        function convertInchesToCm(inches) {
            return Math.round(inches * 2.54);
        }
        
        function convertCmToInches(cm) {
            return Math.round(cm / 2.54);
        }
        
        // Muscle selection functions now handled by MuscleModule
        </script>
        <?php
    }
    
    /**
     * Basic muscle selection fallback (when module not available)
     */
    private function renderBasicMuscleSelection(): string {
        return '
        <div class="basic-muscle-selection">
            <div class="form-row">
                <select id="targetMuscleGroups" name="targetMuscleGroups" class="form-select">
                    <option value="">Select Primary Muscle Group</option>
                    <option value="back">🏋️ Back</option>
                    <option value="chest">💪 Chest</option>
                    <option value="arms">💪 Arms</option>
                    <option value="shoulders">🤸 Shoulders</option>
                    <option value="core">🧘 Core</option>
                    <option value="legs">🦵 Legs</option>
                </select>
            </div>
            <textarea id="specificMuscles" name="specificMuscles" placeholder="Specific muscles (optional)..." class="form-textarea" rows="2"></textarea>
        </div>';
    }
}