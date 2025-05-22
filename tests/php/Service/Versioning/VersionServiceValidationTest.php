<?php
/**
 * Tests for VersioningService Validation Methods
 *
 * @package FitCopilot\Tests\Service\Versioning
 */

namespace FitCopilot\Tests\Service\Versioning;

use FitCopilot\Service\Versioning\VersioningService;
use WP_UnitTestCase;

/**
 * Class VersionServiceValidationTest
 */
class VersionServiceValidationTest extends WP_UnitTestCase {
    
    /**
     * Test workout ID
     *
     * @var int
     */
    private $workout_id;
    
    /**
     * Test user ID
     *
     * @var int
     */
    private $user_id;
    
    /**
     * Versioning service
     *
     * @var VersioningService
     */
    private $versioning_service;
    
    /**
     * Set up the test
     */
    public function setUp(): void {
        parent::setUp();
        
        // Create a test user
        $this->user_id = $this->factory->user->create([
            'role' => 'administrator',
        ]);
        
        // Set the current user
        wp_set_current_user($this->user_id);
        
        // Create a test workout
        $this->workout_id = wp_insert_post([
            'post_title'  => 'Test Workout',
            'post_type'   => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $this->user_id,
        ]);
        
        // Initialize version metadata
        update_post_meta($this->workout_id, '_workout_version', 3);
        update_post_meta($this->workout_id, '_workout_last_modified', current_time('mysql'));
        update_post_meta($this->workout_id, '_workout_modified_by', $this->user_id);
        
        // Initialize the versioning service
        $this->versioning_service = new VersioningService();
    }
    
    /**
     * Test validating a workout version
     */
    public function test_validate_workout_version() {
        // Test matching version
        $result = $this->versioning_service->validate_workout_version($this->workout_id, 3);
        $this->assertTrue($result['valid']);
        $this->assertEquals(3, $result['current_version']);
        
        // Test non-matching version
        $result = $this->versioning_service->validate_workout_version($this->workout_id, 2);
        $this->assertFalse($result['valid']);
        $this->assertEquals(3, $result['current_version']);
        $this->assertNotEmpty($result['message']);
        
        // Update the version
        update_post_meta($this->workout_id, '_workout_version', 4);
        
        // Test with the old version
        $result = $this->versioning_service->validate_workout_version($this->workout_id, 3);
        $this->assertFalse($result['valid']);
        $this->assertEquals(4, $result['current_version']);
    }
    
    /**
     * Test checking if a workout has changed
     */
    public function test_has_workout_changed() {
        // Create before state
        $before = [
            'id' => $this->workout_id,
            'title' => 'Test Workout',
            'content' => '',
            'meta' => [
                '_workout_difficulty' => 'intermediate',
                '_workout_duration' => 30,
                '_workout_equipment' => ['dumbbells', 'barbell'],
            ],
        ];
        
        // Test no changes (identical state)
        $after = $before;
        $this->assertFalse($this->versioning_service->has_workout_changed($before, $after));
        
        // Test title change
        $after_title_change = $before;
        $after_title_change['title'] = 'Updated Title';
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_title_change));
        
        // Test content change
        $after_content_change = $before;
        $after_content_change['content'] = 'New content';
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_content_change));
        
        // Test metadata value change (simple value)
        $after_meta_value_change = $before;
        $after_meta_value_change['meta']['_workout_difficulty'] = 'advanced';
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_meta_value_change));
        
        // Test metadata value change (numeric)
        $after_meta_numeric_change = $before;
        $after_meta_numeric_change['meta']['_workout_duration'] = 45;
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_meta_numeric_change));
        
        // Test metadata value change (array)
        $after_meta_array_change = $before;
        $after_meta_array_change['meta']['_workout_equipment'] = ['dumbbells', 'barbell', 'kettlebell'];
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_meta_array_change));
        
        // Test metadata key added
        $after_meta_key_added = $before;
        $after_meta_key_added['meta']['_workout_new_field'] = 'new value';
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_meta_key_added));
        
        // Test metadata key removed
        $after_meta_key_removed = $before;
        unset($after_meta_key_removed['meta']['_workout_equipment']);
        $this->assertTrue($this->versioning_service->has_workout_changed($before, $after_meta_key_removed));
    }
    
    /**
     * Clean up after the test
     */
    public function tearDown(): void {
        // Delete the test workout
        wp_delete_post($this->workout_id, true);
        
        // Delete the test user
        wp_delete_user($this->user_id);
        
        parent::tearDown();
    }
} 