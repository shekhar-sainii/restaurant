const config = require("../config/env.config");
const httpStatus = require("../utils/httpStatus");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }

  if (!message) {
    message = "Internal Server Error";
  }

  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
    console.error("Error Handler Caught:", err);
  }

  res.status(statusCode).send(response);
};

module.exports = errorHandler;
