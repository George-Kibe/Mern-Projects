import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

// routes
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoute.js";

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);


app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // this will add auth to req obj => req.auth

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});