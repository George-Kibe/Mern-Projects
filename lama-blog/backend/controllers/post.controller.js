import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import getUser, { getRole } from "../lib/getUser.js";
import {
  deleteContentMedia,
  deleteImage,
  getUploadSignature,
} from "../lib/cloudinary.js";

const toSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 2, 50);

  const query = {};

  const category = req.query.cat || req.query.category;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;

  if (category) {
    query.category = category;
  }

  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }

  if (author) {
    const user = await User.findOne({ username: author }).select("_id");

    if (!user) {
      return res.status(200).json({ posts: [], hasMore: false });
    }

    query.user = user._id;
  }

  let sortObj = { createdAt: -1 };

  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { visit: -1 };
        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      default:
        break;
    }
  }

  if (featured) {
    query.isFeatured = true;
  }

  const posts = await Post.find(query)
    .populate("user", "username")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await Post.countDocuments(query);
  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};

export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img clerkUserId"
  );

  if (!post) {
    return res.status(404).json("Post not found!");
  }

  res.status(200).json(post);
};

export const createPost = async (req, res) => {
  const clerkUserId = req.auth().userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const { title, img, description, category, content } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json("Title and content are required!");
  }

  const user = await getUser(clerkUserId);

  const baseSlug = toSlug(title) || "post";
  let slug = baseSlug;
  let counter = 2;

  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newPost = new Post({
    user: user._id,
    slug,
    title,
    img,
    description,
    category,
    content,
  });

  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req, res) => {
  const clerkUserId = req.auth().userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = await getRole(req.auth());

  const filter = { _id: req.params.id };

  if (role !== "admin") {
    const user = await getUser(clerkUserId);
    filter.user = user._id;
  }

  const deletedPost = await Post.findOneAndDelete(filter);

  if (!deletedPost) {
    return res.status(403).json("You can delete only your posts!");
  }

  await Comment.deleteMany({ post: deletedPost._id });
  await deleteImage(deletedPost.img);
  await deleteContentMedia(deletedPost.content);

  res.status(200).json("Post has been deleted");
};

export const featurePost = async (req, res) => {
  const clerkUserId = req.auth().userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = await getRole(req.auth());

  if (role !== "admin") {
    return res.status(403).json("You cannot feature posts!");
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json("Post not found!");
  }

  const isFeatured = post.isFeatured;

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isFeatured: !isFeatured,
    },
    { returnDocument: "after" }
  );

  res.status(200).json(updatedPost);
};

export const uploadAuth = async (req, res) => {
  if (!req.auth().userId) {
    return res.status(401).json("Not authenticated!");
  }

  res.status(200).json(getUploadSignature());
};