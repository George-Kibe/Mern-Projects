import express from "express"
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js"
import { commentLimiter } from "../middlewares/rateLimit.js"

const router = express.Router()

router.get("/:postId", getPostComments)
router.post("/:postId", commentLimiter, addComment)
router.delete("/:id", deleteComment)

export default router 