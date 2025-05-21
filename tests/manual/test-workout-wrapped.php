<?php
/**
 * Manual test for wrapped workout format
 * 
 * Run this script from the command line:
 * php test-workout-wrapped.php
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

// Set API endpoint
// First try the standard endpoint
$endpoint = '/wp-json/fitcopilot/v1/generate';
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

// Now try the direct endpoint with the same wrapped format data
echo "\n\nTrying direct-generate endpoint with wrapped format...\n";

$direct_endpoint = '/wp-json/fitcopilot/v1/generate-direct';
$direct_url = $site_url . $direct_endpoint;

$ch = curl_init($direct_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$direct_response = curl_exec($ch);
$direct_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Direct HTTP Status Code: $direct_http_code\n\n";
echo "Direct Response:\n";
echo json_encode(json_decode($direct_response), JSON_PRETTY_PRINT) . "\n";

// Try debug endpoint to get more information
echo "\n\nTrying debug endpoint...\n";

$debug_endpoint = '/wp-json/fitcopilot/v1/debug-request';
$debug_url = $site_url . $debug_endpoint;

$ch = curl_init($debug_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$debug_response = curl_exec($ch);
$debug_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Debug HTTP Status Code: $debug_http_code\n\n";
echo "Debug Response:\n";
echo json_encode(json_decode($debug_response), JSON_PRETTY_PRINT) . "\n"; 