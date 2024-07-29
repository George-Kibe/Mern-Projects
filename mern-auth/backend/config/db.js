import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB Already connected!');
        return mongoose.connection.asPromise();
    } else {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.log(`Error Connecting to MongoDB: ${error.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;