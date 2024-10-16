import { 
    sendVerificationEmail, 
    sendWelcomeEmail, 
    sendResetPasswordEmail, 
    sendResetPasswordMobileEmail,
    sendPasswordResetSuccessEmail 
} from "../emails/emails.js";
import User from "../models/UserModel.js";
import { generateAccessToken, generateRefreshToken, generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import crypto from "crypto";
import jwt from 'jsonwebtoken';

// sign up function
export const signUp = async (req, res) => {
    const {username, email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const userAlreadyExists = await User.findOne({email});
        if (userAlreadyExists) {
            return res.status(422).json({message: "User already exists", success: false});
        }
        const verificationToken = generateVerificationCode();
        const newUser = new User({
            username: username || email.split("@")[0],
            email, 
            password, 
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 *60 *1000, // One day
        });
        
        // JWT HTTP Only Cookie
        generateTokenAndSetCookie(res, newUser._id);
        await sendVerificationEmail(email, verificationToken);
        await newUser.save();
        res.status(201).json({
            message: "User created successfully", 
            success: true,
            user: {
                ...newUser._doc,
                password: undefined,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message, 
            success: false
        });
    }
}

// verify email function
export const verifyEmail = async (req, res) => {
    const {code, email} = req.body;
    const user = await User.findOne({
        verificationToken: code, 
        verificationTokenExpiresAt: {$gt: Date.now()}});
    if (!user) {
        return res.status(404).json({
            message: "Invalid or expired token", 
            success: false
        });
    }
    // if (user.email !== email){
    //     return res.status(401).json({
    //         message: "Email does not match",
    //         success: false
    //     });
    // }
    try {
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        //send welcome email
        await sendWelcomeEmail(user.email, user.username);

        res.status(200).json({
            message: "Email verified successfully", 
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// login function
export const login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        if (!user.isVerified) {
            return res.status(401).json({message: "Email not verified"});
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id);
        // update last login
        user.lastLogin = new Date();
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        
        res.status(200).json({
            message: "Logged in successfully",
            success: true,
            accessToken, 
            refreshToken,
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// get access token from refresh token
export const getAccessToken = async (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        const accessToken = generateAccessToken(user._id);
        res.status(200).json({
            message: "Access token generated successfully",
            success: true,
            accessToken
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

//logout function
export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({message: "Logged out successfully"});
}

// forgot password
export const forgotPassword = async (req, res) => {
    const {email, platform} = req.body;
    if (!email) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        const otpCode = generateVerificationCode();
        user.resetPasswordOTP = otpCode;
        user.resetPasswordOTPExpiresAt = Date.now() + 10 * 60 * 1000; // ten minues
        user.resetPasswordToken = crypto.randomBytes(30).toString('hex');
        user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
        // send reset password email
        if (platform === "web") {
            await sendResetPasswordEmail(user.email, user.resetPasswordToken);
        }else {
            await sendResetPasswordMobileEmail(user.email, otpCode);
        }
        
        res.status(200).json({message: "Reset password email sent"});
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// reset password web
export const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    if (!token || !password) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        });
        if (!user) {
            return res.status(404).json({
                message: "Invalid or expired token",
                success: false
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        // send password reset success email
        await sendPasswordResetSuccessEmail(user.email, user.username)

        res.status(200).json({message: "Password reset successfully"});
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// reset password mobile
export const resetPasswordMobile = async (req, res) => {
    const {otp} = req.params;
    const {password} = req.body;
    if (!otp) {
        return res.status(400).json({message: "Please enter all fields"});
    }
    try {
        const user = await User.findOne({
            resetPasswordOTP: otp,
            resetPasswordOTPExpiresAt: {$gt: Date.now()}
        });
        if (!user) {
            return res.status(404).json({
                message: "Invalid or expired OTP",
                success: false
            });
        }
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiresAt = undefined;
        await user.save();
        // send password reset success email
        await sendPasswordResetSuccessEmail(user.email, user.username)
        res.status(200).json({message: "Password modified successfully"});
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// Get current user details
export const checkAuth = async (req, res) => {
    // console.log("req.userId: ", req.userId)
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        res.status(200).json({
            message: "User details",
            user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
}