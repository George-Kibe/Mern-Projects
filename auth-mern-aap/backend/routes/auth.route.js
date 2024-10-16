import express from "express"
import { 
    login, 
    logout, 
    signUp, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    resetPasswordMobile,
    checkAuth
 } from "../controllers/authController.js";
import verifyToken, {verifyHttpOnlyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

// register
router.post("/signup", signUp);
//verify email
router.post("/verify-email", verifyEmail);
// login
router.post("/login", login);
// logout
router.get("/logout", logout);
// forgot password
router.post("/forgot-password", forgotPassword);
//reset password web
router.post("/reset-password/:token", resetPassword);
//reset password mobile
router.post("/reset-password-mobile/:otp", resetPasswordMobile);
// protected route
router.get("/check-auth", verifyHttpOnlyToken ,checkAuth);

export default router;