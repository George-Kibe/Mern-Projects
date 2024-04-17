const mongoose = require("mongoose");

const connectToDB = async () => {
    console.log("Connecting to MongoDB...");
    const mongoUri = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@mongodb`
    console.log("MONGO URI: ", process.env.MONGO_URI);
    console.log("DB NAME: ", process.env.DB_NAME);
    try {
        const connect = await mongoose.connect(mongoUri, {
            dbName: process.env.DB_NAME,  
        });
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.log(`MongoDB connection Error!: ${error.message}`);
    }
    
};

module.exports = connectToDB;