import express from "express";
import ProductRoutes from "./routes/products/index.js";
import AuthRoutes from './routes/users/index.js'
const app = express();

const PORT = process.env.PORT || 4000;
// continue from 3:49:28

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/users", AuthRoutes)

app.use("*", (req, res) => {
    res.status(404).json({
        type: "error",
        status: 404,
        message: "Route not found"
    })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});