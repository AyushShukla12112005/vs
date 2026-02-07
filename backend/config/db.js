import mongoose from 'mongoose';

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  // In production, MONGODB_URI is required
  if (process.env.NODE_ENV === 'production' && !uri) {
    throw new Error('MONGODB_URI environment variable is required in production');
  }

  const startMemoryServer = async () => {
    // Only allow in-memory DB in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('In-memory MongoDB is not allowed in production');
    }
    
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
    
    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host || conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn('Initial MongoDB connection failed:', error.message);
    
    // Only try in-memory fallback in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        await startMemoryServer();
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (in-memory): ${conn.connection.host || conn.connection.name}`);
        return conn;
      } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
      }
    } else {
      console.error('MongoDB connection error in production:', error.message);
      throw error;
    }
  }
};

export default connectDB;
