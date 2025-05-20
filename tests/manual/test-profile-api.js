/**
 * Manual Test Script for Profile API
 * 
 * This script tests the profile update API with both wrapped and direct formats.
 * Run this script in the browser console on your WordPress site while logged in.
 */

/**
 * Test the profile update endpoint with both formats.
 * @param {string} wpApiNonce The WordPress REST API nonce
 */
async function testProfileAPI(wpApiNonce) {
  const baseUrl = '/wp-json/fitcopilot/v1/profile';
  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpApiNonce
  };

  console.log('=== PROFILE API TEST ===');
  console.log('Testing both wrapped and direct formats...');

  // Test 1: Get current profile
  console.log('\n1. Getting current profile...');
  try {
    const getResponse = await fetch(baseUrl, {
      method: 'GET',
      headers
    });
    const getData = await getResponse.json();
    console.log('Current profile:', getData);
  } catch (error) {
    console.error('Get profile error:', error);
  }

  // Test 2: Update with wrapped format
  console.log('\n2. Updating with wrapped format...');
  try {
    const wrappedPayload = {
      profile: {
        fitnessLevel: 'advanced',
        workoutGoals: ['strength-building'],
        workoutDuration: 45
      }
    };
    
    const wrappedResponse = await fetch(baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(wrappedPayload)
    });
    
    const wrappedData = await wrappedResponse.json();
    console.log('Wrapped format response:', wrappedData);
  } catch (error) {
    console.error('Wrapped format error:', error);
  }

  // Test 3: Get updated profile to verify
  console.log('\n3. Getting profile after wrapped update...');
  try {
    const getResponse = await fetch(baseUrl, {
      method: 'GET',
      headers
    });
    const getData = await getResponse.json();
    console.log('Profile after wrapped update:', getData);
  } catch (error) {
    console.error('Get profile error:', error);
  }

  // Test 4: Update with direct format
  console.log('\n4. Updating with direct format...');
  try {
    const directPayload = {
      fitnessLevel: 'intermediate',
      workoutGoals: ['endurance'],
      workoutDuration: 30
    };
    
    const directResponse = await fetch(baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(directPayload)
    });
    
    const directData = await directResponse.json();
    console.log('Direct format response:', directData);
  } catch (error) {
    console.error('Direct format error:', error);
  }

  // Test 5: Get final profile to verify
  console.log('\n5. Getting profile after direct update...');
  try {
    const getResponse = await fetch(baseUrl, {
      method: 'GET',
      headers
    });
    const getData = await getResponse.json();
    console.log('Profile after direct update:', getData);
  } catch (error) {
    console.error('Get profile error:', error);
  }

  console.log('\n=== TEST COMPLETED ===');
}

// Usage instructions
console.log(`
To run the test, execute:
testProfileAPI('your-wp-nonce');

You can get your nonce from:
- window.wpApiSettings.nonce (if available)
- Or by checking the Network tab when making any WP REST API request
`);

// If wpApiSettings is available, auto-fill the nonce
if (typeof window !== 'undefined' && window.wpApiSettings && window.wpApiSettings.nonce) {
  console.log('WordPress nonce found, you can run:');
  console.log(`testProfileAPI('${window.wpApiSettings.nonce}');`);
} 