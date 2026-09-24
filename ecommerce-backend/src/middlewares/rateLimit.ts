import rateLimit from "express-rate-limit";

// Cap auth attempts per IP to slow brute-force / credential-stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true, // send the RateLimit-* headers so clients can back off
  legacyHeaders: false,
});
