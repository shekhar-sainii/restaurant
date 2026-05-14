const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");

const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
};

module.exports = notFound;
