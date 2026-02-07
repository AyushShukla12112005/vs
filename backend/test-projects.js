const API_URL = 'http://localhost:5000/api';

async function testProjects() {
  try {
    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const { token } = await loginResponse.json();
    
    // Get projects
    const projectsResponse = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await projectsResponse.json();
    
    console.log('Projects count:', projects.length);
    console.log('Projects:', JSON.stringify(projects, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProjects();
