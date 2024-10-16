import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//allow json data to be sent to the server
app.use(express.json());
// allow cookies to be sent to the server/ parse incoming cookies
app.use(cookieParser());

// allow cors for all sites
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use("/api/auth", authRoutes)


app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port 3000");
})