import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoDBUri =
      process.env.MONGODBURI || "mongodb://localhost:27017/w-pennywise";

    const connection = await mongoose.connect(mongoDBUri);
    console.log("═══════════════════════════════════════");
    console.log("🎉 MongoDB Connected Successfully!");
    console.log(`📁 Database: ${connection.connection.name}`);
    console.log(`🔗 Host: ${connection.connection.host}`);
    console.log("═══════════════════════════════════════");
  } catch (error) {
    console.error("═══════════════════════════════════════");
    console.error("❌ MongoDB Connection Error:", error);
    console.error("═══════════════════════════════════════");
    console.error("Possible fixes:");
    console.error("1. Make sure MongoDB is running");
    console.error("2. Check if port 27017 is available");
    console.error("3. Verify MONGODB_URI in .env file");

    process.exit(1);
  }
};

export default connectDB;
