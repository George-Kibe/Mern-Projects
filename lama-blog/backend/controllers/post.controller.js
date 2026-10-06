import mongoose from "mongoose";
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

const CATEGORIES = [
  "general",
  "web-design",
  "development",
  "databases",
  "ai",
  "seo",
  "marketing",
];
const DAY = 24 * 60 * 60 * 1000;
const TIME_RANGES = { week: 7 * DAY, month: 30 * DAY, year: 365 * DAY };
// Every sort ends on _id so pages never overlap or skip posts with equal keys.
const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  popular: { visit: -1, createdAt: -1, _id: -1 },
  trending: { visit: -1, createdAt: -1, _id: -1 },
  "title-asc": { title: 1, _id: 1 },
  "title-desc": { title: -1, _id: -1 },
};
const MAX_LIMIT = 48;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const emptyPage = (page, limit) => ({
  posts: [],
  page,
  limit,
  total: 0,
  totalPages: 0,
  hasMore: false,
});

// GET /posts
// ?page&limit&sort=newest|oldest|popular|trending|title-asc|title-desc
// &cat=ai,databases&author=username&search=text&time=week|month|year
// &featured=true&saved=true&exclude=<slug>
export const getPosts = async (req, res) => {
  const limit = Math.min(toPositiveInt(req.query.limit, 12), MAX_LIMIT);
  const page = toPositiveInt(req.query.page, 1);
  const sortKey = SORTS[req.query.sort] ? req.query.sort : "newest";

  const query = {};

  const categories = String(req.query.cat || req.query.category || "")
    .split(",")
    .map((c) => c.trim())
    .filter((c) => CATEGORIES.includes(c));
  if (categories.length) {
    query.category = { $in: categories };
  }

  const search = String(req.query.search || "").trim().slice(0, 100);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: pattern }, { description: pattern }];
  }

  if (req.query.author) {
    const user = await User.findOne({ username: String(req.query.author) }).select("_id");
    if (!user) return res.status(200).json(emptyPage(page, limit));
    query.user = user._id;
  }

  // Trending = most read among posts from the past week.
  const range = sortKey === "trending" ? TIME_RANGES.week : TIME_RANGES[req.query.time];
  if (range) {
    query.createdAt = { $gte: new Date(Date.now() - range) };
  }

  if (req.query.featured === "true") {
    query.isFeatured = true;
  }

  if (req.query.exclude) {
    query.slug = { $ne: String(req.query.exclude) };
  }

  if (req.query.saved === "true") {
    const clerkUserId = req.auth().userId;
    if (!clerkUserId) {
      return res.status(401).json("Sign in to see your saved posts.");
    }
    const user = await getUser(clerkUserId);
    const savedIds = user.savedPosts
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    query._id = { $in: savedIds };
  }

  const [result] = await Post.aggregate([
    { $match: query },
    {
      $facet: {
        total: [{ $count: "count" }],
        posts: [
          { $sort: SORTS[sortKey] },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [{ $project: { username: 1, img: 1 } }],
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            // ~1300 characters of HTML per minute of reading; bodies stay out of lists.
            $addFields: {
              readingMinutes: {
                $max: [1, { $ceil: { $divide: [{ $strLenCP: "$content" }, 1300] } }],
              },
            },
          },
          { $project: { content: 0 } },
        ],
      },
    },
  ]);

  const total = result.total[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    posts: result.posts,
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  });
};

// GET /posts/meta: post counts per category and the list of authors, for filters.
export const getPostsMeta = async (req, res) => {
  const [categoryCounts, authors, total] = await Promise.all([
    Post.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Post.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, username: "$user.username", count: 1 } },
      { $sort: { username: 1 } },
    ]),
    Post.countDocuments(),
  ]);

  const categories = Object.fromEntries(categoryCounts.map((c) => [c._id, c.count]));
  res.set("Cache-Control", "public, max-age=30");
  res.status(200).json({ total, categories, authors });
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