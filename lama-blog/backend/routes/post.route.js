import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  uploadAuth,
  featurePost,
  getPostsMeta,
} from "../controllers/post.controller.js";
import { createPostLimiter, uploadLimiter } from "../middlewares/rateLimit.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const router = express.Router();

router.get("/upload-auth", uploadLimiter, uploadAuth);
router.get("/meta", getPostsMeta);

router.get("/", getPosts);
router.get("/:slug", increaseVisit, getPost);
router.post("/", createPostLimiter, createPost);
router.delete("/:id", deletePost);
router.patch("/feature", featurePost);

export default router;