import { Router} from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { getAllUsers, getMessages } from "../controllers/userController.js";

const router = Router();
router.get("/", getAllUsers);
router.get('/messages/:userId', getMessages );

export default router;