const winston = require("winston");
const loggerOptions = require("../config/logger.config");

const logger = winston.createLogger(loggerOptions);

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
