require('dotenv').config();
const express = require("express")
const connectToDB = require("./database/db");

//Initialize the app
const app = express();
connectToDB();

app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get("/home", (req,res) => {
    res.json({
        HealthTest: "Welcome to the Mern Project Server is running fine"
    })
})
//Mount/Create Routes
app.get("/test", (req, res) => {
    res.json({
        Hi: "Welcome to the MERN Library API",
    });
});
app.listen(PORT, () => {
console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});