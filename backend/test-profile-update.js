const API_URL = 'http://localhost:5000/api';

async function testProfileUpdate() {
  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    console.log('Current user:', loginData.user);
    
    // Update profile
    console.log('\n2. Updating profile...');
    const updateResponse = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Updated Test User' })
    });
    
    const updateData = await updateResponse.json();
    console.log('✅ Profile update successful');
    console.log('Updated user:', updateData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProfileUpdate();
