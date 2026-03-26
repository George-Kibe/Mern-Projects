import { Request, Response, NextFunction } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs";
import Expense from "../models/Expense";

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userObject = user.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    sendSuccess(res, userWithoutPassword, "Profile retrieved successfully!");
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // const user = await User.findOne({ _id: userId });

    // if (!user) {
    //   throw new AppError("User not found!", 404);
    // }

    if (!name && !email && !password) {
      throw new AppError(
        "please provide name, email or password to update",
        400,
      );
    }

    if (name && name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters.", 400);
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
          400,
        );
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        throw new AppError("Email already in use!", 400);
      }
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    const userObject = updatedUser.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    sendSuccess(res, userWithoutPassword, "Profile updated successfully!");
  },
);

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!req.file) {
      throw new AppError("Please upload an image file", 400);
    }

    const filename = req.file.filename;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.avatar) {
      const oldAvatarPath = path.join("upload", "avatars", user.avatar);

      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = filename;

    await user.save();

    sendSuccess(
      res,
      { avatar: filename, avatarUrl: `/uploads/avatars/${filename}` },
      "Avatar uploaded successfully",
    );
  },
);

export const getAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.avatar) {
      throw new AppError("No avatar found for this user", 404);
    }

    const avatarPath = path.join("uploads", "avatars", user.avatar);

    if (!fs.existsSync(avatarPath)) {
      throw new AppError("Avatar file not found", 404);
    }

    res.sendFile(path.resolve(avatarPath));
  },
);

export const deleteAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.avatar) {
      throw new AppError("No avatar found for this user", 404);
    }

    const avatarPath = path.join("uploads", "avatars", user.avatar);

    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    user.avatar = undefined;

    await user.save();

    sendSuccess(res, null, "Avatar deleted successfully");
  },
);

export const exportData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const expenses = await Expense.find({ userId });

    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    if (expenses.length === 0) {
      return sendSuccess(
        res,
        {
          user: userWithoutPassword,
          expenses: [],
          summary: {
            totalExpenses: 0,
            expenseCount: 0,
          },
          exportedAt: new Date().toISOString(),
        },
        "Data exported successfully. You have no expenses!",
      );
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const exportDataObject = {
      user: userWithoutPassword,
      expenses,
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        expenseCount: expenses.length,
      },
      exportedAt: new Date().toISOString(),
    };

    sendSuccess(res, exportDataObject, "Data exported successfully.");
  },
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await Expense.deleteMany({ userId });

    if (user.avatar) {
      const avatarPath = path.join("uploads", "avatars", user.avatar);

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await User.findByIdAndDelete(userId);

    sendSuccess(
      res,
      null,
      "Account deleted successfully. All data has been removed.",
    );
  },
);
