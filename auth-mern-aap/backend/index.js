import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

//allow json data to be sent to the server
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use("/api/auth", authRoutes)


app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port 3000");
})