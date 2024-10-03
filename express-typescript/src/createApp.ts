import express, { Request, Response } from "express";
import userRouter from "./routes/usersRoute";

export function createApp(){
    const app = express();
    app.get("/", (request: Request, response:Response) => {
        // return a json with server status, message and uptime
        response.json({
          status: "OK",
          message: "Server is running",
          uptime: process.uptime(),
        });
      });

    app.use("/api/users", userRouter);
    return app;
}


