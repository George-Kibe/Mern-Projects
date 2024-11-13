import { Router } from "express";
import { authCallback } from "../controllers/AuthController.js";
const router = Router();

router.post("/callback", authCallback);

export default router;