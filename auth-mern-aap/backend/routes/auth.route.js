import express from "express"
import { login, logout, signUp, verifyEmail } from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/signup", signUp);
//verify email
router.post("/verify-email", verifyEmail);
// login
router.post("/login", login);
// logout
router.get("/logout", logout);


export default router;