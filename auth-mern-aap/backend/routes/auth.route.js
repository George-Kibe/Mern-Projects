import express from "express"
import { login, logout, signUp } from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/signup", signUp);
// login
router.post("/login", login);
// logout
router.get("/logout", logout);

export default router;