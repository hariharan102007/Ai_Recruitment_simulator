import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set. MongoDB offline mode.');
      return null;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB not connected: ${error.message} - offline fallback active`);
    return null;
  }
};

