import mongoose from 'mongoose';
import { config } from '../config/env.js';
import logger from '../config/logger.js';

mongoose.set('strictQuery', false);

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', { error: err });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing MongoDB connection:', { error });
    process.exit(1);
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    if (!config.db.mongo_url) {
      throw new Error('MONGO_URL is not defined in environment variables');
    }

    await mongoose.connect(config.db.mongo_url);
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', { error });
    throw error;
  }
}

export default mongoose;
