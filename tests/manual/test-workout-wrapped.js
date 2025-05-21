/**
 * Manual test for wrapped workout format
 * 
 * Run this script with Node.js:
 * node test-workout-wrapped.js
 */

// Use fetch or axios for making HTTP requests
const fetch = require('node-fetch');

// Set your WordPress site URL here
const siteUrl = 'http://fitcopilot-generator.local';

// Test data in wrapped format
const testData = {
  workout: {
    duration: 30,
    difficulty: 'intermediate',
    goals: 'strength',
    equipment: ['dumbbells', 'resistance bands'],
    restrictions: 'none',
    specific_request: 'A full body workout focused on strength building'
  }
};

// API endpoint
const endpoint = '/wp-json/fitcopilot/v1/generate';
const url = siteUrl + endpoint;

console.log('Making API request to:', url);
console.log('With data:', JSON.stringify(testData, null, 2));

// Function to test the endpoint
async function testEndpoint() {
  try {
    // Test main endpoint
    console.log('\nTesting main endpoint...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const httpStatus = response.status;
    const responseData = await response.json();

    console.log('HTTP Status Code:', httpStatus);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    // Test debug endpoint
    console.log('\nTesting debug endpoint...');
    const debugEndpoint = '/wp-json/fitcopilot/v1/debug-request';
    const debugUrl = siteUrl + debugEndpoint;

    const debugResponse = await fetch(debugUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const debugHttpStatus = debugResponse.status;
    const debugResponseData = await debugResponse.json();

    console.log('Debug HTTP Status Code:', debugHttpStatus);
    console.log('Debug Response:', JSON.stringify(debugResponseData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testEndpoint(); 