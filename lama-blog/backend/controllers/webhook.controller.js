import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";
import { uniqueUsername } from "../lib/getUser.js";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const payload = req.body;
  const headers = req.headers;
  // console.log("Webhook Payload: ", payload);
  // console.log("Webhook Headers: ", headers);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    // svix v2 verify() only validates the signature; parse the body ourselves
    wh.verify(payload, headers);
    evt = JSON.parse(payload.toString());
  } catch (error) {
    console.log("Webhook verification failed!", error.message);
    return res.status(400).json({
      success: false,
      message: "Webhook verification failed!",
    });
  }


  if (evt.type === "user.created") {
    // Upsert: the user may already exist if getUser() created them first.
    const email = evt.data.email_addresses[0]?.email_address;
    await User.findOneAndUpdate(
      { clerkUserId: evt.data.id },
      {
        $setOnInsert: {
          username: await uniqueUsername({
            username: evt.data.username,
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
            email,
          }),
          email,
          img: evt.data.image_url,
        },
      },
      { upsert: true }
    );
  }

  if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkUserId: evt.data.id,
    });

    if (deletedUser) {
      await Post.deleteMany({ user: deletedUser._id });
      await Comment.deleteMany({ user: deletedUser._id });
    }
  }

  return res.status(200).json({
    message: "Webhook received",
  });
};
