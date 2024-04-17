require('dotenv').config();
const express = require("express")
const connectToDB = require("./database/db");
const ErrorsMiddleware = require("./middlewares/errorMiddleware");
const LibraryError = require("./utils/libraryError");
const bookRoutes = require("./routes/bookRoutes");


process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception..... 💣 🔥 stopping the server....");
    console.log(error.name, error.message);

    process.exit(1);
});

//Initialize the app
const app = express();
connectToDB();

app.use(express.json());
const PORT = process.env.PORT || 8000;

// Home route/ Health test
app.get("/", (req,res) => {
    res.json({
        Hi: "Welcome to the MERN Library API",
        HealthTest: "Welcome to the Mern Project Server is running fine"
    })
})
app.use("/api/v1/", bookRoutes);

//error middleware
app.all("*", (req, res, next) => {
    next(
        new LibraryError(`Can't find ${req.originalUrl} on this server`, 404)
    );
})

// use errors middleware
app.use(ErrorsMiddleware);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});

// Unhandled Rejection
process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection..... 💣 🔥 stopping the server....");
    console.log(error.name, error.message);
    server.close(() => {
        // exit code 1 means that there is an issue that caused the program to exit
        process.exit(1);
    });
});