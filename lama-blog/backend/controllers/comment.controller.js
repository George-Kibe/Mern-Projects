import Comment from "../models/comment.model.js";
import getUser, { getRole } from "../lib/getUser.js";

// GET /comments/:postId?page&limit, newest first.
export const getPostComments = async (req, res) => {
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 50);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const filter = { post: req.params.postId };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("user", "username img clerkUserId")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({ comments, page, limit, total, totalPages, hasMore: page < totalPages });
};

export const addComment = async (req, res) => {
  const clerkUserId = req.auth().userId;
  const postId = req.params.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const description = req.body.description?.trim();

  if (!description) {
    return res.status(400).json("Comment cannot be empty!");
  }

  if (description.length > 1000) {
    return res.status(400).json("Comments can be at most 1000 characters.");
  }

  const user = await getUser(clerkUserId);

  const newComment = new Comment({
    description,
    user: user._id,
    post: postId,
  });
  const savedComment = await newComment.save();

  res.status(201).json(savedComment);
};

export const deleteComment = async (req, res) => {
  const clerkUserId = req.auth().userId;
  const id = req.params.id;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = await getRole(req.auth());

  if (role === "admin") {
    await Comment.findByIdAndDelete(req.params.id);
    return res.status(200).json("Comment has been deleted");
  }

  const user = await getUser(clerkUserId);

  const deletedComment = await Comment.findOneAndDelete({
    _id: id,
    user: user._id,
  });

  if (!deletedComment) {
    return res.status(403).json("You can delete only your comment!");
  }

  res.status(200).json("Comment deleted");
};