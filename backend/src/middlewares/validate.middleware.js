const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  throw new ApiError(httpStatus.BAD_REQUEST, "Validation failed", extractedErrors);
};

module.exports = validate;
