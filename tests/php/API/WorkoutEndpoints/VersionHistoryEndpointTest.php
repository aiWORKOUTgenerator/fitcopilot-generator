<?php
/**
 * Version History Endpoint Tests
 *
 * @package FitCopilot\Tests
 */

namespace FitCopilot\Tests\API\WorkoutEndpoints;

use FitCopilot\API\WorkoutEndpoints\VersionHistoryEndpoint;
use FitCopilot\Service\Versioning\VersioningService;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Version History Endpoint Test Case
 */
class VersionHistoryEndpointTest extends \WP_UnitTestCase {
    
    /**
     * Test instance
     */
    private $endpoint;
    
    /**
     * Setup
     */
    public function setUp() {
        parent::setUp();
        
        $this->endpoint = new VersionHistoryEndpoint();
    }
    
    /**
     * Test that the endpoint is registered with the correct route and method
     */
    public function test_endpoint_registration() {
        // Check route and method
        $this->assertEquals('/workouts/(?P<id>\d+)/versions', $this->endpoint->route);
        $this->assertEquals('GET', $this->endpoint->method);
    }
    
    /**
     * Test handle_request with non-existent workout
     */
    public function test_handle_request_with_non_existent_workout() {
        // Create a mock request
        $request = new \WP_REST_Request('GET', '/fitcopilot/v1/workouts/999/versions');
        $request->set_param('id', 999);
        
        // Call the endpoint
        $response = $this->endpoint->handle_request($request);
        
        // Assert that the response is an error
        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertEquals(404, $response->get_status());
        
        // Get the data
        $data = $response->get_data();
        
        // Check error structure
        $this->assertArrayHasKey('success', $data);
        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('message', $data);
        $this->assertContains('not found', strtolower($data['message']));
    }
    
    /**
     * Test parameter validation
     */
    public function test_parameter_validation() {
        // Create a mock workout
        $post_id = $this->factory->post->create([
            'post_type' => 'fc_workout',
            'post_author' => get_current_user_id(),
        ]);
        
        // Create a request with various parameters
        $request = new \WP_REST_Request('GET', '/fitcopilot/v1/workouts/' . $post_id . '/versions');
        $request->set_param('id', $post_id);
        $request->set_param('from_version', 'not-a-number'); // Invalid version
        $request->set_param('per_page', 999); // Valid but large
        
        // Mock the VersioningService to return a known response
        $mock_service = $this->createMock(VersioningService::class);
        $mock_service->method('get_workout_version_history')
            ->willReturn([
                'versions' => [],
                'total' => 0,
            ]);
        
        // Replace the service with our mock
        // Note: This test assumes we can replace the service, which may require additional setup
        
        // Call the endpoint - we're just checking that invalid params are properly sanitized
        $response = $this->endpoint->handle_request($request);
        
        // We should get a valid response even with invalid parameters
        $this->assertInstanceOf(\WP_REST_Response::class, $response);
        $this->assertEquals(200, $response->get_status());
    }
} 