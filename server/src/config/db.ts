import mongoose from 'mongoose';

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const dbUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_setu';
  try {
    const conn = await mongoose.connect(dbUri);
    console.log(`[Database] MongoDB Connected to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] Connection Error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
