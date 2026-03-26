import mongoose from "mongoose";

const testConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/w-pennywise");
    console.log("✅ MongoDB connected successfully!");
    console.log("📁 Database: pennywise");
    console.log("🚀 MongoDB is ready!");

    await mongoose.connection.close();
    console.log("👋 Test complete - connection closed");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.log("💡 Make sure MongoDB is running!");
    console.log("💡 Run: net start MongoDB (as Administrator)");
  }
};

testConnection();
