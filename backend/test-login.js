import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function testLogin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bugtracker');
    console.log('Connected to database');

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('No users found. Creating test user...');
      
      // Create a test user
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('Test user created:', {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email
      });
    } else {
      // List existing users
      const users = await User.find().select('name email createdAt');
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Created: ${user.createdAt}`);
      });
    }

    // Test password comparison
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      const isValidPassword = await testUser.comparePassword('password123');
      console.log(`Password comparison test: ${isValidPassword ? 'PASS' : 'FAIL'}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testLogin();