const API_URL = 'http://localhost:5000/api';

async function testProjects() {
  try {
    // Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const { token } = await loginResponse.json();
    console.log('✅ Logged in');
    
    // Get projects
    console.log('\n2. Fetching projects...');
    const projectsResponse = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await projectsResponse.json();
    
    console.log(`\n📊 Found ${projects.length} projects:`);
    if (projects.length === 0) {
      console.log('❌ No projects found!');
      console.log('\n3. Creating a test project...');
      
      const createResponse = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project for debugging'
        })
      });
      
      const newProject = await createResponse.json();
      console.log('✅ Created project:', newProject);
    } else {
      projects.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (ID: ${p._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProjects();
