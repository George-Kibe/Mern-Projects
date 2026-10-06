import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// Signed-in users are limited per account, everyone else per IP
// (ipKeyGenerator groups IPv6 addresses by subnet).
const keyByUserOrIp = (req) => {
  const userId = req.auth?.()?.userId;
  return userId ? `user:${userId}` : `ip:${ipKeyGenerator(req.ip)}`;
};

const limiter = ({ windowMs, limit, message, methods }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: keyByUserOrIp,
    // Only count the methods this limiter is responsible for.
    skip: methods ? (req) => !methods.includes(req.method) : undefined,
    handler: (req, res, next, options) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.status(429).json({
        message,
        retryAfter: Number(res.getHeader("Retry-After")) || retryAfter,
      });
    },
  });

// Every API request: generous enough for fast browsing and pagination.
export const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: "Too many requests. Please slow down and try again shortly.",
});

// Any write (save, feature, delete, comment, post).
export const writeLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  methods: ["POST", "PUT", "PATCH", "DELETE"],
  message: "You're making changes too quickly. Please wait a moment.",
});

export const commentLimiter = limiter({
  windowMs: 60 * 1000,
  limit: 6,
  methods: ["POST"],
  message: "You're commenting too quickly. Please wait a minute.",
});

export const createPostLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  methods: ["POST"],
  message: "You've published a lot this hour. Please try again later.",
});

export const uploadLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: "Too many uploads. Please wait a few minutes.",
});
