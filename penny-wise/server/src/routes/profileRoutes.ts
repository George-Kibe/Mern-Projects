import { Router } from "express";
import {
  deleteAccount,
  deleteAvatar,
  exportData,
  getAvatar,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../controllers/profileControllers";
import { requireAuth } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", requireAuth, getProfile);
router.put("/", requireAuth, updateProfile);
router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);
router.get("/avatar", requireAuth, getAvatar);
router.delete("/avatar", requireAuth, deleteAvatar);
router.get("/export", requireAuth, exportData);
router.delete("/account", requireAuth, deleteAccount);

export default router;
