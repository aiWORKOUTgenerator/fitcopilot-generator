<?php
/**
 * Manual test for the direct workout generation endpoint
 * 
 * Run this script from the command line:
 * php test-direct-workout.php
 */

// Set your WordPress site URL here
$site_url = 'http://fitcopilot-generator.local';

// Test data in wrapped format
$test_data = array(
    'workout' => array(
        'duration' => 30,
        'difficulty' => 'intermediate',
        'goals' => 'strength',
        'equipment' => array('dumbbells', 'resistance bands'),
        'restrictions' => 'none',
        'specific_request' => 'A full body workout focused on strength building'
    )
);

// Set API endpoint to the direct endpoint
$endpoint = '/wp-json/fitcopilot/v1/generate-direct';
$url = $site_url . $endpoint;

// Make API request
echo "Making API request to: $url\n";
echo "With data: " . json_encode($test_data, JSON_PRETTY_PRINT) . "\n\n";

// Set up cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute the request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// Check for errors
if ($curl_error) {
    echo "cURL Error: $curl_error\n";
    exit(1);
}

// Print the response
echo "HTTP Status Code: $http_code\n\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT) . "\n";

// Try direct format too
echo "\n\nTrying direct format...\n";

// Test data in direct format
$direct_data = array(
    'duration' => 30,
    'difficulty' => 'intermediate',
    'goals' => 'strength',
    'equipment' => array('dumbbells', 'resistance bands'),
    'restrictions' => 'none',
    'specific_request' => 'A full body workout focused on strength building'
);

// Set up cURL for direct format test
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($direct_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute the request for direct format
$direct_response = curl_exec($ch);
$direct_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Print the direct format response
echo "Direct Format HTTP Status Code: $direct_http_code\n\n";
echo "Direct Format Response:\n";
echo json_encode(json_decode($direct_response), JSON_PRETTY_PRINT) . "\n"; 