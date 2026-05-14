const jwt = require("jsonwebtoken");
const config = require("../config/env.config");
const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");
const asyncHandler = require("../utils/asyncHandler");
const { User } = require("../models");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access token not found");
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Access token expired");
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token");
  }
});

module.exports = verifyAccessToken;
