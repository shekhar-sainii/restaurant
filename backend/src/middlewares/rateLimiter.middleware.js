const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // standard rate limit per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: "Too many incoming requests from this IP address, please retry after 15 minutes." },
});

const checkoutRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // stricter defense for checkout/payments/auth to prevent transaction abuse
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: "Maximum checkout or payment verification attempts reached. Please pause briefly." },
});

module.exports = {
  rateLimiter,
  checkoutRateLimiter,
};
