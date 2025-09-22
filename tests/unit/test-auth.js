#!/usr/bin/env node

/**
 * Simple test script to verify MongoDB auth system is working
 */

// Use built-in fetch (Node 18+) or install node-fetch
const fetch = globalThis.fetch || require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api/v1/auth';

async function testAuth() {
  console.log('🧪 Testing MongoDB Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        organization: 'Test Organization'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registerData.user._id}`);
      console.log(`   Email: ${registerData.user.email}`);
      console.log(`   Name: ${registerData.user.firstName} ${registerData.user.lastName}`);
    } else {
      console.log('❌ Registration failed:', registerData.message);
      if (registerData.message?.includes('already exists')) {
        console.log('   (This is expected if user already exists)');
      }
    }

    // Test 2: Login with the user
    console.log('\n2️⃣ Testing user login...');
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log(`   Access token: ${loginData.accessToken.substring(0, 20)}...`);
      
      // Test 3: Get user profile
      console.log('\n3️⃣ Testing profile retrieval...');
      const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
        },
      });

      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('✅ Profile retrieval successful!');
        console.log(`   User: ${profileData.user.firstName} ${profileData.user.lastName}`);
        console.log(`   Email: ${profileData.user.email}`);
        console.log(`   Role: ${profileData.user.role}`);
        console.log(`   Organization: ${profileData.user.organization || 'None'}`);
        console.log(`   Email Verified: ${profileData.user.isEmailVerified}`);
        console.log(`   Active: ${profileData.user.isActive}`);
      } else {
        console.log('❌ Profile retrieval failed:', profileData.message);
      }

      // Test 4: Test logout
      console.log('\n4️⃣ Testing logout...');
      const logoutResponse = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
        },
      });

      const logoutData = await logoutResponse.json();
      
      if (logoutData.success) {
        console.log('✅ Logout successful!');
      } else {
        console.log('❌ Logout failed:', logoutData.message);
      }

    } else {
      console.log('❌ Login failed:', loginData.message);
    }

    console.log('\n🎉 MongoDB Authentication System test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the backend server is running on http://localhost:3001');
    console.log('   Run: npm run dev:backend');
  }
}

// Run the test
testAuth();