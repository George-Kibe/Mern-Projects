import User from "../models/UserModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";

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

// login function
export const login = async (req, res) => {
    res.send("Login");
}

//logout function
export const logout = async (req, res) => {
    res.send("Logout");
}