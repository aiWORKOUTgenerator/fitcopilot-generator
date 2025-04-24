<?php
/**
 * Test REST Controller
 */

class Test_Rest_Controller extends WP_UnitTestCase {

	/**
	 * Test user ID
	 *
	 * @var int
	 */
	protected $user_id;

	/**
	 * Setup before each test.
	 */
	public function setUp(): void {
		parent::setUp();

		// Create a test user
		$this->user_id = $this->factory->user->create( array(
			'role' => 'administrator',
		) );

		// Set current user
		wp_set_current_user( $this->user_id );

		// Re-register the routes
		do_action( 'rest_api_init' );
	}

	/**
	 * Tear down after each test.
	 */
	public function tearDown(): void {
		// Clean up the user
		wp_delete_user( $this->user_id );

		parent::tearDown();
	}

	/**
	 * Test that the generate endpoint returns a valid response
	 */
	public function test_generate_workout() {
		// Create the request
		$request = new WP_REST_Request( 'POST', '/fitcopilot/v1/generate' );
		$request->set_param( 'duration', 30 );
		$request->set_param( 'difficulty', 'beginner' );
		$request->set_param( 'goals', 'Improve overall fitness' );

		// Dispatch the request
		$response = rest_do_request( $request );
		$data     = $response->get_data();

		// Check that the response was successful
		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );

		// Check that the workout data was returned
		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'title', $data['data'] );
		$this->assertArrayHasKey( 'sections', $data['data'] );
		$this->assertCount( 3, $data['data']['sections'] );
	}

	/**
	 * Test that the generate endpoint validates required parameters
	 */
	public function test_generate_workout_validation() {
		// Create a request missing the required 'goals' parameter
		$request = new WP_REST_Request( 'POST', '/fitcopilot/v1/generate' );
		$request->set_param( 'duration', 30 );
		$request->set_param( 'difficulty', 'beginner' );

		// Dispatch the request
		$response = rest_do_request( $request );

		// Check that validation failed
		$this->assertEquals( 400, $response->get_status() );
	}
} 