<?php

namespace FitCopilot\Admin\Debug\Views;

/**
 * PromptBuilder View
 * 
 * Renders the PromptBuilder admin interface
 */
class PromptBuilderView {
    
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
            <h1>🧠 PromptBuilder - AI Prompt Engineering</h1>
            <p class="description">Engineer and test AI prompts with live preview, strategy inspection, and data flow analysis.</p>
            
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
                            </div>
                            
                            <!-- Goals -->
                            <div class="form-group">
                                <h4>Goals</h4>
                                <div class="checkbox-grid">
                                    <label><input type="checkbox" name="goals[]" value="weight_loss"> Weight Loss</label>
                                    <label><input type="checkbox" name="goals[]" value="muscle_building"> Muscle Building</label>
                                    <label><input type="checkbox" name="goals[]" value="strength"> Strength</label>
                                    <label><input type="checkbox" name="goals[]" value="endurance"> Endurance</label>
                                    <label><input type="checkbox" name="goals[]" value="flexibility"> Flexibility</label>
                                    <label><input type="checkbox" name="goals[]" value="general_fitness"> General Fitness</label>
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
                            </div>
                            
                            <!-- Limitations -->
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
                        <h3>📋 Strategy Code</h3>
                        <div id="strategy-code-viewer" class="strategy-code-viewer">
                            <div class="code-placeholder">
                                <p>📋 Strategy code will appear here</p>
                                <p>Click "View Code" to see the actual PHP code that generates prompts.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Live Prompt Preview -->
                    <div class="builder-section">
                        <h3>📝 Live Prompt Preview</h3>
                        <div id="prompt-preview" class="prompt-preview">
                            <div class="prompt-placeholder">
                                <p>🎯 Ready to generate live prompts</p>
                                <p>Fill in the profile data and click "Generate Live Prompt" to see the AI prompt in real-time.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Context Inspector -->
                    <div class="builder-section">
                        <h3>🔍 Context Inspector</h3>
                        <div id="context-inspector" class="context-inspector">
                            <div class="context-placeholder">
                                <p>🔍 Context data will appear here</p>
                                <p>Click "Inspect Context" to see how your form data is processed and structured for AI generation.</p>
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
        
        .prompt-preview, .context-inspector, .strategy-code-viewer {
            min-height: 300px;
            max-height: 600px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            background: #f9f9f9;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
        }
        
        .prompt-placeholder, .context-placeholder, .code-placeholder {
            text-align: center;
            color: #666;
            padding: 40px 20px;
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
        
        @media (max-width: 1200px) {
            .prompt-builder-container {
                grid-template-columns: 1fr;
            }
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
                    $('#strategy-selector').on('change', this.onStrategyChange.bind(this));
                    $('#user-selector').on('change', this.onUserSelectionChange.bind(this));
                    $('#load-profile').on('click', this.loadUserProfile.bind(this));
                    $('#generate-prompt').on('click', this.generateLivePrompt.bind(this));
                    $('#inspect-context').on('click', this.inspectContext.bind(this));
                    $('#view-strategy-code').on('click', this.viewStrategyCode.bind(this));
                    $('#test-workout').on('click', this.testWorkoutGeneration.bind(this));
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
                        // Convert height from inches to display format if needed
                        if (basic.height) {
                            $('#height').val(basic.height);
                        }
                    }
                    
                    // Handle goals (checkboxes)
                    if (profileData.goals && profileData.goals.primary_goal) {
                        // Clear all goal checkboxes first
                        $('input[name="goals[]"]').prop('checked', false);
                        
                        // Check the goals from profile
                        profileData.goals.primary_goal.forEach(goal => {
                            $(`input[name="goals[]"][value="${goal}"]`).prop('checked', true);
                        });
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
                    // This would display workout test results
                    // For now, just show in prompt preview
                    const html = `
                        <div class="workout-test-results">
                            <h4>Workout Test Results</h4>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    `;
                    $('#prompt-preview').html(html);
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
                }
            };
            
            PromptBuilder.init();
        });
        </script>
        <?php
    }
} 