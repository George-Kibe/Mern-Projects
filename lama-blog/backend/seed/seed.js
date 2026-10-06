// Seeds demo authors, posts and comments. Safe to re-run: it replaces
// previously seeded data and re-uses already uploaded Cloudinary images.
// Usage: bun run seed   (or: node --env-file .env seed/seed.js)
import mongoose from "mongoose";
import cloudinary, { UPLOAD_FOLDER } from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { authors, comments, inlineImages, posts } from "./data.js";

const SEED_FOLDER = `${UPLOAD_FOLDER}/seed`;
const DAY = 24 * 60 * 60 * 1000;

const uploadImage = async (name, url) => {
  const res = await cloudinary.uploader.upload(url, {
    public_id: `${SEED_FOLDER}/${name}`,
    overwrite: false,
    // Store a reasonably sized master; delivery transformations do the rest.
    transformation: [{ width: 1600, height: 900, crop: "fill", gravity: "auto" }],
  });
  return res.secure_url;
};

const withInlineImages = (content, inlineUrls) =>
  content.replace(/\{\{img:([\w-]+)\}\}/g, (_, key) => {
    const url = inlineUrls[key].replace("/upload/", "/upload/f_auto,q_auto,w_1200,c_limit/");
    return `<p><img src="${url}" alt=""/></p>`;
  });

const seed = async () => {
  await mongoose.connect(process.env.MONGODBURI);
  console.log(`Connected to ${mongoose.connection.name}`);

  // Authors
  const users = {};
  for (const author of authors) {
    users[author.username] = await User.findOneAndUpdate(
      { clerkUserId: author.clerkUserId },
      author,
      { upsert: true, returnDocument: "after" }
    );
  }
  const seedUserIds = Object.values(users).map((u) => u._id);

  // Clear previous seed posts (and their comments)
  const oldPosts = await Post.find({ user: { $in: seedUserIds } }).select("_id");
  await Comment.deleteMany({
    $or: [{ post: { $in: oldPosts.map((p) => p._id) } }, { user: { $in: seedUserIds } }],
  });
  await Post.deleteMany({ _id: { $in: oldPosts.map((p) => p._id) } });

  // Images
  const inlineUrls = {};
  for (const [key, url] of Object.entries(inlineImages)) {
    inlineUrls[key] = await uploadImage(key, url);
  }

  // Posts
  const savedPosts = {};
  for (const post of posts) {
    const img = await uploadImage(post.slug, post.cover);
    const createdAt = new Date(Date.now() - post.daysAgo * DAY);

    // Raw insert so our historical createdAt isn't overwritten by timestamps.
    const doc = {
      user: users[post.author]._id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      content: withInlineImages(post.content.trim(), inlineUrls),
      img,
      isFeatured: !!post.isFeatured,
      visit: post.visit,
      createdAt,
      updatedAt: createdAt,
    };
    // Remove any user-created post that happens to share the slug.
    await Post.deleteOne({ slug: post.slug });
    const { insertedId } = await Post.collection.insertOne(doc);
    savedPosts[post.slug] = insertedId;
    console.log(`  ✓ ${post.title}`);
  }

  // Comments
  for (const [i, comment] of comments.entries()) {
    const createdAt = new Date(Date.now() - (i + 1) * 60 * 60 * 1000);
    await Comment.collection.insertOne({
      user: users[comment.author]._id,
      post: savedPosts[comment.post],
      description: comment.description,
      createdAt,
      updatedAt: createdAt,
    });
  }

  console.log(
    `Seeded ${authors.length} authors, ${posts.length} posts, ${comments.length} comments.`
  );
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
