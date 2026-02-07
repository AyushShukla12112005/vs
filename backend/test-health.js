async function testHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Backend is healthy:', data);
  } catch (error) {
    console.error('❌ Backend error:', error.message);
  }
}

testHealth();
