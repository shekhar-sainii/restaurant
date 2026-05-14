const xss = require("xss");

/**
 * Deep sanitize an object to prevent XSS and NoSQL injection
 * Mutates the object to avoid issues with read-only properties on req
 */
const deepSanitize = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach((key) => {
    // NoSQL Injection Protection (Basic)
    if (key.startsWith("$") || key.includes(".")) {
      const newKey = key.replace(/[\$.]/g, "");
      obj[newKey] = obj[key];
      delete obj[key];
      key = newKey;
    }

    const value = obj[key];

    if (typeof value === "string") {
      obj[key] = xss(value);
    } else if (typeof value === "object" && value !== null) {
      deepSanitize(value);
    }
  });
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) deepSanitize(req.body);
  if (req.query) deepSanitize(req.query);
  if (req.params) deepSanitize(req.params);
  next();
};

module.exports = [sanitizeMiddleware];
