import { NextFunction, Request, Response } from "express";
import { AuthResponse } from "../types";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/tokenHelpers";

// export let fakeUsers: User[] = [
//   {
//     id: "user123",
//     name: "John Doe",
//     email: "john@example.com",
//     password: "passworD#123",
//     createdAt: new Date("2025-12-01"),
//     updatedAt: new Date("2026-01-01"),
//   },
//   {
//     id: "user456",
//     name: "Jane Smith",
//     email: "jane@example.com",
//     password: "passwoRD456&",
//     createdAt: new Date("2025-12-01"),
//     updatedAt: new Date("2026-01-05"),
//   },
// ];

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Please provide name, email and password", 400);
    }

    if (name && name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters.", 400);
    }

    if (name && name.trim().length > 50) {
      throw new AppError("Name cannot exceed 50 characters.", 400);
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }
    }

    if (password) {
      if (password.length < 8) {
        throw new AppError("Password must be at least 8 characters.", 400);
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
      if (!passwordRegex.test(password)) {
        throw new AppError(
          "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)",
          400
        );
      }
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const userObject = savedUser.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: savedUser._id.toString() },
    };

    sendSuccess(res, authResponse, "Account created successfully!", 201);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const userObject = user.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    const token = generateToken(user._id.toString());

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: user._id.toString() },
      token,
    };

    sendSuccess(res, authResponse, "Login successful");
  }
);
