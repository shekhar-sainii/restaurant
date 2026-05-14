const config = require("./env.config");
const { connectDatabase, disconnectDatabase } = require("./database.config");
const corsOptions = require("./cors.config");
const socketConfig = require("./socket.config");

module.exports = {
  config,
  connectDatabase,
  disconnectDatabase,
  corsOptions,
  socketConfig,
};
