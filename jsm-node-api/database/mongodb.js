import mongoose from 'mongoose';

// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.MONGODB_URI
// eslint-disable-next-line no-undef
const NODE_ENV = process.env.NODE_ENV

if(!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local');
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.error('Error connecting to database: ', error);

    // eslint-disable-next-line no-undef
    process.exit(1);
  }
}

export default connectToDatabase;