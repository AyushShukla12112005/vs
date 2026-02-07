const API_URL = 'http://localhost:5002/api';

async function testAllEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');
  
  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log(healthResponse.ok ? '✅ Health check passed' : '❌ Health check failed', health);
    
    // 2. Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const loginData = await loginResponse.json();
    console.log(loginResponse.ok ? '✅ Login successful' : '❌ Login failed');
    
    if (!loginResponse.ok) {
      console.error('Login error:', loginData);
      return;
    }
    
    const token = loginData.token;
    
    // 3. Get Projects
    console.log('\n3️⃣ Testing Get Projects...');
    const projectsResponse = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await projectsResponse.json();
    console.log(projectsResponse.ok ? `✅ Projects fetched: ${projects.length} found` : '❌ Projects fetch failed');
    
    // 4. Create Project
    console.log('\n4️⃣ Testing Create Project...');
    const createResponse = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Project ' + Date.now(),
        description: 'Testing project creation'
      })
    });
    const newProject = await createResponse.json();
    console.log(createResponse.ok ? '✅ Project created' : '❌ Project creation failed');
    
    if (createResponse.ok) {
      const projectId = newProject._id;
      
      // 5. Update Project
      console.log('\n5️⃣ Testing Update Project...');
      const updateResponse = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Updated Test Project',
          description: 'Updated description'
        })
      });
      console.log(updateResponse.ok ? '✅ Project updated' : '❌ Project update failed');
      
      // 6. Get Issues
      console.log('\n6️⃣ Testing Get Issues...');
      const issuesResponse = await fetch(`${API_URL}/issues?project=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const issues = await issuesResponse.json();
      console.log(issuesResponse.ok ? `✅ Issues fetched: ${issues.length} found` : '❌ Issues fetch failed');
      
      // 7. Delete Project
      console.log('\n7️⃣ Testing Delete Project...');
      const deleteResponse = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(deleteResponse.ok ? '✅ Project deleted' : '❌ Project deletion failed');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

testAllEndpoints();
