const jwt = require("jsonwebtoken");
const config = require("../config/env.config");
const { User } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const guestOrUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.sub);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore invalid/expired tokens — treat as guest
    }
  }
  next();
});

module.exports = guestOrUser;
