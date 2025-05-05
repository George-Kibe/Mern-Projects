import express from 'express';
import connectDB from './lib/connectDB.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/server-test', (req, res) => {
    res.status(200).json(
        {
            message: 'Server is running successfully',
            status: 'success',
            timestamp: new Date().toISOString(),
            serverTime: new Date().toLocaleString(),
            serverPort: PORT,
            serverEnv: process.env.NODE_ENV || 'development'
        }
    );
});
app.listen(PORT, async() => {
    await connectDB()
    console.log(`Server is running on port ${PORT}`);
});