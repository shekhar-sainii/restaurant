const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }
    next();
  };
};

module.exports = requireRole;
