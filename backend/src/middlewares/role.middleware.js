const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");
const ROLES = require("../common/constants/roles.constant");

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }
    // Super Admin has universal master authority across all administrative endpoints
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }
    next();
  };
};

module.exports = requireRole;
