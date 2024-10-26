import { Router } from "express";
import { loginUser, registerUser } from "../../controllers/userController.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import { createUserSchema, loginSchema } from "../../db/userSchema.js";
const router = Router();

// register a user
router.post('/register', validateData(createUserSchema), registerUser)

// login a user
router.post('/login', validateData(loginSchema), loginUser)
export default router;
