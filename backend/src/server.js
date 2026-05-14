const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { config, connectDatabase, socketConfig } = require("./config");
const logger = require("./utils/logger");
const initSocket = require("./sockets");
const socketManager = require("./sockets/socketManager");

const server = http.createServer(app);
const io = new Server(server, socketConfig);

// Initialize Sockets
initSocket(io);
socketManager.init(io);

// Connect to Database and start server
connectDatabase().then(() => {
  server.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
