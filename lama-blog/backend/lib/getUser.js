import { clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

// Public display name: Clerk username, else full name, else the email's
// local part — never the full email address. Suffixed to stay unique.
export const uniqueUsername = async ({ username, firstName, lastName, email }) => {
  const base =
    (username ||
      [firstName, lastName].filter(Boolean).join("_") ||
      email?.split("@")[0] ||
      "user")
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "")
      .slice(0, 30) || "user";

  let candidate = base;
  let counter = 2;
  while (await User.exists({ username: candidate })) {
    candidate = `${base}${counter}`;
    counter++;
  }
  return candidate;
};

// Clerk's user.created webhook can't reach a local server, so fall back to
// creating the Mongo user from Clerk the first time we see their id.
const getUser = async (clerkUserId) => {
  const existingUser = await User.findOne({ clerkUserId });
  if (existingUser) return existingUser;

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress;

  return User.findOneAndUpdate(
    { clerkUserId },
    {
      $setOnInsert: {
        clerkUserId,
        username: await uniqueUsername({ ...clerkUser, email }),
        email,
        img: clerkUser.imageUrl,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
};

export default getUser;

// Prefer the role from the session token (requires a custom "metadata" claim
// in the Clerk dashboard); otherwise read it from the user's public metadata.
export const getRole = async (auth) => {
  const claimRole = auth.sessionClaims?.metadata?.role;
  if (claimRole) return claimRole;

  const clerkUser = await clerkClient.users.getUser(auth.userId);
  return clerkUser.publicMetadata?.role || "user";
};
