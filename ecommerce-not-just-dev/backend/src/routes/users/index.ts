import { Router } from "express";
import { loginUser, registerUser } from "../../controllers/userController";
import { validateData } from "../../middlewares/validationMiddleware";
import { createUserSchema, loginSchema } from "../../db/userSchema";
const router = Router();

// register a user
router.post('/register', validateData(createUserSchema), registerUser)

// login a user
router.post('/login', validateData(loginSchema), loginUser)
export default router;
