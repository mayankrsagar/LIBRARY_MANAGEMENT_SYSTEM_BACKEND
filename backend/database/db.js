import mongoose from 'mongoose';

export const connectDB = async () => {
  const URI    = process.env.MONGO_URI;
  const DBNAME = process.env.DB_NAME;

  if (!URI || !DBNAME) {
    console.error('❌ Missing MONGO_URI or DB_NAME in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(URI, { dbName: DBNAME });
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ DB connection error:', error);
    process.exit(1);
  }
};
