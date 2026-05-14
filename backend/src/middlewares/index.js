const verifyAccessToken = require("./auth.middleware");
const requireRole = require("./role.middleware");
const guestOrUser = require("./guestOrUser.middleware");
const validate = require("./validate.middleware");
const upload = require("./upload.middleware");
const rateLimiter = require("./rateLimiter.middleware");
const sanitize = require("./sanitize.middleware");
const requestId = require("./requestId.middleware");
const requestLogger = require("./requestLogger.middleware");
const notFound = require("./notFound.middleware");
const errorHandler = require("./errorHandler.middleware");
const { resolveTenant, resolveTenantSoft } = require("./tenant.middleware");

module.exports = {
  verifyAccessToken,
  requireRole,
  guestOrUser,
  validate,
  upload,
  rateLimiter,
  sanitize,
  requestId,
  requestLogger,
  notFound,
  errorHandler,
  resolveTenant,
  resolveTenantSoft,
};
