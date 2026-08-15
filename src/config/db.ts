import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/query_db';

export async function connectDB(): Promise<void> {
  try {
    console.log(`[Database] Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Database] MongoDB connection established successfully.');
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    process.exit(1);
  }
}
