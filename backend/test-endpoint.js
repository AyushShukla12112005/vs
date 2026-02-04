const API_URL = 'http://localhost:5000/api';

async function testEndpoint() {
  try {
    // Login first
    console.log('1. Testing login endpoint...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
      const errorData = await loginResponse.text();
      console.error('Error:', errorData);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Test PATCH /api/auth/profile
    console.log('\n2. Testing PATCH /api/auth/profile...');
    const updateResponse = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'New Name Test' })
    });
    
    console.log('Response status:', updateResponse.status, updateResponse.statusText);
    
    if (!updateResponse.ok) {
      console.error('❌ Update failed');
      const errorData = await updateResponse.text();
      console.error('Error response:', errorData);
      return;
    }
    
    const updateData = await updateResponse.json();
    console.log('✅ Profile update successful');
    console.log('Response:', JSON.stringify(updateData, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testEndpoint();
