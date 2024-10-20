import express from "express";
import ProductRoutes from "./routes/products";
const app = express();

const PORT = 3000;
app.get("/", (req, res) => {
    // respond with a json with message suerver is running fine and uptime
    res.json({
        type: "success",
        status: 200,
        process: "Server health Test",
        message: "Server is running fine",
        uptime: process.uptime()
    })
});

app.use("/api/products", ProductRoutes)
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});