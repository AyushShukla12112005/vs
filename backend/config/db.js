import mongoose from 'mongoose';

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  const startMemoryServer = async () => {
    // dynamic import so production without the package won't crash
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    console.warn('Starting in-memory MongoDB for development (mongodb-memory-server)...');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    return mongod;
  };

  try {
    if (!uri) {
      console.warn('MONGODB_URI not set, falling back to in-memory MongoDB');
      await startMemoryServer();
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host || conn.connection.name}`);
  } catch (error) {
    console.warn('Initial MongoDB connection failed, trying in-memory fallback:', error.message);
    try {
      await startMemoryServer();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (in-memory): ${conn.connection.host || conn.connection.name}`);
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
  }
};

export default connectDB;
