import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing Bug Tracker API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Health endpoint working');
    } else {
      console.log('❌ Health endpoint failed');
      return;
    }

    // Test registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Registration successful');
      console.log('User:', registerResult.user.name, registerResult.user.email);
      console.log('Token received:', registerResult.token ? 'Yes' : 'No');
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.message);
    }

    // Test login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('User:', loginResult.user.name, loginResult.user.email);
      console.log('Token received:', loginResult.token ? 'Yes' : 'No');

      // Test protected route
      console.log('\n4. Testing protected route (/auth/me)...');
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${loginResult.token}` }
      });

      if (meResponse.ok) {
        const meResult = await meResponse.json();
        console.log('✅ Protected route working');
        console.log('User data:', meResult.name, meResult.email);
      } else {
        const error = await meResponse.json();
        console.log('❌ Protected route failed:', error.message);
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message);
    }

    // Test login with wrong password
    console.log('\n5. Testing login with wrong password...');
    const wrongLoginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const wrongLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wrongLoginData)
    });

    if (!wrongLoginResponse.ok) {
      const error = await wrongLoginResponse.json();
      console.log('✅ Wrong password correctly rejected:', error.message);
    } else {
      console.log('❌ Wrong password was accepted (security issue!)');
    }

    console.log('\n🎉 API test completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();