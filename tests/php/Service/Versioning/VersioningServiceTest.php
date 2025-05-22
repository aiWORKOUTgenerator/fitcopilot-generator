<?php
/**
 * Tests for VersioningService
 *
 * @package FitCopilot\Tests\Service\Versioning
 */

namespace FitCopilot\Tests\Service\Versioning;

use FitCopilot\Service\Versioning\VersioningService;
use WP_UnitTestCase;

/**
 * Class VersioningServiceTest
 */
class VersioningServiceTest extends WP_UnitTestCase {
    
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
        
        // Add some test metadata
        update_post_meta($this->workout_id, '_workout_difficulty', 'intermediate');
        update_post_meta($this->workout_id, '_workout_duration', 30);
        update_post_meta($this->workout_id, '_workout_equipment', ['dumbbells', 'barbell']);
        update_post_meta($this->workout_id, '_workout_goals', 'strength');
        update_post_meta($this->workout_id, '_workout_restrictions', 'none');
        update_post_meta($this->workout_id, '_workout_data', json_encode([
            'title' => 'Test Workout',
            'exercises' => [
                ['name' => 'Push Up', 'sets' => 3, 'reps' => 10],
                ['name' => 'Squat', 'sets' => 3, 'reps' => 12],
            ],
        ]));
        
        // Initialize the versioning service
        $this->versioning_service = new VersioningService();
    }
    
    /**
     * Test getting the current workout state
     */
    public function test_get_current_workout_state() {
        $state = $this->versioning_service->get_current_workout_state($this->workout_id);
        
        $this->assertNotNull($state);
        $this->assertEquals($this->workout_id, $state['id']);
        $this->assertEquals('Test Workout', $state['title']);
        $this->assertEquals($this->user_id, $state['author']);
        
        // Check metadata
        $this->assertArrayHasKey('meta', $state);
        $this->assertArrayHasKey('_workout_difficulty', $state['meta']);
        $this->assertEquals('intermediate', $state['meta']['_workout_difficulty']);
        $this->assertEquals(30, $state['meta']['_workout_duration']);
        $this->assertEquals(['dumbbells', 'barbell'], $state['meta']['_workout_equipment']);
    }
    
    /**
     * Test creating a version record
     */
    public function test_create_workout_version_record() {
        // Get the current state
        $state = $this->versioning_service->get_current_workout_state($this->workout_id);
        
        // Create a version record
        $version = $this->versioning_service->create_workout_version_record(
            $this->workout_id,
            $state,
            $this->user_id,
            'test',
            'Test version'
        );
        
        // Check that the version was created
        $this->assertNotFalse($version);
        $this->assertEquals(2, $version); // First version is 1, new version is 2
        
        // Check that the metadata was updated
        $stored_version = get_post_meta($this->workout_id, '_workout_version', true);
        $this->assertEquals(2, $stored_version);
        
        $modified_by = get_post_meta($this->workout_id, '_workout_modified_by', true);
        $this->assertEquals($this->user_id, $modified_by);
        
        // Check that the version record exists in the database
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        $record = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE workout_id = %d AND version = %d",
                $this->workout_id,
                2
            )
        );
        
        $this->assertNotNull($record);
        $this->assertEquals($this->workout_id, $record->workout_id);
        $this->assertEquals(2, $record->version);
        $this->assertEquals($this->user_id, $record->user_id);
        $this->assertEquals('test', $record->change_type);
        $this->assertEquals('Test version', $record->change_summary);
        
        // Check the stored data
        $stored_data = json_decode($record->data, true);
        $this->assertEquals($this->workout_id, $stored_data['id']);
        $this->assertEquals('Test Workout', $stored_data['title']);
        $this->assertEquals('intermediate', $stored_data['meta']['_workout_difficulty']);
    }
    
    /**
     * Test determining the change type
     */
    public function test_determine_change_type() {
        // Original state
        $before = [
            'title' => 'Original Title',
            'content' => 'Original Content',
            'meta' => [
                '_workout_difficulty' => 'beginner',
                '_workout_duration' => 30,
                '_workout_equipment' => ['dumbbells'],
                '_workout_goals' => 'strength',
                '_workout_restrictions' => 'none',
            ],
        ];
        
        // Test title change
        $after_title_change = $before;
        $after_title_change['title'] = 'New Title';
        
        $this->assertEquals(
            'content',
            $this->versioning_service->determine_change_type($before, $after_title_change)
        );
        
        // Test metadata change
        $after_metadata_change = $before;
        $after_metadata_change['meta']['_workout_difficulty'] = 'advanced';
        
        $this->assertEquals(
            'metadata',
            $this->versioning_service->determine_change_type($before, $after_metadata_change)
        );
        
        // Test completion change
        $after_completion_change = $before;
        $after_completion_change['meta']['_workout_completions'] = [
            ['user_id' => 1, 'date' => '2023-06-01 12:00:00'],
        ];
        
        $this->assertEquals(
            'completion',
            $this->versioning_service->determine_change_type($before, $after_completion_change)
        );
    }
    
    /**
     * Test generating change summary
     */
    public function test_generate_change_summary() {
        // Original state
        $before = [
            'title' => 'Original Title',
            'content' => 'Original Content',
            'meta' => [
                '_workout_difficulty' => 'beginner',
                '_workout_duration' => 30,
                '_workout_equipment' => ['dumbbells'],
                '_workout_goals' => 'strength',
                '_workout_restrictions' => 'none',
            ],
        ];
        
        // Test multiple changes
        $after_multiple_changes = $before;
        $after_multiple_changes['title'] = 'New Title';
        $after_multiple_changes['meta']['_workout_duration'] = 45;
        $after_multiple_changes['meta']['_workout_goals'] = 'cardio';
        
        $summary = $this->versioning_service->generate_change_summary($before, $after_multiple_changes);
        
        $this->assertStringContainsString('title updated', $summary);
        $this->assertStringContainsString('duration updated', $summary);
        $this->assertStringContainsString('goals updated', $summary);
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