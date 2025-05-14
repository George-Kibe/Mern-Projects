import express from 'express';
import connectDB from './lib/connectDB.js';
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";

import { clerkMiddleware, requireAuth } from "@clerk/express";

const app = express();
app.use(clerkMiddleware());

app.use("/webhooks", webhookRouter);

app.use(express.json());
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


app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((error, req, res, next) => {
    res.status(error.status || 500);
  
    res.json({
      message: error.message || "Something went wrong!",
      status: error.status,
      stack: error.stack,
    });
  });

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`);
});