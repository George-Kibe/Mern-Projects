import express from 'express';
import connectDB from './lib/connectDB.js';
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import cors from "cors";

import { clerkMiddleware, requireAuth } from "@clerk/express";

const app = express();
// app.use(cors(process.env.CLIENT_URL));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.use("/webhooks", webhookRouter);

app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
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

// app.get('/auth-state', (req, res) => {
//  const authState  = req.auth;
//  res.json(authState);
// });

// app.get("/protected", (req, res) => {
//   const {userId} = req.auth;
//   if(!userId){
//     return res.status(401).json("not authenticated")
//   }
//   res.status(200).json("content")
// });

// app.get("/protect", requireAuth(), (req, res) => {
//   res.status(200).json("content")
// });

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((error, req, res, next) => {
  console.log("Error on server ", error);
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