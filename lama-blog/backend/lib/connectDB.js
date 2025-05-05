import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB Already connected!');
    return mongoose.connection.asPromise();
  } else {
    try {
      await mongoose.connect(process.env.MONGODBURI);
      console.log('Connection to MongoDB Successful');
    } catch (error) {
      console.log(
        "Error connecting to MongoDB: ", error
      );
    }
  }
};

export default connectDB;