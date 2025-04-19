/**
 * Simple test script to check if the Express server is working correctly
 */
import fetch from 'node-fetch';

// Test the API
async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test the test endpoint
    const testResponse = await fetch('http://localhost:3001/api/test');
    const testData = await testResponse.text();
    console.log('Test endpoint response:', testResponse.status, testData);
    
    // Test signup endpoint
    const signupResponse = await fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const signupData = await signupResponse.text();
    console.log('Signup endpoint response:', signupResponse.status, signupData);
    
    console.log('API tests completed.');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI(); 